import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../types';

interface FaqSectionProps {
  faqs: FaqItem[];
  loading: boolean;
}

export function FaqSection({ faqs, loading }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      id="faq"
      className="py-20 sm:py-24 border-t border-[#2A2A2A] bg-[#1A1A1A]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-wider text-[#E63946] mb-2">
            05. Dúvidas Frequentes
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F4] tracking-tight text-balance">
            Perguntas frequentes sobre a Acrópole
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-16 rounded-xl bg-[#222222] border border-[#2E2E2E] animate-pulse"
              />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-8 text-center text-[#A3A3A3]">
            Nenhuma pergunta frequente cadastrada no momento.
          </div>
        ) : (
          <div className="divide-y divide-[#2E2E2E] border-y border-[#2E2E2E]">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full py-5 flex items-center justify-between gap-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] rounded"
                  >
                    <span className="text-base sm:text-lg font-medium text-[#F5F5F4]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#E63946] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="pb-6 pr-8 text-sm sm:text-base text-[#B3B3B3] leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
