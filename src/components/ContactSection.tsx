import { useState, type FormEvent } from 'react';
import { CheckCircle2, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BUSINESS, buildWhatsAppUrl } from '../lib/business';

export function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentData, setSentData] = useState<{
    name: string;
    email: string;
    message: string;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem.');
      }
      setSentData({ name, email, message });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="contato"
      className="py-20 sm:py-24 border-t border-[#2A2A2A] bg-[#161616]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#E63946] mb-2">
                06. Contato e Localização
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F4] tracking-tight text-balance">
                Visite a Acrópole ou fale com a nossa equipe
              </h2>
              <p className="mt-3 text-base text-[#B3B3B3]">
                Envie sua mensagem pelo formulário, tire dúvidas pelo WhatsApp ou
                trace sua rota até o nosso restaurante no José Menino.
              </p>
            </div>

            <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] divide-y divide-[#2E2E2E]">
              <div className="p-5 flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-[#A3A3A3] mb-1">
                    Endereço
                  </p>
                  <p className="text-sm font-medium text-[#F5F5F4] leading-relaxed">
                    {BUSINESS.address}
                  </p>
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#E63946] hover:text-white transition-colors"
                  >
                    Abrir no Google Maps
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="p-5 flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-[#A3A3A3] mb-1">
                    Telefone / WhatsApp
                  </p>
                  <p className="text-base font-semibold text-[#F5F5F4] tabular-nums">
                    {BUSINESS.phoneDisplay}
                  </p>
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#E63946] hover:text-white transition-colors"
                  >
                    Conversar no WhatsApp
                    <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-6 sm:p-8">
              {sentData ? (
                <div className="space-y-5 py-4">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="w-7 h-7 shrink-0" aria-hidden="true" />
                    <h3 className="font-display text-2xl font-bold text-[#F5F5F4]">
                      Mensagem enviada com sucesso
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base text-[#D4D4D4]">
                    Recebemos o contato de{' '}
                    <strong className="text-white">{sentData.name}</strong> ({sentData.email}).
                    Responderemos o mais breve possível.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={buildWhatsAppUrl(
                        `Olá! Meu nome é ${sentData.name} (${sentData.email}). ${sentData.message}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      Enviar também por WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => setSentData(null)}
                      className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-[#E5E5E5] bg-[#2C2C2C] hover:bg-[#363636] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Nova mensagem
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-medium text-[#E5E5E5] mb-2"
                      >
                        Nome
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full h-11 px-3.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] placeholder:text-[#737373] focus:outline-none focus:border-[#E63946] transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-sm font-medium text-[#E5E5E5] mb-2"
                      >
                        E-mail
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@exemplo.com"
                        className="w-full h-11 px-3.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] placeholder:text-[#737373] focus:outline-none focus:border-[#E63946] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-[#E5E5E5] mb-2"
                    >
                      Mensagem
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva sua dúvida, sugestão ou solicitação de evento..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] placeholder:text-[#737373] focus:outline-none focus:border-[#E63946] transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="text-sm text-[#FF7B85] bg-[#E63946]/10 border border-[#E63946]/40 rounded-lg px-4 py-2.5"
                    >
                      {error}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Mail className="w-4 h-4" aria-hidden="true" />
                      {submitting ? 'Enviando...' : 'Enviar Mensagem'}
                    </button>

                    <a
                      href={buildWhatsAppUrl(
                        message
                          ? `Olá! Meu nome é ${name || 'cliente'}. ${message}`
                          : undefined
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#E5E5E5] bg-[#2C2C2C] hover:bg-[#363636] rounded-lg transition-colors whitespace-nowrap"
                    >
                      <MessageCircle className="w-4 h-4 text-[#E63946]" aria-hidden="true" />
                      Enviar via WhatsApp
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
