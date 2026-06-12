-- ==========================================================================
-- LUNA TEIA COSMETICOS - FIX CONTRAPOSICION CLAVE FORANEA
-- Script: 08_fix_envio_fk.sql
-- Propósito: Corregir la restricción de clave foránea de la columna envio_id 
--            en pedidos_central para que referencie a la tabla orders(id)
--            (del e-commerce) en lugar de la tabla envios(id) (de logística).
-- ==========================================================================

-- 1) Eliminar la restricción incorrecta que apunta a 'envios'
ALTER TABLE public.pedidos_central
  DROP CONSTRAINT IF EXISTS pedidos_central_envio_id_fkey;

-- 2) Crear la nueva restricción que apunta correctamente a 'orders'
ALTER TABLE public.pedidos_central
  ADD CONSTRAINT pedidos_central_envio_id_fkey
  FOREIGN KEY (envio_id)
  REFERENCES public.orders(id)
  ON DELETE SET NULL;
