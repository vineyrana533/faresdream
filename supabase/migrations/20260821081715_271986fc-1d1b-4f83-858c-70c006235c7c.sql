-- Admin management policies for lead tables
CREATE POLICY "Admins update corporate leads"
ON public.corporate_leads FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete corporate leads"
ON public.corporate_leads FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update fare leads"
ON public.fare_leads FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete fare leads"
ON public.fare_leads FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

GRANT UPDATE, DELETE ON public.corporate_leads TO authenticated;
GRANT UPDATE, DELETE ON public.fare_leads TO authenticated;

-- Explicit admin-only write policies on the private verification-docs bucket
DROP POLICY IF EXISTS "Admins upload verification docs" ON storage.objects;
CREATE POLICY "Admins upload verification docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'verification-docs' AND private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update verification docs" ON storage.objects;
CREATE POLICY "Admins update verification docs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'verification-docs' AND private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'verification-docs' AND private.has_role(auth.uid(), 'admin'::app_role));