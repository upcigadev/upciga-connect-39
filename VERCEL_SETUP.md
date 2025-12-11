# Configuração do Vercel para UPCIGA Connect

## ⚠️ Variáveis de Ambiente Obrigatórias

Para que a aplicação funcione corretamente no Vercel, você **DEVE** configurar as seguintes variáveis de ambiente:

### Como Configurar no Vercel:

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Selecione o projeto `upciga-connect-39`
3. Vá em **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-aqui
```

### Onde encontrar essas variáveis:

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

### ⚠️ Importante:

- Após adicionar as variáveis, você **DEVE** fazer um novo deploy
- As variáveis são injetadas no build, então um rebuild é necessário
- Certifique-se de que as variáveis estão configuradas para **Production**, **Preview** e **Development**

### Verificar se está funcionando:

1. Após o deploy, acesse a URL do Vercel
2. Abra o Console do Navegador (F12)
3. Se as variáveis estiverem configuradas corretamente, você verá a tela de login
4. Se não estiverem, você verá erros no console indicando variáveis faltando

## 🔧 Troubleshooting

### Tela Branca

Se você está vendo uma tela branca:

1. **Verifique o Console do Navegador (F12)**
   - Procure por erros relacionados ao Supabase
   - Verifique se há mensagens sobre variáveis de ambiente

2. **Verifique as Variáveis no Vercel**
   - Certifique-se de que as variáveis estão configuradas
   - Verifique se os valores estão corretos (sem espaços extras)

3. **Faça um Novo Deploy**
   - As variáveis são injetadas no build
   - Um novo deploy é necessário após adicionar/modificar variáveis

4. **Verifique a URL do Supabase**
   - A URL deve começar com `https://`
   - Não deve ter barra no final (`/`)

### Redirecionamento para Login

Se a aplicação não está redirecionando para `/login`:

- Isso é esperado se as variáveis não estiverem configuradas
- O sistema tem um timeout de 5 segundos
- Após o timeout, deve redirecionar automaticamente

