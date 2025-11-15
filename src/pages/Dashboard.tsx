import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Package, Upload, Download, ShoppingCart, User as UserIcon, BarChart3 } from "lucide-react";
import ProductManagement from "@/components/ProductManagement";
import EntryProducts from "@/components/EntryProducts";
import ExitProducts from "@/components/ExitProducts";
import UsedToday from "@/components/UsedToday";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("entry");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Session error. Please login again.");
        navigate("/auth");
        return;
      }

      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        toast.error("Error loading profile");
      } else {
        setProfile(profileData);
      }

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleError) {
        console.error("Role error:", roleError);
        toast.error("Error loading user role");
      } else if (roleData) {
        setUserRole(roleData.role);
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Authentication error. Please login again.");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  if (loading || !user) {
    return null;
  }

  const canManageProducts = userRole === "farmer" || userRole === "manufacturer";
  const canUseToday = userRole === "retailer" || userRole === "consumer";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{profile?.full_name || user.email}</h1>
              <p className="text-sm text-muted-foreground capitalize">{userRole || "User"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/analytics")} variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {canManageProducts && (
            <Card 
              className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${activeTab === "products" ? "border-primary border-2" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <Package className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Products</h3>
              <p className="text-xs text-muted-foreground">Manage</p>
            </Card>
          )}
          
          <Card 
            className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${activeTab === "entry" ? "border-primary border-2" : ""}`}
            onClick={() => setActiveTab("entry")}
          >
            <Upload className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-semibold">Entry</h3>
            <p className="text-xs text-muted-foreground">Received</p>
          </Card>

          <Card 
            className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${activeTab === "exit" ? "border-primary border-2" : ""}`}
            onClick={() => setActiveTab("exit")}
          >
            <Download className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-semibold">Exit</h3>
            <p className="text-xs text-muted-foreground">Transferred</p>
          </Card>

          {canUseToday && (
            <Card 
              className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${activeTab === "used" ? "border-primary border-2" : ""}`}
              onClick={() => setActiveTab("used")}
            >
              <ShoppingCart className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Used Today</h3>
              <p className="text-xs text-muted-foreground">Records</p>
            </Card>
          )}
        </div>

        {/* Content Area */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          {activeTab === "products" && canManageProducts && <ProductManagement userId={user?.id} />}
          {activeTab === "entry" && <EntryProducts userId={user?.id} />}
          {activeTab === "exit" && <ExitProducts userId={user?.id} />}
          {activeTab === "used" && canUseToday && <UsedToday userId={user?.id} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
