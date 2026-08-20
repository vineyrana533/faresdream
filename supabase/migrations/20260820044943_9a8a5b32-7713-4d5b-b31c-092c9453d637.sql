
-- Ensure RLS is on (fail-closed) for all sensitive server-only tables
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_reveal_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaulted_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.staff_users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.card_reveal_audit FORCE ROW LEVEL SECURITY;

-- These tables are only ever accessed by server-side code using the service role.
-- Remove any Data API access for anon/authenticated so no client can read or write them.
REVOKE ALL ON public.staff_users FROM anon, authenticated;
REVOKE ALL ON public.card_reveal_audit FROM anon, authenticated;
REVOKE ALL ON public.vaulted_cards FROM anon, authenticated;
REVOKE ALL ON public.verification_requests FROM anon, authenticated;

GRANT ALL ON public.staff_users TO service_role;
GRANT ALL ON public.card_reveal_audit TO service_role;
GRANT ALL ON public.vaulted_cards TO service_role;
GRANT ALL ON public.verification_requests TO service_role;

-- Drop now-unreachable client policies and replace with explicit deny-all documentation policies
DROP POLICY IF EXISTS "Admins read vaulted cards" ON public.vaulted_cards;
DROP POLICY IF EXISTS "Admins read verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins update verification requests" ON public.verification_requests;

CREATE POLICY "Server-side access only" ON public.staff_users
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Server-side access only" ON public.card_reveal_audit
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Server-side access only" ON public.vaulted_cards
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Server-side access only" ON public.verification_requests
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
