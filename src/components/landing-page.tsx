'use client';

import { motion } from 'framer-motion';
import { Calculator, Shield, TrendingDown, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import Image from 'next/image';

export function LandingPage() {
  const setView = useAppStore((s) => s.setView);

  const features = [
    {
      icon: Calculator,
      title: 'Simulação Personalizada',
      description: 'Insira seus dados de consumo e receba uma análise detalhada de economia potencial com a CME INTELIGENTE.',
    },
    {
      icon: TrendingDown,
      title: 'Economia Comprovada',
      description: 'Compare seus custos atuais com preços de mercado e identifique oportunidades de redução de gastos.',
    },
    {
      icon: Shield,
      title: 'Governança Técnica',
      description: 'Análise baseada em normas vigentes e melhores práticas de processamento de produtos para saúde.',
    },
    {
      icon: BarChart3,
      title: 'Relatórios Profissionais',
      description: 'Gere relatórios completos para apresentar à diretoria e justificar mudanças de fornecedor.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-cme.png" alt="CME INTELIGENTE" width={48} height={48} className="h-12 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-primary">CME INTELIGENTE</h1>
              <p className="text-xs text-muted-foreground">Gestão Inteligente de Esterilização</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView('admin-login')} className="text-muted-foreground hover:text-primary text-xs">
              Área Administrativa
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 py-16 md:py-24">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/60 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                  <BarChart3 className="w-4 h-4" />
                  Ferramenta gratuita de simulação
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                  Calculadora Inteligente de{' '}
                  <span className="text-primary">Monitores de Esterilização</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Compare custos, estime consumo e descubra oportunidades de economia com governança técnica.
                </p>
                <Button
                  size="lg"
                  onClick={() => setView('calculator')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25"
                >
                  Iniciar Simulação
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Como funciona?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Em 4 passos simples, você terá uma análise completa do seu consumo de monitores de esterilização.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Passo a passo</h2>
            <div className="max-w-3xl mx-auto space-y-8">
              {[
                { step: '1', title: 'Dados de Contato', desc: 'Informe seus dados e os dados da instituição.' },
                { step: '2', title: 'Dados de Consumo', desc: 'Informe a quantidade mensal de cada monitor de esterilização utilizado.' },
                { step: '3', title: 'Valores Atuais', desc: 'Informe o valor unitário que você paga atualmente.' },
                { step: '4', title: 'Resultado', desc: 'Visualize a economia potencial e solicite uma devolutiva técnica.' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CME INTELIGENTE. Todos os direitos reservados.</p>
          <button onClick={() => setView('admin-privacy')} className="hover:text-primary underline mt-1">
            Política de Privacidade
          </button>
        </div>
      </footer>
    </div>
  );
}
