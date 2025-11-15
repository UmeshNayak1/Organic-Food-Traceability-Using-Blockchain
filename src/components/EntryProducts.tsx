import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Package, QrCode, Calendar, User } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import QRCodeDialog from "./QRCodeDialog";
import { supabase } from "@/integrations/supabase/client";

/* ---------------------------
   Validation schema
--------------------------- */
const entrySchema = z.object({
  product_id: z.string().min(1, "Please select a product"),
  quantity: z.number().positive("Quantity must be positive"),
  batch_number: z.string().min(3, "Batch number is required").max(50),
  received_from: z.string().optional(),
  notes: z.string().max(500).optional(),
});

/* ---------------------------
   Types
--------------------------- */
interface ProductRow {
  id: string;
  name: string;
}

interface ProfileRow {
  id: string;
  full_name: string;
}

interface RawEntryRow {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  batch_number: string;
  notes?: string | null;
  created_at: string;
  received_from?: string | null;
}

interface EntryRow extends RawEntryRow {
  products?: { name: string } | null;
  profiles?: { full_name: string } | null;
}

interface EntryProductsProps {
  userId: string;
}

/* ---------------------------
   Component
--------------------------- */
const EntryProducts = ({ userId }: EntryProductsProps) => {
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [qrDialog, setQrDialog] = useState({
    open: false,
    batch: "",
    product: "",
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      /* 1) Fetch entries (flat only) */
      const { data: rawEntries, error: entriesError } = await supabase
        .from("entry_products")
        .select(
          "id,user_id,product_id,quantity,batch_number,notes,created_at,received_from"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (entriesError) throw entriesError;

      /* 2) Fetch ALL products (no filtering anymore) */
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id,name");

      if (productsError) throw productsError;

      /* 3) Fetch all profiles */
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id,full_name");

      if (usersError) throw usersError;

      /* 4) Build lookup maps */
      const productMap = new Map<string, string>();
      (productsData || []).forEach((p: ProductRow) =>
        productMap.set(p.id, p.name)
      );

      const profileMap = new Map<string, string>();
      (usersData || []).forEach((u: ProfileRow) =>
        profileMap.set(u.id, u.full_name)
      );

      /* 5) Merge names into entries */
      const merged: EntryRow[] = (rawEntries || []).map((r: RawEntryRow) => ({
        ...r,
        products: r.product_id
          ? { name: productMap.get(r.product_id) ?? "Unknown product" }
          : null,
        profiles: r.received_from
          ? { full_name: profileMap.get(r.received_from) ?? "Unknown user" }
          : null,
      }));

      /* 6) Apply state */
      setEntries(merged);
      setProducts((productsData as ProductRow[]) || []);
      setUsers((usersData as ProfileRow[]) || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error("Failed to load data");
      setEntries([]);
      setProducts([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const payload = {
      product_id: selectedProduct,
      quantity: Number(form.get("quantity")),
      batch_number: (form.get("batch_number") as string) || "",
      received_from: selectedUser || null,
      notes: (form.get("notes") as string) || null,
    };

    try {
      entrySchema.parse(payload);
      setLoading(true);

      const { error } = await supabase.from("entry_products").insert({
        ...payload,
        user_id: userId,
      });

      if (error) throw error;

      toast.success("Entry product added successfully");
      setShowForm(false);
      setSelectedProduct("");
      setSelectedUser("");
      e.currentTarget.reset();
      await fetchData();
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        console.error("Insert error:", err);
        toast.error("Failed to add entry product");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Entry Products</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Product selector */}
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No products found
                      </SelectItem>
                    ) : (
                      products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input name="quantity" type="number" step="0.01" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch Number *</Label>
                <Input name="batch_number" required />
              </div>

              <div className="space-y-2">
                <Label>Received From</Label>
                <Select
                  value={selectedUser}
                  onValueChange={setSelectedUser}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                name="notes"
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Entry"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Entries list */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No entry products yet</p>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card
              key={entry.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {entry.products?.name ?? "Unknown product"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Batch: {entry.batch_number}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-medium">Qty: {entry.quantity}</p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setQrDialog({
                            open: true,
                            batch: entry.batch_number,
                            product: entry.products?.name ?? "",
                          })
                        }
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                    {entry.profiles?.full_name && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Received From
                        </p>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="w-3 h-3" />
                          {entry.profiles.full_name}
                        </div>
                      </div>
                    )}

                    {entry.created_at && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Date
                        </p>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {format(
                            new Date(entry.created_at),
                            "MMM dd, yyyy"
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {entry.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">
                        Notes
                      </p>
                      <p className="text-sm">{entry.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <QRCodeDialog
        open={qrDialog.open}
        onOpenChange={(open) =>
          setQrDialog({ ...qrDialog, open })
        }
        batchNumber={qrDialog.batch}
        productName={qrDialog.product}
      />
    </div>
  );
};

export default EntryProducts;
