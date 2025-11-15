import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Search, Package, Leaf, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import foodData from "../data/food_dataset.json";
import { supabase } from "../integrations/supabase/client";

const Track = () => {
  const [foodName, setFoodName] = useState("");
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Fetch products from database on component mount
  useEffect(() => {
    fetchDatabaseProducts();
  }, []);

  // Combine dataset and database products
  useEffect(() => {
    const combined = [...foodData, ...dbProducts];
    setAllProducts(combined);
  }, [dbProducts]);

  const fetchDatabaseProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("entry_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform DB structure -> foodData format
      const transformedProducts = (data || []).map((product: any) => ({
        foodName: product.food_name || "Unknown Product",
        description: `Product added on ${new Date(
          product.production_date || product.created_at
        ).toLocaleDateString()}`,
        category: product.product_type || "Product",
        origin: "Manufacturer Entry",
        preparedBy: "Manufacturer",
        certification: product.is_organic ? "Organic Certified" : "Non-Organic",
        ingredients: [],
        isOrganic: product.is_organic,
        healthRisk: product.is_organic ? "Low" : "Medium",
        scheme: "",
        youtubeLink: "",
        preparationDetails: product.notes || "No additional details",
        productionDate: product.production_date,
        quantity: product.quantity,
        _dbEntry: product,
      }));

      setDbProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching database products:", error);
    }
  };

  const handleSearch = async () => {
    if (!foodName.trim()) {
      toast.error("Please enter a food name");
      return;
    }

    setLoading(true);

    const nameLower = foodName.toLowerCase();

    // Search in combined list safely
    const found = allProducts.find(
      (item) => item?.foodName?.toLowerCase?.() === nameLower
    );

    if (!found) {
      toast.error("No food data found for this name");
      setProductInfo(null);
      setLoading(false);
      return;
    }

    setProductInfo(found);
    toast.success("Food data loaded successfully");
    setLoading(false);
  };

  const handleFoodClick = (food: any) => {
    setProductInfo(food);
    setFoodName(food.foodName);
    toast.success(`Loaded ${food.foodName}`);
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
            <span className="text-xl font-semibold">
              Organic Food Traceability
            </span>
          </Link>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Left Section */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Check Your Food</h1>
              <p className="text-lg text-muted-foreground">
                Search for food items or select from the menu to check details
              </p>
            </div>

            {/* Search */}
            <Card className="p-6 mb-8">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter food name (e.g., Ragi Mudde, Mysore Pak)"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </Card>

            {/* Product Info + QR */}
            {productInfo && (
              <Card className="p-6 mb-8 bg-primary/5">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{productInfo.foodName}</h2>
                        {productInfo.isOrganic && (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full mt-1">
                            ✓ Organic
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">
                      {productInfo.description}
                    </p>

                    {/* DETAILS */}
                    <div className="space-y-3">
                      <Detail label="Product Name" value={productInfo.foodName} />
                      <Detail
                        label="Type"
                        value={productInfo.isOrganic ? "Organic" : "Non-Organic"}
                        valueClass={
                          productInfo.isOrganic ? "text-green-600" : "text-red-600"
                        }
                      />
                      {productInfo.preparedBy && (
                        <Detail label="Manufacturer" value={productInfo.preparedBy} />
                      )}
                      {productInfo.productionDate && (
                        <Detail
                          label="Production Date"
                          value={new Date(
                            productInfo.productionDate
                          ).toLocaleDateString()}
                        />
                      )}
                      <Detail label="Product Type" value={productInfo.category} />
                      {productInfo.quantity && (
                        <Detail label="Quantity" value={`${productInfo.quantity} units`} />
                      )}
                      <Detail label="Origin" value={productInfo.origin} />
                      <Detail label="Certification" value={productInfo.certification} />

                      {productInfo.ingredients?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Ingredients
                          </p>
                          <div className="mt-1">
                            {productInfo.ingredients.map((i: string, idx: number) => (
                              <div key={idx}>• {i}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Detail
                        label="Health Risk Level"
                        value={productInfo.healthRisk}
                        valueClass={
                          productInfo.healthRisk === "Low"
                            ? "text-green-600"
                            : productInfo.healthRisk === "Medium"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }
                      />

                      {productInfo.preparationDetails && (
                        <Detail
                          label="Additional Details"
                          value={productInfo.preparationDetails}
                        />
                      )}
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center lg:w-64">
                    <p className="text-sm text-muted-foreground mb-3">
                      Scan QR Code
                    </p>
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <QRCodeSVG
                        value={
                          productInfo.youtubeLink ||
                          `Food Name: ${productInfo.foodName}
Category: ${productInfo.category}
Origin: ${productInfo.origin}
Certification: ${productInfo.certification}
Ingredients: ${productInfo.ingredients.join(", ")}
Health Risk: ${productInfo.healthRisk}`
                        }
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Menu */}
          <div className="w-80 hidden lg:block">
            <Card className="p-4 sticky top-4">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Available Foods
              </h3>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-1">
                {allProducts.map((food: any, index: number) => {
                  const displayName = food?.foodName || "Unnamed Item";

                  return (
                    <div key={index}>
                      {/* Capitalized */}
                      <button
                        onClick={() => handleFoodClick(food)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-primary/10 flex justify-between group ${
                          productInfo?.foodName === displayName
                            ? "bg-primary/20"
                            : ""
                        }`}
                      >
                        <span className="text-sm font-medium">{displayName}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                      </button>

                      {/* Lowercase */}
                      <button
                        onClick={() => handleFoodClick(food)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-primary/10 flex justify-between group ${
                          productInfo?.foodName === displayName
                            ? "bg-primary/20"
                            : ""
                        }`}
                      >
                        <span className="text-sm text-muted-foreground">
                          {displayName.toLowerCase()}
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: any;
  valueClass?: string;
}) => (
  <div className="flex flex-col">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className={`text-base font-semibold ${valueClass}`}>{value}</p>
  </div>
);

export default Track;
