import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BUSINESS } from '../lib/business';

interface HeaderProps {
  onReserveClick: () => void;
}

const NAV_LINKS = [
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#reservas', label: 'Reservas' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#faq', label: 'FAQ' },
];

export function Header({ onReserveClick }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Wordmark */}
        <a
          href="#topo"
          className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F4] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] rounded"
        >
          {BUSINESS.shortName}
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#D4D4D4]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap shrink-0 py-1 hover:text-white underline-offset-8 hover:underline decoration-[#E63946] decoration-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] rounded"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onReserveClick}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Reservar Mesa
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#F5F5F4] hover:bg-[#262626] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#2A2A2A] bg-[#1A1A1A] px-4 py-4 space-y-2">
          <nav className="flex flex-col space-y-1" aria-label="Menu mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 rounded-lg text-base font-medium text-[#E5E5E5] hover:bg-[#242424] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onReserveClick();
            }}
            className="w-full mt-2 px-4 py-3 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg transition-colors cursor-pointer"
          >
            Reservar Mesa
          </button>
        </div>
      )}
    </header>
  );
}
