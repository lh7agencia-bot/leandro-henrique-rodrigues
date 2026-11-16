import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  Edit3,
  HelpCircle,
  Image as ImageIcon,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import type {
  AdminOverviewData,
  BookingStatus,
  FaqItem,
  GalleryPhoto,
  MenuItem,
} from '../types';
import { formatCurrencyBRL, formatDateBR } from '../lib/business';
import { ResilientImage } from './ResilientImage';

type AdminTab =
  | 'menu'
  | 'gallery'
  | 'bookings'
  | 'testimonials'
  | 'faqs'
  | 'messages';

interface AdminPanelProps {
  onBackToSite: () => void;
}

const PRESET_IMAGES = [
  {
    label: 'Pizza Pepperoni',
    url: '/src/assets/images/pizza_pepperoni_artesanal_1794852433336.jpg',
  },
  {
    label: 'Pizza Margherita',
    url: '/src/assets/images/pizza_margherita_napolitana_1794852433831.jpg',
  },
  {
    label: 'Massa Artesanal',
    url: '/src/assets/images/massa_artesanal_ragu_1794852434004.jpg',
  },
  {
    label: 'Tiramisù Clássico',
    url: '/src/assets/images/tiramisu_italiano_classico_1794852436083.jpg',
  },
];

export function AdminPanel({ onBackToSite }: AdminPanelProps) {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('menu');
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Menu form state
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [menuCategory, setMenuCategory] = useState('Pizzas Especiais');
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuPrice, setMenuPrice] = useState('69.90');
  const [menuPhotoUrl, setMenuPhotoUrl] = useState(PRESET_IMAGES[0].url);
  const [menuActive, setMenuActive] = useState(true);

  // Gallery form state
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryOrder, setGalleryOrder] = useState('1');

  // FAQ form state
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqOrder, setFaqOrder] = useState('1');

  async function loadOverview() {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error('Falha ao carregar painel');
      const data = (await res.json()) as AdminOverviewData;
      setOverview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/session');
        const data = (await res.json()) as { authenticated?: boolean };
        if (data.authenticated) {
          setAuthenticated(true);
          await loadOverview();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingSession(false);
      }
    }
    checkSession();
  }, []);

  function notify(msg: string) {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = (await res.json()) as { authenticated?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }
      setAuthenticated(true);
      setPasswordInput('');
      await loadOverview();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Erro ao entrar.');
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setOverview(null);
  }

  // Menu handlers
  function startEditMenu(item: MenuItem) {
    setEditingMenuId(item.id);
    setMenuCategory(item.category);
    setMenuName(item.name);
    setMenuDescription(item.description);
    setMenuPrice(String(item.price));
    setMenuPhotoUrl(item.photoUrl);
    setMenuActive(item.active);
  }

  function resetMenuForm() {
    setEditingMenuId(null);
    setMenuCategory('Pizzas Especiais');
    setMenuName('');
    setMenuDescription('');
    setMenuPrice('69.90');
    setMenuPhotoUrl(PRESET_IMAGES[0].url);
    setMenuActive(true);
  }

  async function saveMenuItem(e: FormEvent) {
    e.preventDefault();
    const payload = {
      category: menuCategory,
      name: menuName,
      description: menuDescription,
      price: Number(menuPrice.replace(',', '.')),
      photoUrl: menuPhotoUrl,
      active: menuActive,
      sortOrder: editingMenuId
        ? undefined
        : (overview?.menuItems.length ?? 0) + 1,
    };

    const url = editingMenuId
      ? `/api/admin/menu/${editingMenuId}`
      : '/api/admin/menu';
    const method = editingMenuId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      resetMenuForm();
      await loadOverview();
      notify(editingMenuId ? 'Item atualizado.' : 'Item adicionado ao cardápio.');
    }
  }

  async function removeMenuItem(id: string) {
    const res = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (editingMenuId === id) resetMenuForm();
      await loadOverview();
      notify('Item removido do cardápio.');
    }
  }

  // Gallery handlers
  function startEditGallery(photo: GalleryPhoto) {
    setEditingGalleryId(photo.id);
    setGalleryUrl(photo.imageUrl);
    setGalleryCaption(photo.caption);
    setGalleryOrder(String(photo.displayOrder));
  }

  function resetGalleryForm() {
    setEditingGalleryId(null);
    setGalleryUrl('');
    setGalleryCaption('');
    setGalleryOrder(String((overview?.galleryPhotos.length ?? 0) + 1));
  }

  async function saveGalleryPhoto(e: FormEvent) {
    e.preventDefault();
    const payload = {
      imageUrl: galleryUrl,
      caption: galleryCaption,
      displayOrder: Number(galleryOrder) || 1,
    };
    const url = editingGalleryId
      ? `/api/admin/gallery/${editingGalleryId}`
      : '/api/admin/gallery';
    const method = editingGalleryId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      resetGalleryForm();
      await loadOverview();
      notify(editingGalleryId ? 'Foto atualizada.' : 'Foto adicionada à galeria.');
    }
  }

  async function removeGalleryPhoto(id: string) {
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (editingGalleryId === id) resetGalleryForm();
      await loadOverview();
      notify('Foto removida da galeria.');
    }
  }

  // Booking handlers
  async function changeBookingStatus(id: string, status: BookingStatus) {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await loadOverview();
      notify('Status da reserva atualizado.');
    }
  }

  async function removeBooking(id: string) {
    const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadOverview();
      notify('Reserva removida.');
    }
  }

  // Testimonial handlers
  async function toggleTestimonialStatus(id: string, nextStatus: 'aprovado' | 'pendente') {
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      await loadOverview();
      notify(
        nextStatus === 'aprovado'
          ? 'Depoimento aprovado e publicado no site.'
          : 'Depoimento movido para pendente.'
      );
    }
  }

  async function removeTestimonial(id: string) {
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadOverview();
      notify('Depoimento excluído.');
    }
  }

  // FAQ handlers
  function startEditFaq(faq: FaqItem) {
    setEditingFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqOrder(String(faq.displayOrder));
  }

  function resetFaqForm() {
    setEditingFaqId(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqOrder(String((overview?.faqs.length ?? 0) + 1));
  }

  async function saveFaq(e: FormEvent) {
    e.preventDefault();
    const payload = {
      question: faqQuestion,
      answer: faqAnswer,
      displayOrder: Number(faqOrder) || 1,
    };
    const url = editingFaqId
      ? `/api/admin/faqs/${editingFaqId}`
      : '/api/admin/faqs';
    const method = editingFaqId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      resetFaqForm();
      await loadOverview();
      notify(editingFaqId ? 'Pergunta atualizada.' : 'Pergunta adicionada ao FAQ.');
    }
  }

  async function removeFaq(id: string) {
    const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (editingFaqId === id) resetFaqForm();
      await loadOverview();
      notify('Pergunta removida.');
    }
  }

  // Message handlers
  async function toggleMessageRead(id: string, read: boolean) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    });
    if (res.ok) {
      await loadOverview();
    }
  }

  async function removeMessage(id: string) {
    const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadOverview();
      notify('Mensagem removida.');
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F4] flex items-center justify-center p-6">
        <p className="text-sm text-[#A3A3A3]">Verificando sessão...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F4] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#222222] border border-[#2E2E2E] p-8 space-y-6">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A3A3A3] hover:text-white transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Voltar para o site
            </button>
            <h1 className="font-display text-2xl font-bold text-[#F5F5F4]">
              Painel Administrativo
            </h1>
            <p className="text-sm text-[#A3A3A3]">
              Acrópole Restaurante &amp; Pizzaria
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-user"
                className="block text-sm font-medium text-[#E5E5E5] mb-1.5"
              >
                Usuário
              </label>
              <input
                id="admin-user"
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] focus:outline-none focus:border-[#E63946]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-pass"
                className="block text-sm font-medium text-[#E5E5E5] mb-1.5"
              >
                Senha
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-[#F5F5F4] focus:outline-none focus:border-[#E63946]"
              />
            </div>

            {loginError && (
              <p
                role="alert"
                className="text-sm text-[#FF7B85] bg-[#E63946]/10 border border-[#E63946]/40 rounded-lg px-3.5 py-2.5"
              >
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full h-11 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {loggingIn ? 'Entrando...' : 'Entrar no Painel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingBookings =
    overview?.bookings.filter((b) => b.status === 'pendente').length ?? 0;
  const pendingTestimonials =
    overview?.testimonials.filter((t) => t.status === 'pendente').length ?? 0;
  const unreadMessages =
    overview?.contactMessages.filter((m) => !m.read).length ?? 0;

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'menu', label: 'Cardápio', count: overview?.menuItems.length },
    { id: 'gallery', label: 'Galeria', count: overview?.galleryPhotos.length },
    { id: 'bookings', label: 'Agendamentos', count: pendingBookings || overview?.bookings.length },
    { id: 'testimonials', label: 'Depoimentos', count: pendingTestimonials || overview?.testimonials.length },
    { id: 'faqs', label: 'FAQ', count: overview?.faqs.length },
    { id: 'messages', label: 'Mensagens', count: unreadMessages || overview?.contactMessages.length },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F4]">
      <header className="sticky top-0 z-30 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-display text-xl font-bold text-[#F5F5F4] truncate">
              Acrópole Admin
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#E5E5E5] bg-[#242424] hover:bg-[#2E2E2E] border border-[#323232] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Ver site
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-4">
            <p className="text-xs text-[#A3A3A3]">Itens no Cardápio</p>
            <p className="mt-1 text-2xl font-bold text-[#F5F5F4] tabular-nums">
              {overview?.menuItems.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-4">
            <p className="text-xs text-[#A3A3A3]">Reservas Pendentes</p>
            <p className="mt-1 text-2xl font-bold text-[#E63946] tabular-nums">
              {pendingBookings}
            </p>
          </div>
          <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-4">
            <p className="text-xs text-[#A3A3A3]">Depoimentos Pendentes</p>
            <p className="mt-1 text-2xl font-bold text-[#F5F5F4] tabular-nums">
              {pendingTestimonials}
            </p>
          </div>
          <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-4">
            <p className="text-xs text-[#A3A3A3]">Mensagens Não Lidas</p>
            <p className="mt-1 text-2xl font-bold text-[#F5F5F4] tabular-nums">
              {unreadMessages}
            </p>
          </div>
        </div>

        {actionMessage && (
          <div
            role="status"
            className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-4 py-3 text-sm font-medium"
          >
            {actionMessage}
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#222222] border border-[#2E2E2E] rounded-lg overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#E63946] text-white'
                    : 'text-[#C4C4C4] hover:text-white hover:bg-[#2C2C2C]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-xs opacity-80 tabular-nums">
                    ({tab.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loadingData && !overview ? (
          <p className="text-sm text-[#A3A3A3]">Carregando dados...</p>
        ) : (
          <>
            {/* TAB 1: MENU */}
            {activeTab === 'menu' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form
                  onSubmit={saveMenuItem}
                  className="lg:col-span-5 rounded-xl bg-[#222222] border border-[#2E2E2E] p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-[#E63946]" aria-hidden="true" />
                      {editingMenuId ? 'Editar Item' : 'Novo Item do Cardápio'}
                    </h2>
                    {editingMenuId && (
                      <button
                        type="button"
                        onClick={resetMenuForm}
                        className="text-xs text-[#A3A3A3] hover:text-white cursor-pointer"
                      >
                        Cancelar edição
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                      Categoria
                    </label>
                    <input
                      type="text"
                      required
                      value={menuCategory}
                      onChange={(e) => setMenuCategory(e.target.value)}
                      placeholder="Ex.: Pizzas Especiais"
                      className="w-full h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white focus:outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                      Nome do Prato / Pizza
                    </label>
                    <input
                      type="text"
                      required
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                      placeholder="Ex.: Pepperoni Acrópole"
                      className="w-full h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white focus:outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                      Descrição
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={menuDescription}
                      onChange={(e) => setMenuDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white focus:outline-none focus:border-[#E63946] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={menuPrice}
                        onChange={(e) => setMenuPrice(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white tabular-nums focus:outline-none focus:border-[#E63946]"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="inline-flex items-center gap-2 text-sm text-[#E5E5E5] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={menuActive}
                          onChange={(e) => setMenuActive(e.target.checked)}
                          className="accent-[#E63946] w-4 h-4"
                        />
                        Visível no site
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                      URL da Foto
                    </label>
                    <input
                      type="text"
                      value={menuPhotoUrl}
                      onChange={(e) => setMenuPhotoUrl(e.target.value)}
                      placeholder="https://... ou caminho local"
                      className="w-full h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white focus:outline-none focus:border-[#E63946]"
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setMenuPhotoUrl(preset.url)}
                          className="px-2.5 py-1 text-xs rounded bg-[#1A1A1A] hover:bg-[#2E2E2E] border border-[#323232] text-[#D4D4D4] cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {editingMenuId ? 'Salvar Alterações' : 'Adicionar ao Cardápio'}
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-3">
                  {overview?.menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <ResilientImage
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-20 h-16 rounded-lg object-cover shrink-0 bg-[#161616]"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-[#A3A3A3]">
                            {item.category} ·{' '}
                            <span className={item.active ? 'text-emerald-400' : 'text-amber-400'}>
                              {item.active ? 'Ativo' : 'Oculto'}
                            </span>
                          </p>
                          <p className="font-semibold text-[#F5F5F4] truncate">
                            {item.name}
                          </p>
                          <p className="text-sm font-semibold text-[#E63946] tabular-nums mt-0.5">
                            {formatCurrencyBRL(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditMenu(item)}
                          className="px-3 py-2 text-xs font-medium bg-[#2C2C2C] hover:bg-[#383838] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMenuItem(item.id)}
                          aria-label={`Excluir ${item.name}`}
                          className="p-2 text-xs text-[#FF7B85] bg-[#2C2C2C] hover:bg-[#E63946] hover:text-white rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: GALLERY */}
            {activeTab === 'gallery' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form
                  onSubmit={saveGalleryPhoto}
                  className="lg:col-span-5 rounded-xl bg-[#222222] border border-[#2E2E2E] p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#E63946]" aria-hidden="true" />
                      {editingGalleryId ? 'Editar Foto' : 'Adicionar Foto à Galeria'}
                    </h2>
                    {editingGalleryId && (
                      <button
                        type="button"
                        onClick={resetGalleryForm}
                        className="text-xs text-[#A3A3A3] hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                      URL da Imagem
                    </label>
                    <input
                      type="text"
                      required
                      value={galleryUrl}
                      onChange={(e) => setGalleryUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white focus:outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                      Legenda
                    </label>
                    <input
                      type="text"
                      required
                      value={galleryCaption}
                      onChange={(e) => setGalleryCaption(e.target.value)}
                      placeholder="Descrição da foto"
                      className="w-full h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white focus:outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                      Ordem de Exibição
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={galleryOrder}
                      onChange={(e) => setGalleryOrder(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white tabular-nums focus:outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {editingGalleryId ? 'Atualizar Foto' : 'Adicionar Foto'}
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-3">
                  {overview?.galleryPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <ResilientImage
                          src={photo.imageUrl}
                          alt={photo.caption}
                          className="w-20 h-16 rounded-lg object-cover shrink-0 bg-[#161616]"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-[#A3A3A3] tabular-nums">
                            Ordem #{photo.displayOrder}
                          </p>
                          <p className="text-sm font-medium text-[#F5F5F4] line-clamp-2">
                            {photo.caption}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditGallery(photo)}
                          className="px-3 py-2 text-xs font-medium bg-[#2C2C2C] hover:bg-[#383838] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGalleryPhoto(photo.id)}
                          aria-label="Excluir foto"
                          className="p-2 text-xs text-[#FF7B85] bg-[#2C2C2C] hover:bg-[#E63946] hover:text-white rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#E63946]" aria-hidden="true" />
                  Agendamentos Recebidos
                </h2>

                {overview?.bookings.length === 0 ? (
                  <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-10 text-center text-[#A3A3A3]">
                    Nenhuma reserva recebida até o momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overview?.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A3A3A3] tabular-nums">
                            <span>{formatDateBR(booking.bookingDate)}</span>
                            <span aria-hidden="true">·</span>
                            <span>{booking.bookingTime}</span>
                            <span aria-hidden="true">·</span>
                            <span>{booking.guests} pessoas</span>
                          </div>
                          <p className="text-base font-semibold text-[#F5F5F4]">
                            {booking.customerName}
                          </p>
                          <p className="text-sm text-[#D4D4D4] tabular-nums">
                            Contato: {booking.contact}
                          </p>
                          {booking.notes && (
                            <p className="text-xs text-[#A3A3A3]">
                              Obs.: {booking.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                          <select
                            aria-label={`Status da reserva de ${booking.customerName}`}
                            value={booking.status}
                            onChange={(e) =>
                              changeBookingStatus(
                                booking.id,
                                e.target.value as BookingStatus
                              )
                            }
                            className="h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white focus:outline-none focus:border-[#E63946]"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => removeBooking(booking.id)}
                            aria-label={`Excluir reserva de ${booking.customerName}`}
                            className="p-2.5 text-[#FF7B85] bg-[#2C2C2C] hover:bg-[#E63946] hover:text-white rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: TESTIMONIALS */}
            {activeTab === 'testimonials' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#E63946]" aria-hidden="true" />
                  Depoimentos de Clientes
                </h2>

                <div className="space-y-3">
                  {overview?.testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
                          <span className="font-semibold text-[#F5F5F4] text-sm">
                            {t.customerName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{t.rating}/5 estrelas</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              t.status === 'aprovado'
                                ? 'text-emerald-400 font-medium'
                                : 'text-amber-400 font-medium'
                            }
                          >
                            {t.status === 'aprovado' ? 'Aprovado' : 'Pendente'}
                          </span>
                        </div>
                        <p className="text-sm text-[#D4D4D4]">{t.content}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            toggleTestimonialStatus(
                              t.id,
                              t.status === 'aprovado' ? 'pendente' : 'aprovado'
                            )
                          }
                          className={`px-3.5 py-2 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                            t.status === 'aprovado'
                              ? 'bg-[#2C2C2C] hover:bg-[#383838] text-[#E5E5E5]'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          {t.status === 'aprovado' ? 'Ocultar' : 'Aprovar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTestimonial(t.id)}
                          aria-label={`Excluir depoimento de ${t.customerName}`}
                          className="p-2 text-[#FF7B85] bg-[#2C2C2C] hover:bg-[#E63946] hover:text-white rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: FAQS */}
            {activeTab === 'faqs' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form
                  onSubmit={saveFaq}
                  className="lg:col-span-5 rounded-xl bg-[#222222] border border-[#2E2E2E] p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-[#E63946]" aria-hidden="true" />
                      {editingFaqId ? 'Editar Pergunta' : 'Nova Pergunta FAQ'}
                    </h2>
                    {editingFaqId && (
                      <button
                        type="button"
                        onClick={resetFaqForm}
                        className="text-xs text-[#A3A3A3] hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                      Pergunta
                    </label>
                    <input
                      type="text"
                      required
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white focus:outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                      Resposta
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={faqAnswer}
                      onChange={(e) => setFaqAnswer(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white focus:outline-none focus:border-[#E63946] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D4] mb-1">
                      Ordem
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={faqOrder}
                      onChange={(e) => setFaqOrder(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#323232] text-sm text-white tabular-nums focus:outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {editingFaqId ? 'Atualizar Pergunta' : 'Adicionar Pergunta'}
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-3">
                  {overview?.faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-[#A3A3A3] tabular-nums">
                          Ordem #{faq.displayOrder}
                        </p>
                        <p className="font-semibold text-[#F5F5F4]">{faq.question}</p>
                        <p className="text-sm text-[#B3B3B3]">{faq.answer}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditFaq(faq)}
                          className="px-3 py-2 text-xs font-medium bg-[#2C2C2C] hover:bg-[#383838] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFaq(faq.id)}
                          aria-label="Excluir pergunta"
                          className="p-2 text-xs text-[#FF7B85] bg-[#2C2C2C] hover:bg-[#E63946] hover:text-white rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: CONTACT MESSAGES */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#E63946]" aria-hidden="true" />
                  Mensagens de Contato
                </h2>

                {overview?.contactMessages.length === 0 ? (
                  <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-10 text-center text-[#A3A3A3]">
                    Nenhuma mensagem recebida pelo formulário até o momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overview?.contactMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A3A3A3] tabular-nums">
                            <span className="text-sm font-semibold text-[#F5F5F4]">
                              {msg.name}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{msg.email}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatDateBR(msg.createdAt)}</span>
                            <span aria-hidden="true">·</span>
                            <span className={msg.read ? 'text-[#A3A3A3]' : 'text-[#E63946] font-semibold'}>
                              {msg.read ? 'Lida' : 'Não lida'}
                            </span>
                          </div>
                          <p className="text-sm text-[#D4D4D4] leading-relaxed">
                            {msg.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleMessageRead(msg.id, !msg.read)}
                            className="px-3.5 py-2 text-xs font-medium bg-[#2C2C2C] hover:bg-[#383838] rounded-lg cursor-pointer"
                          >
                            {msg.read ? 'Marcar não lida' : 'Marcar como lida'}
                          </button>
                          <a
                            href={`mailto:${msg.email}?subject=${encodeURIComponent('Retorno - Acrópole Restaurante & Pizzaria')}`}
                            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg"
                          >
                            Responder
                          </a>
                          <button
                            type="button"
                            onClick={() => removeMessage(msg.id)}
                            aria-label={`Excluir mensagem de ${msg.name}`}
                            className="p-2 text-[#FF7B85] bg-[#2C2C2C] hover:bg-[#E63946] hover:text-white rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
