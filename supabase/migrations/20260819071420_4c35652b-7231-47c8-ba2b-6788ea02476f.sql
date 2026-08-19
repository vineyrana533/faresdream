CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  token text NOT NULL UNIQUE,
  customer_name text,
  customer_email text,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  id_front_path text,
  id_back_path text,
  selfie_path text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.verification_requests TO service_role;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.vaulted_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  verification_request_id uuid REFERENCES public.verification_requests(id) ON DELETE SET NULL,
  cardholder_name text,
  brand text,
  last4 text,
  exp_month text,
  exp_year text,
  ciphertext text NOT NULL,
  iv text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.vaulted_cards TO service_role;
ALTER TABLE public.vaulted_cards ENABLE ROW LEVEL SECURITY;

CREATE INDEX verification_requests_booking_idx ON public.verification_requests(booking_id);
CREATE INDEX vaulted_cards_booking_idx ON public.vaulted_cards(booking_id);

ALTER TABLE public.fare_leads ADD COLUMN IF NOT EXISTS crm_status text NOT NULL DEFAULT 'new';
ALTER TABLE public.fare_leads ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.corporate_leads ADD COLUMN IF NOT EXISTS crm_status text NOT NULL DEFAULT 'new';
ALTER TABLE public.corporate_leads ADD COLUMN IF NOT EXISTS admin_notes text;