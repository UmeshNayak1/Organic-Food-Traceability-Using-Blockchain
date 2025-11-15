-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('farmer', 'manufacturer', 'distributor', 'retailer', 'consumer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (critical for role-based access)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create products table (for farmers and manufacturers)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit TEXT DEFAULT 'kg',
  origin TEXT,
  certification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entry_products table
CREATE TABLE public.entry_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL NOT NULL,
  batch_number TEXT NOT NULL,
  received_from UUID REFERENCES auth.users(id),
  received_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exit_products table
CREATE TABLE public.exit_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_product_id UUID REFERENCES public.entry_products(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) NOT NULL,
  quantity DECIMAL NOT NULL,
  exit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create used_today table (for retailers and consumers)
CREATE TABLE public.used_today (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_product_id UUID REFERENCES public.entry_products(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL NOT NULL,
  used_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supply chain tracking table (blockchain-like)
CREATE TABLE public.supply_chain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  batch_number TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_user UUID REFERENCES auth.users(id),
  to_user UUID REFERENCES auth.users(id),
  quantity DECIMAL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_hash TEXT,
  metadata JSONB
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exit_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.used_today ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_events ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles RLS policies
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Products RLS policies (farmers and manufacturers)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Farmers and manufacturers can insert products" ON public.products FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = created_by AND (
      public.has_role(auth.uid(), 'farmer') OR 
      public.has_role(auth.uid(), 'manufacturer')
    )
  );
CREATE POLICY "Creators can update own products" ON public.products FOR UPDATE TO authenticated 
  USING (auth.uid() = created_by);

-- Entry products RLS policies
CREATE POLICY "Users can view own entry products" ON public.entry_products FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert entry products" ON public.entry_products FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entry products" ON public.entry_products FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- Exit products RLS policies
CREATE POLICY "Users can view own exit products" ON public.exit_products FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);
CREATE POLICY "Users can insert exit products" ON public.exit_products FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Used today RLS policies
CREATE POLICY "Users can view own used today" ON public.used_today FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "Retailers and consumers can insert used today" ON public.used_today FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = user_id AND (
      public.has_role(auth.uid(), 'retailer') OR 
      public.has_role(auth.uid(), 'consumer')
    )
  );

-- Supply chain events RLS policies
CREATE POLICY "Anyone can view supply chain events" ON public.supply_chain_events FOR SELECT TO authenticated 
  USING (true);
CREATE POLICY "Users can insert supply chain events" ON public.supply_chain_events FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = from_user OR auth.uid() = to_user);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', '')
  );
  
  -- Insert user role
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::user_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();