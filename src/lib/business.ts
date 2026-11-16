export const BUSINESS = {
  name: 'Acrópole Restaurante & Pizzaria',
  shortName: 'Acrópole',
  slogan: 'Massa perfeita, sabor inesquecível',
  address: 'Av. Senador Pinheiro Machado, 1008 - José Menino, Santos - SP, 11065-605',
  shortAddress: 'Av. Senador Pinheiro Machado, 1008 · José Menino, Santos - SP',
  phoneDisplay: '(13) 3237-3609',
  phoneDigits: '551332373609',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Av.+Senador+Pinheiro+Machado,+1008+-+Jose+Menino,+Santos+-+SP,+11065-605',
} as const;

export function buildWhatsAppUrl(message?: string): string {
  const defaultMsg =
    'Olá! Gostaria de falar com a Acrópole Restaurante & Pizzaria.';
  const encoded = encodeURIComponent(message || defaultMsg);
  return `https://wa.me/${BUSINESS.phoneDigits}?text=${encoded}`;
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBR(isoDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
