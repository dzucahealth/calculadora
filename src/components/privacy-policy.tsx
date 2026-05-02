'use client';

import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicy() {
  const { setView, isAdmin } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col">
      {isAdmin && (
        <div className="p-4 bg-white border-b">
          <Button variant="ghost" size="sm" onClick={() => setView('admin-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Dashboard
          </Button>
        </div>
      )}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Política de Privacidade - CME INTELIGENTE</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4 text-sm leading-relaxed">
            <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

            <h2 className="text-lg font-semibold mt-6">1. Informações Gerais</h2>
            <p>
              A CME INTELIGENTE (&ldquo;nós&rdquo;, &ldquo;nosso&rdquo; ou &ldquo;empresa&rdquo;) está comprometida com a proteção da privacidade
              e dos dados pessoais dos usuários de nossa plataforma &ldquo;Calculadora Inteligente de Consumíveis da CME&rdquo;.
              Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos suas informações
              pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).
            </p>

            <h2 className="text-lg font-semibold mt-6">2. Dados Coletados</h2>
            <p>Coletamos os seguintes dados pessoais quando você utiliza nossa calculadora:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dados de identificação:</strong> nome completo, e-mail, telefone (WhatsApp)</li>
              <li><strong>Dados profissionais:</strong> cargo/função, instituição de trabalho</li>
              <li><strong>Dados geográficos:</strong> cidade e estado</li>
              <li><strong>Dados operacionais:</strong> tipo de instituição, quantidade de salas cirúrgicas, estrutura da CME</li>
              <li><strong>Dados de consumo:</strong> informações sobre consumo de produtos para saúde (consumíveis de esterilização)</li>
              <li><strong>Dados comerciais:</strong> valores pagos por consumíveis, fornecedores atuais</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6">3. Finalidades do Tratamento</h2>
            <p>Utilizamos seus dados pessoais para as seguintes finalidades:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Realizar simulação personalizada de consumo e custos</li>
              <li>Gerar relatórios de economia potencial</li>
              <li>Oferecer propostas comerciais personalizadas</li>
              <li>Realizar contato comercial e técnico</li>
              <li>Melhorar nossos produtos e serviços</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6">4. Base Legal</h2>
            <p>
              O tratamento dos seus dados pessoais é realizado com base no seu consentimento livre, informado e inequívoco
              (art. 7º, I, LGPD), fornecido no momento da utilização da calculadora. Você pode revogar seu consentimento
              a qualquer momento, entrando em contato conosco.
            </p>

            <h2 className="text-lg font-semibold mt-6">5. Compartilhamento de Dados</h2>
            <p>
              Seus dados pessoais não são compartilhados com terceiros, exceto quando necessário para a prestação dos
              serviços contratados ou quando exigido por lei. Não vendemos, alugamos ou comercializamos seus dados pessoais.
            </p>

            <h2 className="text-lg font-semibold mt-6">6. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados em servidores seguros, com medidas técnicas e administrativas adequadas para
              proteger contra acesso não autorizado, alteração, divulgação ou destruição. Os dados são retidos pelo
              período necessário para cumprir as finalidades descritas nesta política.
            </p>

            <h2 className="text-lg font-semibold mt-6">7. Seus Direitos</h2>
            <p>Como titular dos dados, você tem os seguintes direitos conforme a LGPD:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmar a existência de tratamento de seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Solicitar a portabilidade dos dados</li>
              <li>Revogar o consentimento</li>
              <li>Obter informações sobre o compartilhamento de dados</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6">8. Cookies e Tecnologias Semelhantes</h2>
            <p>
              Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência na plataforma.
              Cookies essenciais são necessários para o funcionamento básico da aplicação. Você pode gerenciar
              suas preferências de cookies nas configurações do seu navegador.
            </p>

            <h2 className="text-lg font-semibold mt-6">9. Contato</h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>E-mail: privacidade@cmeinteligente.com</li>
              <li>WhatsApp: disponível no site oficial</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6">10. Alterações nesta Política</h2>
            <p>
              Reservamo-nos o direito de atualizar esta Política de Privacidade a qualquer momento. As alterações
              serão publicadas nesta página com a data de atualização revisada. Recomendamos que você revise esta
              política periodicamente.
            </p>
          </CardContent>
        </Card>

        {!isAdmin && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setView('landing')}>← Voltar ao Início</Button>
          </div>
        )}
      </main>
    </div>
  );
}
