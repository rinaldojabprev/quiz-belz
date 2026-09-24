import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'BELZ QUIZ — Batalha de Equipes em Tempo Real',
  description: 'Jogo de perguntas e respostas competitivo para duas equipes em tempo real da Belz Corretora de Seguros.',
  openGraph: {
    title: 'BELZ QUIZ — Batalha de Equipes em Tempo Real',
    description: 'Jogo de perguntas e respostas competitivo para duas equipes em tempo real da Belz Corretora de Seguros.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BELZ QUIZ — Batalha de Equipes em Tempo Real',
    description: 'Jogo de perguntas e respostas competitivo para duas equipes em tempo real da Belz Corretora de Seguros.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
