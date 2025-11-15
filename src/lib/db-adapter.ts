import { supabase } from "@/integrations/supabase/client";

// Database adapter interface
export interface DBAdapter {
  fetchProducts: (userId: string) => Promise<any[]>;
  createProduct: (data: any) => Promise<any>;
  fetchEntryProducts: (userId: string) => Promise<any[]>;
  createEntryProduct: (data: any) => Promise<any>;
  fetchExitProducts: (userId: string) => Promise<any[]>;
  createExitProduct: (data: any) => Promise<any>;
  fetchUsedToday: (userId: string) => Promise<any[]>;
  createUsedToday: (data: any) => Promise<any>;
  fetchUsers: () => Promise<any[]>;
}

// Supabase adapter implementation
class SupabaseAdapter implements DBAdapter {
  async fetchProducts(userId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createProduct(data: any) {
    const { data: product, error } = await supabase
      .from('products')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return product;
  }

  
  async fetchEntryProducts(userId: string) {
  const { data, error } = await supabase
    .from('entry_products')
    .select(`
      *,
      products (name, unit)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}


  async createEntryProduct(data: any) {
    const { data: entry, error } = await supabase
      .from('entry_products')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return entry;
  }

  async fetchExitProducts(userId: string) {
    const { data, error } = await supabase
      .from('exit_products')
      .select(`
        *,
        entry_products (
          batch_number,
          products (name, unit)
        ),
        profiles!exit_products_assigned_to_fkey (full_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createExitProduct(data: any) {
    const { data: exit, error } = await supabase
      .from('exit_products')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return exit;
  }

async fetchUsedToday(userId: string) {
  const { data, error } = await supabase
    .from('used_today')
    .select(`
      id,
      quantity,
      notes,
      created_at,
      entry_products (
        products (name)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Flatten so UI can read item.product_name
  return (data || []).map((row: any) => ({
    id: row.id,
    quantity: row.quantity,
    notes: row.notes,
    created_at: row.created_at,
    product_name: row.entry_products?.products?.name ?? "Unknown product",
  }));
}


  async createUsedToday(data: any) {
    const { data: used, error } = await supabase
      .from('used_today')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return used;
  }

  async fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name');
    
    if (error) throw error;
    return data || [];
  }
}

// Factory function to get the Supabase adapter
export function getDBAdapter(): DBAdapter {
  return new SupabaseAdapter();
}
