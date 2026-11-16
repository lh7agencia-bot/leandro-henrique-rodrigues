import { useEffect, useState } from 'react';
import { ArrowRight, Lock, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { PublicSiteData } from '../types';
import { BUSINESS, buildWhatsAppUrl } from '../lib/business';
import { Header } from './Header';
import { ResilientImage } from './ResilientImage';
import { MenuSection } from './MenuSection';
import { GallerySection } from './GallerySection';
import { BookingSection } from './BookingSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FaqSection } from './FaqSection';
import { ContactSection } from './ContactSection';

const FALLBACK_HERO_IMAGE =
  'https://lh3.googleusercontent.com/grass-cs/AABkmLfGAti2dzHrQ7E4lrmHlvNHJvno9rn5kuGphaKxJLSaW4Z3jBtTC2hZRB8DJ-1X40tuiaeVHtd0BcAy6WzbjnXQnQe9sNdM2Nslj1gwfekxm7lZQ2xE8qFvtaxDt31nfnuqAUZtWNT0JRHb=s4800-w1024';

interface LandingPageProps {
  onOpenAdmin: () => void;
}

export function LandingPage({ onOpenAdmin }: LandingPageProps) {
  const [siteData, setSiteData] = useState<PublicSiteData>({
    menuItems: [],
    galleryPhotos: [],
    testimonials: [],
    faqs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/public-data');
        if (!res.ok) throw new Error('Falha ao carregar dados');
        const json = (await res.json()) as PublicSiteData;
        if (!cancelled) {
          setSiteData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function scrollToBooking() {
    const el = document.getElementById('reservas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const heroImage =
    siteData.galleryPhotos[0]?.imageUrl || FALLBACK_HERO_IMAGE;
  const heroCaption =
    siteData.galleryPhotos[0]?.caption ||
    'Salão da Acrópole Restaurante & Pizzaria em Santos';

  return (
    <div id="topo" className="min-h-screen bg-[#1A1A1A] text-[#F5F5F4] flex flex-col">
      <Header onReserveClick={scrollToBooking} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center py-2 lg:py-6">
                <p className="text-xs sm:text-sm font-medium text-[#A3A3A3] flex flex-wrap items-center gap-2 mb-4">
                  <span>José Menino</span>
                  <span aria-hidden="true">·</span>
                  <span>Santos, SP</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{BUSINESS.phoneDisplay}</span>
                </p>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#F5F5F4] leading-[1.08] tracking-tight text-balance">
                  {BUSINESS.slogan}.
                </h1>

                <p className="mt-5 text-base sm:text-lg text-[#B8B8B8] leading-relaxed max-w-xl">
                  Na <strong className="text-[#F5F5F4] font-semibold">{BUSINESS.name}</strong>,
                  cada pizza nasce de massa de fermentação lenta, molho artesanal e
                  ingredientes selecionados — servida no coração do José Menino, em
                  Santos.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={scrollToBooking}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Reservar Mesa
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <a
                    href="#cardapio"
                    className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-medium text-[#E5E5E5] hover:text-white bg-[#242424] hover:bg-[#2E2E2E] border border-[#323232] rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Ver Cardápio
                  </a>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] rounded-2xl overflow-hidden bg-[#222222] border border-[#2E2E2E]">
                  <ResilientImage
                    src={heroImage}
                    alt={heroCaption}
                    fallbackLabel={BUSINESS.name}
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p className="text-xs font-medium text-[#D4D4D4]">
                      {BUSINESS.name}
                    </p>
                    <p className="text-sm sm:text-base font-medium text-white mt-0.5">
                      {heroCaption}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-column essential info strip below hero */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#2C2C2C] rounded-xl bg-[#202020] divide-y sm:divide-y-0 sm:divide-x divide-[#2C2C2C]">
              <div className="p-5">
                <p className="text-xs font-medium text-[#A3A3A3]">Endereço</p>
                <p className="mt-1.5 text-sm font-medium text-[#F5F5F4] leading-snug">
                  Av. Senador Pinheiro Machado, 1008
                </p>
                <p className="text-xs text-[#A3A3A3] mt-0.5 tabular-nums">
                  José Menino · Santos, SP · 11065-605
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-[#A3A3A3]">
                  Telefone e WhatsApp
                </p>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-block text-base font-semibold text-[#F5F5F4] hover:text-[#E63946] transition-colors tabular-nums"
                >
                  {BUSINESS.phoneDisplay}
                </a>
                <p className="text-xs text-[#A3A3A3] mt-0.5">
                  Reservas e pedidos diretos
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-[#A3A3A3]">
                  Nossa Cozinha
                </p>
                <p className="mt-1.5 text-sm font-medium text-[#F5F5F4]">
                  Pizzas Artesanais &amp; Massas
                </p>
                <p className="text-xs text-[#A3A3A3] mt-0.5">
                  Massa de fermentação lenta
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-[#A3A3A3]">
                  Experiência
                </p>
                <p className="mt-1.5 text-sm font-medium text-[#F5F5F4]">
                  Salão, Retirada e Delivery
                </p>
                <a
                  href="#reservas"
                  className="text-xs font-semibold text-[#E63946] hover:text-white transition-colors mt-0.5 inline-block"
                >
                  Agendar mesa online
                </a>
              </div>
            </div>
          </div>
        </section>

        <MenuSection items={siteData.menuItems} loading={loading} />
        <GallerySection photos={siteData.galleryPhotos} loading={loading} />
        <BookingSection />
        <TestimonialsSection testimonials={siteData.testimonials} loading={loading} />
        <FaqSection faqs={siteData.faqs} loading={loading} />
        <ContactSection />
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#2A2A2A] bg-[#141414] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-[#242424]">
            <div className="space-y-2 max-w-md">
              <p className="font-display text-2xl font-bold text-[#F5F5F4]">
                {BUSINESS.name}
              </p>
              <p className="text-sm text-[#A3A3A3]">{BUSINESS.slogan}</p>
              <p className="text-xs text-[#8C8C8C] flex items-start gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#E63946] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{BUSINESS.address}</span>
              </p>
              <p className="text-xs text-[#8C8C8C] flex items-center gap-1.5 tabular-nums">
                <Phone className="w-3.5 h-3.5 text-[#E63946] shrink-0" aria-hidden="true" />
                <span>{BUSINESS.phoneDisplay}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-[#B3B3B3]">
              <a href="#cardapio" className="hover:text-white transition-colors">
                Cardápio
              </a>
              <a href="#galeria" className="hover:text-white transition-colors">
                Galeria
              </a>
              <a href="#reservas" className="hover:text-white transition-colors">
                Reservas
              </a>
              <a href="#depoimentos" className="hover:text-white transition-colors">
                Depoimentos
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
              <a href="#contato" className="hover:text-white transition-colors">
                Contato
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#737373]">
            <p>
              © {new Date().getFullYear()} {BUSINESS.name}. Todos os direitos
              reservados.
            </p>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              Painel Administrativo
            </button>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button (compact footprint <= 15% mobile height) */}
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar pelo WhatsApp (13) 3237-3609"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 h-12 px-4 rounded-full bg-[#E63946] hover:bg-[#C82B38] text-white text-sm font-semibold shadow-lg transition-transform duration-150 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline whitespace-nowrap">WhatsApp</span>
      </a>
    </div>
  );
}
