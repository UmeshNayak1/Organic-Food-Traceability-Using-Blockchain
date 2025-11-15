import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowRight, Package, Leaf } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SupplyChainEvent {
  id: string;
  event_type: string;
  timestamp: string;
  from_user: any;
  to_user: any;
  quantity: number;
}

const Food = () => {
  const [searchType, setSearchType] = useState<"batch" | "product">("batch");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [productInfo, setProductInfo] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error(`Please enter a ${searchType === "batch" ? "batch number" : "product name"}`);
      return;
    }

    setLoading(true);
    setEvents([]);
    setProductInfo(null);

    try {
      let product = null;

      // STEP 1: Find Product by NAME or by BATCH → Then get product_id
      if (searchType === "product") {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .ilike("name", `%${searchValue}%`)
          .limit(1)
          .single();

        if (productError || !productData) {
          toast.error("No product found");
          return;
        }

        product = productData;
      }

      if (searchType === "batch") {
        // First get supply chain event to get product_id
        const { data: batchEvent, error: batchErr } = await supabase
          .from("supply_chain_events")
          .select("product_id")
          .eq("batch_number", searchValue)
          .limit(1)
          .single();

        if (batchErr || !batchEvent) {
          toast.error("No batch found");
          return;
        }

        // Now get product info
        const { data: productData, error: productErr } = await supabase
          .from("products")
          .select("*")
          .eq("id", batchEvent.product_id)
          .single();

        if (productErr || !productData) {
          toast.error("Product not found for this batch");
          return;
        }

        product = productData;
      }

      setProductInfo(product);

      // STEP 2: Get supply chain events for this PRODUCT
      const { data: eventsData, error: eventsErr } = await supabase
        .from("supply_chain_events")
        .select(`
          id,
          event_type,
          timestamp,
          quantity,
          from_user:from_user(full_name),
          to_user:to_user(full_name),
          batch_number
        `)
        .eq("product_id", product.id)
        .order("timestamp", { ascending: true });

      if (eventsErr) {
        console.error(eventsErr);
        toast.error("Error loading supply chain events");
        return;
      }

      if (!eventsData || eventsData.length === 0) {
        toast.error("No supply chain events found");
        return;
      }

      setEvents(eventsData);
      toast.success("Supply chain loaded");

    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Organic Food Traceability</span>
          </Link>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Track Your Food</h1>
            <p className="text-lg text-muted-foreground">
              Search by batch number or product name to view the complete supply chain journey
            </p>
          </div>

          {/* Search */}
          <Card className="p-6 mb-8">
            <div className="space-y-4">
              <Select
                value={searchType}
                onValueChange={(value: "batch" | "product") => setSearchType(value)}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Search by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch">Batch Number</SelectItem>
                  <SelectItem value="product">Product Name</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  placeholder={
                    searchType === "batch"
                      ? "Enter batch number (e.g., BATCH-001)"
                      : "Enter product name (e.g., Organic Tomatoes)"
                  }
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Product Info */}
          {productInfo && (
            <Card className="p-6 mb-8 bg-primary/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{productInfo.name}</h2>
                  <p className="text-muted-foreground mb-4">{productInfo.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-semibold">{productInfo.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Origin</p>
                      <p className="font-semibold">{productInfo.origin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Certification</p>
                      <p className="font-semibold">{productInfo.certification}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Supply Chain Timeline */}
          {events.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-6">Supply Chain Journey</h3>

              {events.map((event, index) => (
                <div key={event.id}>
                  <Card className="p-6 hover:shadow-lg transition">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary rounded-full text-primary-foreground flex items-center justify-center">
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-lg font-semibold capitalize">{event.event_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          {event.from_user && (
                            <div>
                              <p className="text-sm text-muted-foreground">From</p>
                              <p>{event.from_user.full_name}</p>
                            </div>
                          )}

                          {event.to_user && (
                            <div>
                              <p className="text-sm text-muted-foreground">To</p>
                              <p>{event.to_user.full_name}</p>
                            </div>
                          )}

                          {event.quantity != null && (
                            <div>
                              <p className="text-sm text-muted-foreground">Quantity</p>
                              <p>{event.quantity} units</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {index < events.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No Data */}
          {events.length === 0 && !loading && searchValue && (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                No data found. Try a different {searchType === "batch" ? "batch number" : "product name"}.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Food;
