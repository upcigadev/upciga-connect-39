# 🔧 Instruções para Corrigir o Erro de Recursão Infinita (RLS)

## Problema Identificado

O erro `42P17: infinite recursion detected in policy for relation "profiles"` ocorre quando as políticas RLS (Row Level Security) da tabela `profiles` consultam a própria tabela `profiles`, causando um loop infinito.

## Solução

### Opção 1: Executar o Script SQL (Recomendado)

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `supabase/migrations/fix_profiles_rls.sql`
4. Execute o script

### Opção 2: Corrigir Manualmente no Dashboard

1. Acesse o **Supabase Dashboard**
2. Vá em **Table Editor** → **profiles**
3. Clique em **RLS policies** (você verá "3 policies" ou similar)
4. **DELETE todas as políticas existentes**
5. Crie as seguintes políticas novas:

#### Política 1: SELECT (Ver perfis)
- **Name**: `authenticated_users_view_profiles`
- **Allowed operation**: `SELECT`
- **USING expression**: `auth.role() = 'authenticated'`
- **WITH CHECK**: (deixar vazio)

#### Política 2: UPDATE (Atualizar próprio perfil)
- **Name**: `users_update_own_profile`
- **Allowed operation**: `UPDATE`
- **USING expression**: `auth.uid() = id`
- **WITH CHECK**: `auth.uid() = id`

#### Política 3: UPDATE (Atualizar qualquer perfil - para admins)
- **Name**: `authenticated_users_update_profiles`
- **Allowed operation**: `UPDATE`
- **USING expression**: `auth.role() = 'authenticated'`
- **WITH CHECK**: `auth.role() = 'authenticated'`

#### Política 4: INSERT (Criar perfil)
- **Name**: `users_insert_own_profile`
- **Allowed operation**: `INSERT`
- **USING expression**: (deixar vazio)
- **WITH CHECK**: `auth.uid() = id`

## ⚠️ Importante

- **NÃO** crie políticas que consultem a tabela `profiles` dentro da expressão da política
- **NÃO** use subqueries que acessem `profiles` dentro das políticas
- A verificação de role (admin/user) será feita no **código da aplicação**, não nas políticas RLS

## Após a Correção

1. Recarregue a aplicação
2. Faça login novamente
3. O erro de recursão deve desaparecer
4. A sidebar deve mostrar "Configurações" para usuários admin

## Verificação

Após aplicar as correções, verifique no console do navegador:
- ✅ Não deve mais aparecer o erro `42P17`
- ✅ Deve aparecer "Perfil encontrado:" com os dados do usuário
- ✅ A sidebar deve mostrar os itens corretos baseados no role





