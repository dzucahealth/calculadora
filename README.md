# CME Inteligente — Calculadora de Consumíveis

Aplicação SaaS para hospitais, clínicas e centrais de material e esterilização (CME) calcularem o custo atual com consumíveis e compararem com a proposta otimizada, gerando uma estimativa de economia mensal.

## Funcionalidades

**Área pública**
- Calculadora passo a passo (4 etapas) com coleta de dados da instituição
- Cálculo automático de economia estimada com base em preços de referência
- Página de resultados com análise detalhada por item
- Geração de relatório em PDF
- Consentimento LGPD integrado

**Painel administrativo**
- Dashboard com gráficos de leads, conversões e economia gerada
- Gestão de leads com filtros, busca e classificação (Baixa / Média / Alta / Estratégica)
- Histórico de contatos por lead
- CRUD de itens de referência (preços por categoria de consumível)
- CRUD de regras de oferta por faixa de economia
- Autenticação segura com hash bcrypt

## Tecnologias

- **Next.js 15** (App Router, modo standalone)
- **Prisma ORM** com **MySQL**
- **Tailwind CSS 4** + **shadcn/ui**
- **Zustand** (gerenciamento de estado)
- **Recharts** (gráficos)
- **React Hook Form** + **Zod** (validação)
- **TypeScript**
- **Bun** (runtime e gerenciador de pacotes)

## Pré-requisitos

- [Bun](https://bun.sh) >= 1.0
- MySQL >= 8.0

## Instalação

```bash
# 1. Clone o repositório
git clone git@github.com:dzucahealth/calculadora.git
cd calculadora

# 2. Instale as dependências
bun install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com as credenciais do seu banco MySQL

# 4. Execute as migrações do banco
bun run db:migrate

# 5. Popule o banco com dados iniciais
bun run db:seed

# 6. Inicie o servidor de desenvolvimento
bun run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseando-se no `.env.example`:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/cme_inteligente"
```

## Scripts disponíveis

| Comando               | Descrição                                |
| --------------------- | ---------------------------------------- |
| `bun run dev`         | Inicia o servidor de desenvolvimento     |
| `bun run build`       | Gera o build de produção                 |
| `bun run start`       | Inicia o servidor em produção            |
| `bun run db:migrate`  | Executa as migrações do banco            |
| `bun run db:push`     | Sincroniza o schema sem migrações        |
| `bun run db:generate` | Regenera o Prisma Client                 |
| `bun run db:reset`    | Reseta o banco e re-executa as migrações |

## Acesso padrão ao painel admin

Após executar o seed:

- **E-mail:** `admin@cmeinteligente.com`
- **Senha:** `CME@2024!`

> Altere as credenciais em produção via painel ou diretamente no banco.

## Estrutura do projeto

```
src/
  app/          # Rotas Next.js (App Router) e API routes
  components/   # Componentes React da UI
  hooks/        # Custom hooks
  lib/          # Utilitários e configurações (Prisma client, etc.)
  store/        # Estado global (Zustand)
prisma/
  schema.prisma # Schema do banco de dados
  seed.ts       # Script de seed
public/         # Arquivos estáticos
```

## Licença

Propriedade de [Dzuca Health](https://github.com/dzucahealth). Todos os direitos reservados.
