'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { PedidoParaRuta } from '@/lib/reparto/types';
import { buildSingleNavLink } from '@/lib/maps/routing';
import 'leaflet/dist/leaflet.css';
import styles from './MapaRuta.module.css';

// Fix Leaflet icons issues by using DivIcon
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

const userIcon = L.divIcon({
  className: 'user-position-marker',
  html: `
    <div style="
      width: 16px;
      height: 16px;
      background-color: #2563eb;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(37, 99, 235, 0.8);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

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
  routeCoordinates: [number, number][];
  activePedidoId: string | null;
  onSelectPedido: (pedidoId: string) => void;
};

export default function MapaRuta({
  pedidos,
  routeCoordinates,
  activePedidoId,
  onSelectPedido,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
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

  if (userPos) {
    bounds.push(userPos);
  }

  // Centro por defecto en Cd. Juárez si no hay marcadores
  const defaultCenter: [number, number] = [31.6904, -106.4245];

  if (!mounted) {
    return (
      <div className={styles.mapWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: '0.9rem' }}>
        <p>Inicializando mapa de reparto...</p>
      </div>
    );
  }

  return (
    <div className={styles.mapWrapper}>

      <MapContainer
        key="lunateia-leaflet-map-element"
        center={bounds.length > 0 ? bounds[0] : defaultCenter}
        zoom={12}
        className={styles.map}
        zoomControl={false}
      >

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {bounds.length > 0 && <ChangeView bounds={bounds} />}

        {/* Marcador de ubicación del repartidor */}
        {userPos && (
          <Marker position={userPos} icon={userIcon}>
            <Popup>
              <span className={styles.popupTitle}>Tu ubicación actual</span>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de entregas */}
        {markers.map((p) => {
          const isNext = p.id === nextPedido?.id;
          const navUrl = buildSingleNavLink(p.coords!.lat, p.coords!.lng);
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
                  <strong className={styles.popupName}>{p.cliente_nombre}</strong>
                  <p className={styles.popupAddress}>{p.direccion}</p>
                  {p.orden_ruta !== null && (
                    <span className={styles.popupStop}>Parada #{p.orden_ruta}</span>
                  )}
                  <div className={styles.popupActions}>
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.popupBtn}
                    >
                      🗺️ Navegar
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Polilínea de la ruta optimizada */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#2563eb"
            weight={4}
            opacity={0.7}
            dashArray="5, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}
