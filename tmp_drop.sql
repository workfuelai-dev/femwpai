-- Desactivar dependencias
begin;

-- Borrar objetos si existen
DROP VIEW IF EXISTS public.conversations_with_contacts CASCADE;
DROP TABLE IF EXISTS public.attachments CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;

commit;
