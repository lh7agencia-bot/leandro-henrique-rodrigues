import { useState, type FormEvent } from 'react';
import { Calendar, CheckCircle2, Clock, Phone, Users } from 'lucide-react';
import { BUSINESS, buildWhatsAppUrl, formatDateBR } from '../lib/business';
import type { Booking } from '../types';

const TIME_SLOTS = [
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
];

function getTodayDateISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function BookingSection() {
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [bookingDate, setBookingDate] = useState(getTodayDateISO());
  const [bookingTime, setBookingTime] = useState('20:00');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          contact,
          bookingDate,
          bookingTime,
          guests,
          notes,
        }),
      });
      const data = (await res.json()) as Booking & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível concluir a reserva.');
      }
      setConfirmedBooking(data);
      setCustomerName('');
      setContact('');
      setNotes('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao enviar solicitação de reserva.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="reservas"
      className="py-20 sm:py-24 border-t border-[#2A2A2A] bg-[#1A1A1A]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#E63946] mb-2">
                03. Agendamento Online
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F4] tracking-tight text-balance">
                Garanta sua mesa na Acrópole sem espera
              </h2>
              <p className="mt-3 text-base text-[#B3B3B3] leading-relaxed">
                Escolha a data e o horário desejados para jantares em família,
                encontros a dois ou comemorações em grupo no José Menino.
              </p>
            </div>

            <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold text-[#F5F5F4]">
                    Confirmação rápida
                  </h3>
                  <p className="text-sm text-[#A3A3A3] mt-0.5">
                    Sua solicitação é registrada imediatamente pela nossa equipe de
                    atendimento.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2E2E2E] flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold text-[#F5F5F4]">
                    Atendimento direto para grupos
                  </h3>
                  <p className="text-sm text-[#A3A3A3] mt-0.5 tabular-nums">
                    Para eventos acima de 10 pessoas, ligue ou chame no WhatsApp{' '}
                    <a
                      href={buildWhatsAppUrl('Olá! Gostaria de reservar uma mesa para grupo.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F5F5F4] underline decoration-[#E63946] underline-offset-4 hover:text-[#E63946] transition-colors"
                    >
                      {BUSINESS.phoneDisplay}
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-6 sm:p-8">
              {confirmedBooking ? (
                <div className="space-y-5 py-4">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="w-7 h-7 shrink-0" aria-hidden="true" />
                    <h3 className="font-display text-2xl font-bold text-[#F5F5F4]">
                      Solicitação de reserva registrada
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base text-[#D4D4D4] leading-relaxed">
                    Recebemos o pedido de reserva para{' '}
                    <strong className="text-white">
                      {confirmedBooking.customerName}
                    </strong>{' '}
                    no dia{' '}
                    <strong className="text-white tabular-nums">
                      {formatDateBR(confirmedBooking.bookingDate)}
                    </strong>{' '}
                    às{' '}
                    <strong className="text-white tabular-nums">
                      {confirmedBooking.bookingTime}
                    </strong>{' '}
                    ({confirmedBooking.guests} pessoas).
                  </p>

                  <div className="rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] p-4 text-xs sm:text-sm text-[#A3A3A3] flex flex-wrap items-center gap-3">
                    <span>Código: {confirmedBooking.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>Status: Aguardando confirmação</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={buildWhatsAppUrl(
                        `Olá! Acabei de solicitar uma reserva no site (código ${confirmedBooking.id}) para ${confirmedBooking.customerName}, dia ${formatDateBR(confirmedBooking.bookingDate)} às ${confirmedBooking.bookingTime} para ${confirmedBooking.guests} pessoas.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Confirmar agora pelo WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => setConfirmedBooking(null)}
                      className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-[#E5E5E5] bg-[#2C2C2C] hover:bg-[#363636] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Fazer outra reserva
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="booking-name"
                        className="block text-sm font-medium text-[#E5E5E5] mb-2"
                      >
                        Nome completo
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full h-11 px-3.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] placeholder:text-[#737373] focus:outline-none focus:border-[#E63946] transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="booking-contact"
                        className="block text-sm font-medium text-[#E5E5E5] mb-2"
                      >
                        Telefone / WhatsApp
                      </label>
                      <input
                        id="booking-contact"
                        type="tel"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="(13) 99999-9999"
                        className="w-full h-11 px-3.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] placeholder:text-[#737373] focus:outline-none focus:border-[#E63946] transition-colors tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label
                        htmlFor="booking-date"
                        className="block text-sm font-medium text-[#E5E5E5] mb-2"
                      >
                        Data
                      </label>
                      <input
                        id="booking-date"
                        type="date"
                        required
                        min={getTodayDateISO()}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] focus:outline-none focus:border-[#E63946] transition-colors tabular-nums"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="booking-time"
                        className="block text-sm font-medium text-[#E5E5E5] mb-2"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#A3A3A3]" aria-hidden="true" />
                          Horário
                        </span>
                      </label>
                      <select
                        id="booking-time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] focus:outline-none focus:border-[#E63946] transition-colors tabular-nums"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="booking-guests"
                        className="block text-sm font-medium text-[#E5E5E5] mb-2"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#A3A3A3]" aria-hidden="true" />
                          Pessoas
                        </span>
                      </label>
                      <input
                        id="booking-guests"
                        type="number"
                        min={1}
                        max={40}
                        required
                        value={guests}
                        onChange={(e) =>
                          setGuests(Math.max(1, Math.min(40, Number(e.target.value) || 1)))
                        }
                        className="w-full h-11 px-3.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] focus:outline-none focus:border-[#E63946] transition-colors tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="booking-notes"
                      className="block text-sm font-medium text-[#E5E5E5] mb-2"
                    >
                      Observações (opcional)
                    </label>
                    <textarea
                      id="booking-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex.: aniversário, preferência de mesa ou restrição alimentar"
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

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {submitting ? 'Enviando reserva...' : 'Solicitar Reserva'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
