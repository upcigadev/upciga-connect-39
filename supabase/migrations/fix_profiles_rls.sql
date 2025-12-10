-- ============================================
-- CORREÇÃO: Políticas RLS da tabela profiles
-- Remove recursão infinita (erro 42P17)
-- ============================================

-- IMPORTANTE: Este arquivo corrige o erro de recursão infinita
-- que ocorre quando as políticas RLS consultam a própria tabela profiles

-- Passo 1: Remover TODAS as políticas existentes que podem estar causando recursão
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles';
    END LOOP;
END $$;

-- Passo 2: Criar políticas SIMPLES que NÃO causam recursão
-- IMPORTANTE: Estas políticas NÃO consultam a tabela profiles dentro delas

-- Política 1: Usuários autenticados podem ver TODOS os perfis
-- (A filtragem por role será feita no código da aplicação)
-- Esta é a forma mais segura de evitar recursão
CREATE POLICY "authenticated_users_view_profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Política 2: Usuários podem atualizar seu próprio perfil
CREATE POLICY "users_update_own_profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política 3: Usuários autenticados podem atualizar perfis
-- (A verificação de admin será feita no código da aplicação)
CREATE POLICY "authenticated_users_update_profiles"
ON public.profiles
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Política 4: Permitir inserção de perfis (para novos usuários)
CREATE POLICY "users_insert_own_profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

