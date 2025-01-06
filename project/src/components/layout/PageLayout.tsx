import { ReactNode } from 'react';
import { Header } from '../Header';
import { Footer } from '../footer/Footer';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}