'use client';

import { useEffect, useState } from 'react';
import { getOfflineQueue, syncOfflineQueue } from '@/lib/reparto/offlineQueue';
import styles from './OfflineIndicator.module.css';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueLength, setQueueLength] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    setQueueLength(getOfflineQueue().length);

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Interval to poll localStorage queue length
    const interval = setInterval(() => {
      setQueueLength(getOfflineQueue().length);
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = async () => {
    if (isSyncing || !navigator.onLine) return;
    const pending = getOfflineQueue().filter((item) => !item.synced);
    if (pending.length === 0) return;

    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      const result = await syncOfflineQueue(
        (pedidoId, estatus) => {
          console.log(`Pedido ${pedidoId} sincronizado con éxito como ${estatus}`);
        },
        (pedidoId, err) => {
          console.error(`Fallo al sincronizar pedido ${pedidoId}:`, err);
        }
      );

      if (result.failedCount === 0) {
        setSyncStatus('success');
      } else {
        setSyncStatus('error');
      }
      setQueueLength(getOfflineQueue().length);
    } catch (error) {
      console.error('Error durante la sincronización offline:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  if (isOnline && queueLength === 0 && syncStatus !== 'success') {
    return null; // Don't show anything if online and fully synced
  }

  return (
    <div
      className={[
        styles.bar,
        !isOnline ? styles.offline : '',
        isSyncing ? styles.syncing : '',
        syncStatus === 'success' ? styles.success : '',
        syncStatus === 'error' ? styles.error : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.content}>
        {!isOnline ? (
          <>
            <span className={styles.icon}>⚠️</span>
            <span>Sin conexión — Las entregas se guardarán localmente ({queueLength} pendientes)</span>
          </>
        ) : isSyncing ? (
          <>
            <span className={styles.spinner} />
            <span>Sincronizando {queueLength} entregas con el servidor...</span>
          </>
        ) : syncStatus === 'success' ? (
          <>
            <span className={styles.icon}>✅</span>
            <span>¡Entregas sincronizadas con éxito!</span>
          </>
        ) : (
          <>
            <span className={styles.icon}>🔄</span>
            <span>Tienes {queueLength} entregas sin sincronizar.</span>
            <button onClick={triggerSync} className={styles.syncBtn} disabled={isSyncing}>
              Sincronizar ahora
            </button>
          </>
        )}
      </div>
    </div>
  );
}
