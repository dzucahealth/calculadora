import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CME INTELIGENTE - Calculadora Inteligente de Monitores de Esterilização",
  description: "Análise inteligente de gastos com monitores de esterilização. Compare custos, descubra pacotes com melhores preços e explore novas soluções e tecnologias para Central de Material Esterilizado.",
  keywords: ["CME", "esterilização", "monitores de esterilização", "indicadores biológicos", "calculadora", "economia", "gastos", "pacotes", "soluções", "consumíveis"],
  authors: [{ name: "CME INTELIGENTE" }],
  icons: {
    icon: "/logo-cme.png",
  },
  openGraph: {
    title: "Calculadora Inteligente de Monitores de Esterilização",
    description: "Análise de gastos, pacotes personalizados e novas soluções para monitores de esterilização com a CME INTELIGENTE.",
    siteName: "CME INTELIGENTE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
