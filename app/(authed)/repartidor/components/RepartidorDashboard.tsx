'use client';

import { useState, useEffect, useTransition } from 'react';
import dynamic from 'next/dynamic';
import type { PedidoParaRuta, ResumenRuta } from '@/lib/reparto/types';
import type { PedidoEstatus } from '@/lib/crm/types';
import { ResumenDia } from './ResumenDia';
import { OfflineIndicator } from './OfflineIndicator';
import { BotonOptimizar } from './BotonOptimizar';
import { ListaParadas } from './ListaParadas';
import { TarjetaEntrega } from './TarjetaEntrega';
import { optimizeRoute } from '@/lib/maps/routing';
import { guardarOrdenRutaAction } from '@/lib/reparto/actions';
import { actualizarEstatusPedidoAction } from '@/lib/crm/actions';
import { addOfflineAction, getOfflineQueue } from '@/lib/reparto/offlineQueue';
import styles from './RepartidorDashboard.module.css';

// Dynamic import for Leaflet map component to prevent SSR issues (window is not defined)
const MapaRuta = dynamic(() => import('./MapaRuta'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading}>
      <span className={styles.spinner} />
      <p>Cargando mapa de entregas...</p>
    </div>
  ),
});

type Props = {
  initialPedidos: PedidoParaRuta[];
  repartidorId: string;
};

export function RepartidorDashboard({ initialPedidos, repartidorId }: Props) {
  const [pedidos, setPedidos] = useState<PedidoParaRuta[]>(initialPedidos);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [activePedidoId, setActivePedidoId] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  // Sync state with localStorage queue (if there are items queued offline, apply their status locally)
  useEffect(() => {
    const queue = getOfflineQueue();
    if (queue.length > 0) {
      setPedidos((current) =>
        current.map((p) => {
          const queued = queue.find((q) => q.pedidoId === p.id);
          if (queued) {
            return { ...p, estatus_pedido: queued.nuevoEstatus };
          }
          return p;
        })
      );
    }
  }, []);

  // Calculate KPIs locally based on current state of pedidos
  const calculateResumen = (): ResumenRuta => {
    let entregados = 0;
    let pendientes = 0;
    let cancelados = 0;
    let ausentes = 0;
    let monto_cobrado = 0;
    let monto_pendiente = 0;

    pedidos.forEach((p) => {
      const totalPedido = p.productos.reduce((acc, prod) => acc + prod.precio_unitario * prod.cantidad, 0);

      if (p.estatus_pedido === 'entregado') {
        entregados++;
        monto_cobrado += p.monto_pagado || totalPedido;
      } else if (p.estatus_pedido === 'pendiente' || p.estatus_pedido === 'en_ruta') {
        pendientes++;
        monto_pendiente += totalPedido;
      } else if (p.estatus_pedido === 'cancelado') {
        cancelados++;
      } else if (p.estatus_pedido === 'ausente') {
        ausentes++;
        monto_pendiente += totalPedido;
      }
    });

    return {
      total_pedidos: pedidos.length,
      entregados,
      pendientes,
      cancelados,
      ausentes,
      monto_cobrado,
      monto_pendiente,
    };
  };

  const resumen = calculateResumen();

  // Find next stop (first incomplete order)
  const nextPedido = pedidos.find((p) =>
    ['pendiente', 'en_ruta'].includes(p.estatus_pedido)
  );

  // Handles updating the delivery status, supporting offline mode
  const handleEstatusChange = async (
    pedidoId: string,
    nuevoEstatus: 'entregado' | 'ausente' | 'cancelado'
  ): Promise<{ ok: boolean; error?: string }> => {
    setErrorGlobal(null);

    // Si está offline, lo agregamos a la cola offline
    if (typeof window !== 'undefined' && !navigator.onLine) {
      addOfflineAction(pedidoId, nuevoEstatus);
      
      // Actualizamos el estado local de forma inmediata para dar feedback visual al repartidor
      setPedidos((current) =>
        current.map((p) =>
          p.id === pedidoId ? { ...p, estatus_pedido: nuevoEstatus } : p
        )
      );

      // Si el pedido modificado era el activo en el mapa, limpiamos la selección
      if (activePedidoId === pedidoId) {
        setActivePedidoId(null);
      }

      return { ok: true };
    }

    // Si está online, llamamos a la server action
    try {
      const res = await actualizarEstatusPedidoAction(pedidoId, nuevoEstatus as any);
      if (res.ok) {
        // Actualizamos estado local
        setPedidos((current) =>
          current.map((p) =>
            p.id === pedidoId ? { ...p, estatus_pedido: nuevoEstatus } : p
          )
        );

        if (activePedidoId === pedidoId) {
          setActivePedidoId(null);
        }

        return { ok: true };
      } else {
        return { ok: false, error: res.error };
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Error al conectar con el servidor',
      };
    }
  };

  // Optimizes the delivery route using OSRM Trip API
  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    setErrorGlobal(null);

    // Obtener los pedidos que faltan por entregar (pendientes y en_ruta)
    const incompletePedidos = pedidos.filter((p) =>
      ['pendiente', 'en_ruta'].includes(p.estatus_pedido) && p.coords !== null
    );

    if (incompletePedidos.length < 2) {
      setErrorGlobal('Necesitas al menos 2 pedidos pendientes con coordenadas válidas para optimizar.');
      setIsOptimizing(false);
      return;
    }

    // Origen por defecto (ubicación actual o la primera parada actual)
    let origin = incompletePedidos[0].coords!;

    // Si tenemos geolocalización activa, intentamos usar la posición actual como origen
    if (navigator.geolocation) {
      const getPos = () =>
        new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 3000,
          });
        });

      try {
        const pos = await getPos();
        origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (err) {
        console.warn('No se pudo obtener ubicación actual para el inicio del recorrido, usando la coordenada del primer pedido.');
      }
    }

    const destinations = incompletePedidos.map((p) => p.coords!);

    // Optimizamos usando OSRM
    const res = await optimizeRoute(origin, destinations);
    if (!res.ok || !res.optimizedOrder) {
      setErrorGlobal(res.error ?? 'Error al optimizar la ruta con OSRM.');
      setIsOptimizing(false);
      return;
    }

    // Reordenamos las paradas incompletas basadas en el orden sugerido por OSRM
    const orderedIncompleteIds = res.optimizedOrder.map(
      (idx) => incompletePedidos[idx].id
    );

    // Construimos la actualización masiva de orden_ruta
    // Los pedidos ya entregados/cancelados/ausentes mantienen su orden_ruta
    // o se les asigna uno al principio, pero lo ideal es re-enumerar los incompletos empezando desde 1.
    const updates: { id: string; orden_ruta: number }[] = [];
    
    // Contamos cuántos pedidos completados hay
    const completedCount = pedidos.filter((p) =>
      ['entregado', 'cancelado', 'ausente'].includes(p.estatus_pedido)
    ).length;

    // Asignamos el orden consecutivo
    orderedIncompleteIds.forEach((id, index) => {
      updates.push({ id, orden_ruta: completedCount + index + 1 });
    });

    // Guardamos en la base de datos usando Server Action
    startTransition(async () => {
      const dbRes = await guardarOrdenRutaAction(updates);
      setIsOptimizing(false);

      if (dbRes.ok) {
        // Actualizamos localmente el orden_ruta de los pedidos
        setPedidos((current) => {
          const updated = current.map((p) => {
            const up = updates.find((u) => u.id === p.id);
            return up ? { ...p, orden_ruta: up.orden_ruta } : p;
          });
          // Volvemos a ordenar la lista completa por orden_ruta
          return [...updated].sort((a, b) => {
            if (a.orden_ruta === null) return 1;
            if (b.orden_ruta === null) return -1;
            return a.orden_ruta - b.orden_ruta;
          });
        });
      } else {
        setErrorGlobal(dbRes.error);
      }
    });
  };

  // Coordenadas para dibujar la polilínea de la ruta
  // Enlaza los marcadores en el orden orden_ruta actual
  const routeCoordinates: [number, number][] = pedidos
    .filter((p) => p.coords !== null && ['pendiente', 'en_ruta'].includes(p.estatus_pedido))
    .sort((a, b) => (a.orden_ruta ?? 999) - (b.orden_ruta ?? 999))
    .map((p) => [p.coords!.lat, p.coords!.lng]);

  const activePedido = pedidos.find((p) => p.id === activePedidoId);

  // Determinar si ya está optimizado (si al menos un pedido incompleto tiene orden_ruta)
  const isOptimized = pedidos.some(
    (p) => ['pendiente', 'en_ruta'].includes(p.estatus_pedido) && p.orden_ruta !== null
  );

  return (
    <div className={styles.dashboard}>
      <ResumenDia
        resumen={resumen}
        duration={null} // OSRM trip da duración, pero al recargar página se pierde. Podríamos estimarlo o persistirlo.
        distance={null}
        isOptimized={isOptimized}
      />
      
      <OfflineIndicator />

      {errorGlobal && (
        <div className={styles.errorGlobal} role="alert">
          {errorGlobal}
          <button onClick={() => setErrorGlobal(null)} className={styles.closeErr}>×</button>
        </div>
      )}

      {/* Tabs de Navegación del Dashboard */}
      <div className={styles.tabBar}>
        <button
          onClick={() => setActiveTab('map')}
          className={[styles.tabBtn, activeTab === 'map' ? styles.tabActive : ''].join(' ')}
        >
          🗺️ Vista Mapa
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={[styles.tabBtn, activeTab === 'list' ? styles.tabActive : ''].join(' ')}
        >
          📋 Lista Paradas
        </button>
      </div>

      <div className={styles.mainContent}>
        {activeTab === 'map' ? (
          <div key="map-view-wrapper" className={styles.mapContainer}>
            <MapaRuta
              pedidos={pedidos}
              routeCoordinates={routeCoordinates}
              activePedidoId={activePedidoId}
              onSelectPedido={setActivePedidoId}
            />

            {/* Bottom Sheet Card en el Mapa */}
            <div className={styles.mapOverlay}>
              {activePedido ? (
                <div className={styles.overlayWrapper}>
                  <header className={styles.overlayHeader}>
                    <h4>Parada Seleccionada</h4>
                    <button onClick={() => setActivePedidoId(null)} className={styles.closeOverlay}>
                      Cerrar
                    </button>
                  </header>
                  <TarjetaEntrega
                    pedido={activePedido}
                    isNext={activePedido.id === nextPedido?.id}
                    onEstatusChange={handleEstatusChange}
                  />
                </div>
              ) : nextPedido ? (
                <div className={styles.overlayWrapper}>
                  <header className={styles.overlayHeader}>
                    <h4>Siguiente Parada Activa</h4>
                  </header>
                  <TarjetaEntrega
                    pedido={nextPedido}
                    isNext={true}
                    onEstatusChange={handleEstatusChange}
                  />
                </div>
              ) : (
                <div className={styles.noMoreDeliveries}>
                  🎉 ¡Felicidades! Has completado todas tus entregas de hoy.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div key="list-view-wrapper" className={styles.listContainer}>
            <BotonOptimizar
              onOptimize={handleOptimizeRoute}
              isOptimizing={isOptimizing || isPending}
              isOptimized={isOptimized}
              disabled={pedidos.filter((p) => ['pendiente', 'en_ruta'].includes(p.estatus_pedido)).length < 2}

            />
            <div className={styles.listScroll}>
              <ListaParadas
                pedidos={pedidos}
                onEstatusChange={handleEstatusChange}
                activePedidoId={activePedidoId}
                onSelectPedido={setActivePedidoId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
