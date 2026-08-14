import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ConciergeGateModal } from "@/components/site/ConciergeGateModal";

/** Sends signed-in users to the concierge, everyone else to the sign-in gate modal. */
export function useConciergeGate() {
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);

  const openConcierge = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) navigate({ to: "/concierge" });
    else setGateOpen(true);
  }, [navigate]);

  const gate = gateOpen ? <ConciergeGateModal onClose={() => setGateOpen(false)} /> : null;

  return { openConcierge, gate };
}
