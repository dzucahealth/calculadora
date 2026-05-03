import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Create default admin
  const hashedPassword = await bcrypt.hash('CME@2024!', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@cmeinteligente.com' },
    update: {},
    create: {
      email: 'admin@cmeinteligente.com',
      name: 'Administrador CME',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log(`✅ Admin criado: ${admin.email}`);

  // Reference items - Monitores de Esterilização
  const referenceItems = [
    // Indicadores Biológicos - Linha Vapor
    { name: 'IB Vapor Fluorescência 3hrs', category: 'indicadores_biologicos_vapor', refPrice: 12.00, partner: 'Fluorimétrico' },
    { name: 'IB Vapor Fluorescência 1hr', category: 'indicadores_biologicos_vapor', refPrice: 13.50, partner: 'Fluorimétrico' },
    { name: 'IB Vapor Fluorescência 20min', category: 'indicadores_biologicos_vapor', refPrice: 16.00, partner: 'Fluorimétrico' },
    // Indicadores Biológicos - Linha Plasma VH202
    { name: 'IB Fluorimétrico Plasma VH202 20m', category: 'indicadores_biologicos_plasma', refPrice: 17.00, partner: 'Fluorimétrico' },
    // Integradores e Emuladores Químicos
    { name: 'Integrador Químico Vapor Tipo 5', category: 'integradores_emuladores', refPrice: 0.24, partner: 'Integrador' },
    // Testes Bowie & Dick
    { name: 'Teste Bowie & Dick 4kg', category: 'testes_bowie_dick', refPrice: 13.00, partner: 'Pacote Pronto' },
    { name: 'Teste Bowie & Dick 7kg', category: 'testes_bowie_dick', refPrice: 13.50, partner: 'Pacote Pronto' },
    // Testes Desafio e Liberador de Carga
    { name: 'PCD - Teste Desafio 3hr', category: 'testes_desafio_liberador', refPrice: 25.00, partner: 'Teste Desafio' },
    { name: 'PCD - Teste Desafio 1hr', category: 'testes_desafio_liberador', refPrice: 28.00, partner: 'Teste Desafio' },
    { name: 'PCD - Teste Desafio 20min', category: 'testes_desafio_liberador', refPrice: 34.00, partner: 'Teste Desafio' },
    { name: 'PCD - Liberador de Carga Tipo 5', category: 'testes_desafio_liberador', refPrice: 13.00, partner: 'Liberador de Carga' },
  ];

  for (const item of referenceItems) {
    const minPrice = parseFloat((item.refPrice * 0.8).toFixed(2));
    const margin = 20;
    const id = `${item.category}_${item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    await prisma.referenceItem.upsert({
      where: { id },
      update: { refPrice: item.refPrice, minPrice, margin, partner: item.partner },
      create: {
        id,
        name: item.name,
        category: item.category,
        refPrice: item.refPrice,
        minPrice,
        margin,
        partner: item.partner,
        status: 'ativo',
      },
    });
  }
  console.log(`✅ ${referenceItems.length} itens de referência criados`);

  // Offer rules
  const offerRules = [
    {
      id: 'rule_monitores_0_3000',
      minRange: 0,
      maxRange: 3000,
      benefit: 'Kit de amostras gratuitas de monitores de esterilização + condições especiais no primeiro pedido',
      showToUser: true,
      internalNote: 'Atendimento padrão com amostras grátis',
    },
    {
      id: 'rule_monitores_3001_8000',
      minRange: 3001,
      maxRange: 8000,
      benefit: 'Rastreabilidade em condição especial + desconto progressivo + 1 incubadora em comodato',
      showToUser: true,
      internalNote: 'Oferta intermediária com incubadora inclusa',
    },
    {
      id: 'rule_monitores_8001_0',
      minRange: 8001,
      maxRange: 0,
      benefit: 'Plano exclusivo: rastreabilidade + 2 incubadoras + prioridade reunião + desconto máximo',
      showToUser: true,
      internalNote: 'Oferta premium com 2 incubadoras e prioridade na agenda',
    },
  ];

  for (const rule of offerRules) {
    await prisma.offerRule.upsert({
      where: { id: rule.id },
      update: {},
      create: rule,
    });
  }
  console.log(`✅ ${offerRules.length} regras de oferta criadas`);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
