-- 1. Lock down SECURITY DEFINER / trigger functions from API callers
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 2. vaulted_cards: explicit deny-all for API roles, admin read only
ALTER TABLE public.vaulted_cards ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.vaulted_cards FROM anon, authenticated;
GRANT ALL ON public.vaulted_cards TO service_role;
DROP POLICY IF EXISTS "Admins read vaulted cards" ON public.vaulted_cards;
CREATE POLICY "Admins read vaulted cards" ON public.vaulted_cards
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- 3. verification_requests: admin-only access via API
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.verification_requests FROM anon;
GRANT SELECT, UPDATE ON public.verification_requests TO authenticated;
GRANT ALL ON public.verification_requests TO service_role;
DROP POLICY IF EXISTS "Admins read verification requests" ON public.verification_requests;
CREATE POLICY "Admins read verification requests" ON public.verification_requests
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins update verification requests" ON public.verification_requests;
CREATE POLICY "Admins update verification requests" ON public.verification_requests
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- 4. storage.objects policies for the private verification-docs bucket
DROP POLICY IF EXISTS "Admins read verification docs" ON storage.objects;
CREATE POLICY "Admins read verification docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'verification-docs' AND private.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins manage verification docs" ON storage.objects;
CREATE POLICY "Admins manage verification docs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'verification-docs' AND private.has_role(auth.uid(), 'admin'::app_role));

-- 5. passengers: allow admins to insert as well as booking owners
DROP POLICY IF EXISTS "Passengers via own booking" ON public.passengers;
CREATE POLICY "Passengers via own booking" ON public.passengers
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = passengers.booking_id AND (b.user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'::app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = passengers.booking_id AND (b.user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'::app_role))));

-- 6. deals: keep public read but only for live (non-expired) marketing deals
DROP POLICY IF EXISTS "Deals are public" ON public.deals;
CREATE POLICY "Deals are public" ON public.deals
  FOR SELECT TO anon, authenticated
  USING (expires_at IS NULL OR expires_at > now());