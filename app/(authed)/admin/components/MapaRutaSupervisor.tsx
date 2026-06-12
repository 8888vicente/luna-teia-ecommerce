'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { PedidoParaRuta } from '@/lib/reparto/types';
import 'leaflet/dist/leaflet.css';
import styles from './MapaRutaSupervisor.module.css';

// Leaflet marker styling using divIcon
const createMarkerIcon = (status: string, orderNumber: number | null, isNext: boolean) => {
  let color = '#3b82f6'; // blue (pendiente)
  if (isNext) color = '#d97706'; // amber/yellow (siguiente)
  else if (status === 'entregado') color = '#10b981'; // green
  else if (status === 'cancelado') color = '#ef4444'; // red
  else if (status === 'ausente') color = '#6b7280'; // gray

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 11px;
          font-family: sans-serif;
        ">
          ${orderNumber !== null ? orderNumber : ''}
        </span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

type ChangeViewProps = {
  bounds: [number, number][];
};

function ChangeView({ bounds }: ChangeViewProps) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [bounds, map]);
  return null;
}

type Props = {
  pedidos: PedidoParaRuta[];
  activePedidoId: string | null;
  onSelectPedido: (pedidoId: string) => void;
};

export default function MapaRutaSupervisor({
  pedidos,
  activePedidoId,
  onSelectPedido,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  // Filtrar pedidos con coordenadas válidas para marcadores
  const markers = pedidos.filter((p) => p.coords !== null);

  // Determinar la siguiente parada (primer pedido incompleto)
  const nextPedido = pedidos.find((p) =>
    ['pendiente', 'en_ruta'].includes(p.estatus_pedido)
  );

  // Calcular bounds para ajustar la vista
  const bounds: [number, number][] = markers.map((m) => [
    m.coords!.lat,
    m.coords!.lng,
  ]);

  // Centro por defecto en Cd. Juárez si no hay marcadores
  const defaultCenter: [number, number] = [31.6904, -106.4245];

  // Coordenadas para dibujar la polilínea (conecta paradas activas)
  const routeCoordinates: [number, number][] = pedidos
    .filter((p) => p.coords !== null && ['pendiente', 'en_ruta'].includes(p.estatus_pedido))
    .map((p) => [p.coords!.lat, p.coords!.lng]);

  if (!mounted) {
    return (
      <div className={styles.mapLoading}>
        <p>Inicializando mapa de supervisión...</p>
      </div>
    );
  }

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        key={`supervisor-map-${pedidos.length}`}
        center={bounds.length > 0 ? bounds[0] : defaultCenter}
        zoom={12}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {bounds.length > 0 && <ChangeView bounds={bounds} />}

        {/* Marcadores de entregas */}
        {markers.map((p) => {
          const isNext = p.id === nextPedido?.id;
          const isActive = p.id === activePedidoId;
          const orderTotal = p.productos.reduce((acc, prod) => acc + prod.precio_unitario * prod.cantidad, 0);

          return (
            <Marker
              key={p.id}
              position={[p.coords!.lat, p.coords!.lng]}
              icon={createMarkerIcon(p.estatus_pedido, p.orden_ruta, isNext)}
              eventHandlers={{
                click: () => onSelectPedido(p.id),
              }}
            >
              <Popup>
                <div className={styles.popupContent}>
                  <header className={styles.popupHeader}>
                    <strong className={styles.popupName}>{p.cliente_nombre}</strong>
                    <span className={[styles.statusBadge, styles[p.estatus_pedido]].join(' ')}>
                      {p.estatus_pedido}
                    </span>
                  </header>
                  <p className={styles.popupAddress}>📍 {p.direccion}</p>
                  {p.referencias && <p className={styles.popupRefs}><em>Ref:</em> {p.referencias}</p>}
                  
                  <div className={styles.popupMeta}>
                    <span>Monto: <strong>${orderTotal}</strong></span>
                    {p.orden_ruta !== null && (
                      <span className={styles.popupStop}>Parada #{p.orden_ruta}</span>
                    )}
                  </div>

                  {p.notas_repartidor && (
                    <div className={styles.popupNotes}>
                      <strong>Notas:</strong> {p.notas_repartidor}
                    </div>
                  )}

                  <div className={styles.popupActions}>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${p.coords!.lat},${p.coords!.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.popupBtn}
                    >
                      🗺️ Ver en Google Maps
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Polilínea de la ruta activa */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#2563eb"
            weight={4}
            opacity={0.6}
            dashArray="5, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}
