import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Leaf, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-supply-chain.jpg";
import blockchainImage from "@/assets/blockchain-network.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Organic Food Traceability
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              Blockchain-powered transparency for the entire organic food supply chain
            </p>
            <div className="flex flex-wrap gap-4">
            <Link to="/auth">
              <Button
                size="lg"
                className="
                  bg-gradient-to-r from-green-500 via-emerald-600 to-green-700
                  hover:from-green-600 hover:via-emerald-700 hover:to-green-800
                  text-white font-semibold tracking-wide
                  shadow-lg hover:shadow-xl
                  rounded-xl px-8 py-6
                  transition-all duration-300 ease-out
                  transform hover:-translate-y-1 hover:scale-105
                "
              >
                Get Started
              </Button>
            </Link>

            <Link to="/food">
              <Button
                size="lg"
                
                className="
                  bg-gradient-to-r from-green-500 via-emerald-600 to-green-700
                  hover:from-green-600 hover:via-emerald-700 hover:to-green-800
                  text-white font-semibold tracking-wide
                  shadow-lg hover:shadow-xl
                  rounded-xl px-8 py-6
                  transition-all duration-300 ease-out
                  transform hover:-translate-y-1 hover:scale-105
                "
              >
                Track Your Food
              </Button>
            </Link>
              <Link to="/track">
                <Button
                  size="lg"
                  className="
                  bg-gradient-to-r from-green-500 via-emerald-600 to-green-700
                  hover:from-green-600 hover:via-emerald-700 hover:to-green-800
                  text-white font-semibold tracking-wide
                  shadow-lg hover:shadow-xl
                  rounded-xl px-8 py-6
                  transition-all duration-300 ease-out
                  transform hover:-translate-y-1 hover:scale-105
                  "
                >
                  Find Your Best Food Match
                </Button>
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our System?</h2>
            <p className="text-xl text-muted-foreground">
              Built on blockchain technology for maximum transparency and trust
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Increased Transparency</h3>
              <p className="text-muted-foreground">
                Complete visibility of the supply chain from farm to consumer
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Improved Food Safety</h3>
              <p className="text-muted-foreground">
                Verify organic certifications and handling processes
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduced Food Fraud</h3>
              <p className="text-muted-foreground">
                Blockchain ensures tamper-proof records and authenticity
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Better Traceability</h3>
              <p className="text-muted-foreground">
                Track products through every stage of the supply chain
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Blockchain Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Powered by Blockchain Technology
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our system leverages blockchain to create an immutable, decentralized record 
                of each transaction within the supply chain. This ensures:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Tamper-proof records that cannot be altered</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Complete transparency for all stakeholders</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Real-time tracking and verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Trust and accountability at every stage</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src={blockchainImage} 
                alt="Blockchain Network" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Join the Future of Organic Food Traceability
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you're a farmer, manufacturer, distributor, retailer, or consumer, 
            our system provides the transparency you need.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;