CREATE SEQUENCE IF NOT EXISTS public.booking_reference_seq START WITH 100000 INCREMENT BY 1 MINVALUE 100000 NO MAXVALUE CACHE 1;

CREATE OR REPLACE FUNCTION public.next_booking_reference()
RETURNS text
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'FDRM-' || nextval('public.booking_reference_seq')::text;
$$;

REVOKE ALL ON FUNCTION public.next_booking_reference() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_booking_reference() TO service_role;
REVOKE ALL ON SEQUENCE public.booking_reference_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.booking_reference_seq TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_pnr_unique ON public.bookings (pnr) WHERE pnr IS NOT NULL;