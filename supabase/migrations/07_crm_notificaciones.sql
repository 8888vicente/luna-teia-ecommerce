-- ==========================================================================
-- LUNA TEIA COSMETICOS - NOTIFICACIONES Y CORREO
-- Script: 07_crm_notificaciones.sql
-- Propósito: Añadir columna cliente_email a pedidos_central para soportar Resend
-- ==========================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pedidos_central' AND column_name = 'cliente_email'
  ) THEN
    ALTER TABLE pedidos_central ADD COLUMN cliente_email TEXT DEFAULT NULL;
  END IF;
END $$;
