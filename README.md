# Calculadora CME Inteligente

Aplicação web para cálculo e gestão de monitores de esterilização da CME (Central de Material e Esterilização).

## Stack

- **Next.js 16** (standalone output)
- **React 19**
- **TypeScript**
- **Prisma 6** + MySQL
- **Tailwind CSS v4** + shadcn/ui
- **next-auth** para autenticação
- **Zustand** para estado global
- **TanStack Query** para cache de dados

## Requisitos

- Node.js 22+
- Yarn
- MySQL

## Desenvolvimento

```bash
yarn install
yarn dev
```

Acessa em `http://localhost:3003`

## Banco de dados

```bash
# Aplicar schema
yarn db:push

# Gerar client
yarn db:generate

# Popular dados iniciais
npx prisma db seed
```

**Credenciais do admin padrão:**
- Email: `admin@cmeinteligente.com`
- Senha: `CME@2024!`

## Build e produção

```bash
yarn build
yarn start
```

O servidor sobe na porta `3007` com `HOSTNAME=0.0.0.0`.

## Deploy (Coolify + Nixpacks)

Configurações relevantes:
- `nixpacks.toml` — instala `libssl3` para o Prisma engine
- `.yarnrc` — `ignore-engines true` para compatibilidade com Node 22.x
- **Ports Exposes:** `3007`
- **Post-deployment:** `npx prisma migrate deploy`

## Variáveis de ambiente

| Variável          | Descrição                                          |
| ----------------- | -------------------------------------------------- |
| `DATABASE_URL`    | Conexão MySQL ex: `mysql://user:pass@host:port/db` |
| `NEXTAUTH_SECRET` | Secret do next-auth                                |
| `NEXTAUTH_URL`    | URL pública da aplicação                           |
