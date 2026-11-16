import { useState, type FormEvent } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import type { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  loading: boolean;
}

export function TestimonialsSection({
  testimonials,
  loading,
}: TestimonialsSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, content, rating }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar avaliação.');
      }
      setSubmitted(true);
      setCustomerName('');
      setContent('');
      setRating(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar depoimento.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="depoimentos"
      className="py-20 sm:py-24 border-t border-[#2A2A2A] bg-[#161616]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-[#E63946] mb-2">
              04. Experiência dos Clientes
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F4] tracking-tight text-balance">
              O que dizem quem já provou a nossa massa
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormOpen((prev) => !prev);
              setSubmitted(false);
              setError(null);
            }}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#F5F5F4] bg-[#242424] hover:bg-[#2F2F2F] border border-[#343434] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {formOpen ? 'Fechar formulário' : 'Enviar depoimento'}
          </button>
        </div>

        {formOpen && (
          <div className="mb-10 rounded-xl bg-[#222222] border border-[#2E2E2E] p-6 sm:p-8 max-w-2xl">
            {submitted ? (
              <div className="flex items-start gap-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-base font-semibold text-[#F5F5F4]">
                    Obrigado pelo seu depoimento!
                  </p>
                  <p className="text-sm text-[#B3B3B3] mt-1">
                    Sua avaliação foi recebida e ficará visível no site assim que
                    for aprovada pela nossa equipe.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-display text-xl font-semibold text-[#F5F5F4]">
                  Conte como foi sua visita à Acrópole
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="testimonial-name"
                      className="block text-sm font-medium text-[#E5E5E5] mb-1.5"
                    >
                      Seu nome
                    </label>
                    <input
                      id="testimonial-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nome e sobrenome"
                      className="w-full h-11 px-3.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] placeholder:text-[#737373] focus:outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-[#E5E5E5] mb-1.5">
                      Nota
                    </span>
                    <div className="flex items-center gap-1.5 h-11">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          aria-label={`${value} estrelas`}
                          className="p-1.5 rounded hover:bg-[#2C2C2C] cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              value <= rating
                                ? 'fill-[#E63946] text-[#E63946]'
                                : 'text-[#525252]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="testimonial-content"
                    className="block text-sm font-medium text-[#E5E5E5] mb-1.5"
                  >
                    Comentário
                  </label>
                  <textarea
                    id="testimonial-content"
                    rows={3}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Conte sobre o sabor, atendimento ou ambiente..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] placeholder:text-[#737373] focus:outline-none focus:border-[#E63946] resize-none"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-[#FF7B85]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? 'Enviando...' : 'Publicar Avaliação'}
                </button>
              </form>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 rounded-xl bg-[#222222] border border-[#2E2E2E] animate-pulse"
              />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-10 text-center text-[#A3A3A3]">
            Ainda não há depoimentos publicados. Seja o primeiro a avaliar!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <article
                key={item.id}
                className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div
                    className="flex items-center gap-1"
                    aria-label={`Avaliação ${item.rating} de 5 estrelas`}
                  >
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < item.rating
                            ? 'fill-[#E63946] text-[#E63946]'
                            : 'text-[#404040]'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-[#E5E5E5] leading-relaxed">
                    “{item.content}”
                  </p>
                </div>

                <div className="pt-4 border-t border-[#2E2E2E]">
                  <p className="text-sm font-semibold text-[#F5F5F4]">
                    {item.customerName}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
