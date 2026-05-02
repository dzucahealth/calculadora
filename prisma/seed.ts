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

  // Reference items
  const referenceItems = [
    // Limpeza automatizada
    { name: 'Teste de cavitação', category: 'limpeza_automatizada', refPrice: 45.00 },
    { name: 'Teste de conectores/lúmen', category: 'limpeza_automatizada', refPrice: 38.00 },
    { name: 'Teste de limpeza da ultrassônica', category: 'limpeza_automatizada', refPrice: 42.00 },
    { name: 'Teste de limpeza da termodesinfectadora', category: 'limpeza_automatizada', refPrice: 35.00 },
    { name: 'Teste de termodesinfecção', category: 'limpeza_automatizada', refPrice: 40.00 },
    // Esterilização a vapor
    { name: 'Bowie&Dick', category: 'esterilizacao_vapor', refPrice: 28.00 },
    { name: 'Pacote teste desafio com integrador classe 5 ou 6', category: 'esterilizacao_vapor', refPrice: 55.00 },
    { name: 'Indicador químico interno classe 5 ou 6', category: 'esterilizacao_vapor', refPrice: 12.00 },
    { name: 'Indicador biológico de rotina', category: 'esterilizacao_vapor', refPrice: 35.00 },
    { name: 'Indicador biológico para carga com implante', category: 'esterilizacao_vapor', refPrice: 65.00 },
    // Peróxido de hidrogênio
    { name: 'PCD químico para peróxido', category: 'peroxido_hidrogenio', refPrice: 48.00 },
    { name: 'Indicador químico interno para peróxido', category: 'peroxido_hidrogenio', refPrice: 15.00 },
    { name: 'Indicador biológico para peróxido', category: 'peroxido_hidrogenio', refPrice: 85.00 },
    { name: 'BI para carga crítica de peróxido', category: 'peroxido_hidrogenio', refPrice: 95.00 },
  ];

  for (const item of referenceItems) {
    const minPrice = parseFloat((item.refPrice * 0.8).toFixed(2));
    const margin = 20;
    await prisma.referenceItem.upsert({
      where: { id: `${item.category}_${item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}` },
      update: { refPrice: item.refPrice, minPrice, margin },
      create: {
        id: `${item.category}_${item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
        name: item.name,
        category: item.category,
        refPrice: item.refPrice,
        minPrice,
        margin,
        status: 'ativo',
      },
    });
  }
  console.log(`✅ ${referenceItems.length} itens de referência criados`);

  // Offer rules
  const offerRules = [
    {
      minRange: 0,
      maxRange: 5000,
      benefit: 'Rastreabilidade em condição especial, plano básico',
      showToUser: true,
      internalNote: 'Atendimento padrão com rastreabilidade básica',
    },
    {
      minRange: 5001,
      maxRange: 10000,
      benefit: 'Rastreabilidade + 1 incubadora, plano intermediário',
      showToUser: true,
      internalNote: 'Oferta intermediária com incubadora inclusa',
    },
    {
      minRange: 10001,
      maxRange: 0,
      benefit: 'Rastreabilidade + 2 incubadoras, plano avançado, prioridade reunião',
      showToUser: true,
      internalNote: 'Oferta premium com 2 incubadoras e prioridade na agenda',
    },
  ];

  for (const rule of offerRules) {
    await prisma.offerRule.upsert({
      where: { id: `rule_${rule.minRange}_${rule.maxRange}` },
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
