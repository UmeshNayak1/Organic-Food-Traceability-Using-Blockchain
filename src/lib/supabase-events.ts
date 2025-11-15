// src/lib/supabase-events.ts
import { supabase } from "@/integrations/supabase/client";

export async function createSupplyChainEvent(payload: {
  product_id?: string | null;
  batch_number: string;
  event_type: string;
  from_user?: string | null;
  to_user?: string | null;
  quantity?: number | null;
  location?: string | null;
  metadata?: any;
}) {
  const { data, error } = await supabase
    .from("supply_chain_events")
    .insert([
      {
        product_id: payload.product_id,
        batch_number: payload.batch_number,
        event_type: payload.event_type,
        from_user: payload.from_user,
        to_user: payload.to_user,
        quantity: payload.quantity,
        location: payload.location,
        metadata: payload.metadata ?? {},
      },
    ]);

  if (error) throw error;
  return data;
}
