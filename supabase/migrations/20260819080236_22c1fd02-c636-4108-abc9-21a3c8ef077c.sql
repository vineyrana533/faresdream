DROP POLICY IF EXISTS "Tickets via own booking" ON public.tickets;

CREATE POLICY "Admins read tickets"
ON public.tickets FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert tickets"
ON public.tickets FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update tickets"
ON public.tickets FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete tickets"
ON public.tickets FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));