import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Package, ArrowRight, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Analytics = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalEntries: 0,
    totalExits: 0,
    totalEvents: 0,
  });
  const [productData, setProductData] = useState<any[]>([]);
  const [eventTypeData, setEventTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // ---------- PRODUCTS COUNT ----------
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // ---------- ENTRIES (fix: entry_products) ----------
      const { data: entriesData } = await supabase
        .from("entry_products")
        .select(
          `
        id,
        product_id (
          name
        )
      `
        );

      // ---------- EXITS COUNT (fix: exit_products) ----------
      const { count: exitsCount } = await supabase
        .from("exit_products")
        .select("*", { count: "exact", head: true });

      // ---------- EVENTS ----------
      const { data: eventsData } = await supabase
        .from("supply_chain_events")
        .select("*");

      setStats({
        totalProducts: productsCount ?? 0,
        totalEntries: entriesData?.length ?? 0,
        totalExits: exitsCount ?? 0,
        totalEvents: eventsData?.length ?? 0,
      });

      // ---------- PRODUCT DISTRIBUTION CHART ----------
      const productMap = new Map();
      for (const entry of entriesData ?? []) {
        const name = entry.product_id?.name || "Unknown";
        productMap.set(name, (productMap.get(name) || 0) + 1);
      }

      setProductData(
        Array.from(productMap.entries()).map(([name, count]) => ({
          name,
          count,
        }))
      );

      // ---------- EVENT TYPE PIE CHART ----------
      const eventMap = new Map();
      for (const event of eventsData ?? []) {
        eventMap.set(event.event_type, (eventMap.get(event.event_type) || 0) + 1);
      }

      setEventTypeData(
        Array.from(eventMap.entries()).map(([type, count]) => ({
          type,
          count,
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      statistics: stats,
      productDistribution: productData,
      eventTypeDistribution: eventTypeData,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `supply-chain-report-${new Date()
      .toISOString()
      .split("T")[0]}.json`;
    a.click();

    toast.success("Report exported successfully");
  };

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "#f59e0b",
  ];

  if (loading) {
    return <div className="container mx-auto p-6">Loading analytics...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Button onClick={exportReport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* -------- STATS CARDS -------- */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{stats.totalEntries}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Exits</p>
              <p className="text-2xl font-bold">{stats.totalExits}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Supply Chain Events</p>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* -------- CHARTS -------- */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Product Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Event Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }: any) =>
                  `${type}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                dataKey="count"
              >
                {eventTypeData.map((entry) => (
                  <Cell
                    key={entry.type}
                    fill={COLORS[eventTypeData.indexOf(entry) % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
