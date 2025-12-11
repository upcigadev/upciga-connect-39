-- =====================================================
-- SECURITY FIX: Create user_roles table and fix RLS policies
-- =====================================================

-- 1. Create enum for roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create secure has_role function (replaces is_admin)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Create is_admin function using has_role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 6. Migrate existing admin roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. RLS policies for user_roles (only admins can manage)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- FIX PROFILES TABLE - Remove ability to self-update role
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Usuários editam próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem fazer tudo" ON public.profiles;
DROP POLICY IF EXISTS "Sistema cria perfis" ON public.profiles;
DROP POLICY IF EXISTS "Todos podem ver perfis" ON public.profiles;

-- New secure policies for profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile (except role)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "System creates profiles via trigger"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- FIX CLIENTS TABLE - Remove public access
-- =====================================================

DROP POLICY IF EXISTS "Acesso público total a clientes" ON public.clients;

CREATE POLICY "Authenticated users can view clients"
ON public.clients
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage clients"
ON public.clients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- FIX EMPLOYEES TABLE - Remove public access
-- =====================================================

DROP POLICY IF EXISTS "Acesso público total a funcionarios" ON public.employees;

CREATE POLICY "Authenticated users can view employees"
ON public.employees
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage employees"
ON public.employees
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- FIX APPOINTMENTS TABLE - Remove public access
-- =====================================================

DROP POLICY IF EXISTS "Acesso público total a agendamentos" ON public.appointments;

CREATE POLICY "Authenticated users can view appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- FIX PRODUCTS TABLE - Remove public access
-- =====================================================

DROP POLICY IF EXISTS "Acesso público total a products" ON public.products;

CREATE POLICY "Authenticated users can view products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- FIX SERVICE_TYPES TABLE - Remove public access
-- =====================================================

DROP POLICY IF EXISTS "Acesso público total a service_types" ON public.service_types;

CREATE POLICY "Authenticated users can view service_types"
ON public.service_types
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage service_types"
ON public.service_types
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- FIX SETTINGS TABLE - Remove public access
-- =====================================================

DROP POLICY IF EXISTS "Acesso público total a settings" ON public.settings;

CREATE POLICY "Authenticated users can view settings"
ON public.settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.settings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- FIX SCHEDULE_BLOCKS TABLE - Remove public access
-- =====================================================

DROP POLICY IF EXISTS "Acesso público total a schedule_blocks" ON public.schedule_blocks;

CREATE POLICY "Authenticated users can view schedule_blocks"
ON public.schedule_blocks
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage schedule_blocks"
ON public.schedule_blocks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);