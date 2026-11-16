import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createSessionToken,
  getAdminFromRequest,
  requireAdmin,
  SESSION_COOKIE_NAME,
  verifyAdminCredentials,
} from './src/server/auth.ts';
import {
  createBooking,
  createContactMessage,
  createFaqItem,
  createGalleryPhoto,
  createMenuItem,
  createTestimonial,
  deleteBooking,
  deleteContactMessage,
  deleteFaqItem,
  deleteGalleryPhoto,
  deleteMenuItem,
  deleteTestimonial,
  getAdminOverviewData,
  getPublicSiteData,
  updateBookingStatus,
  updateContactMessageRead,
  updateFaqItem,
  updateGalleryPhoto,
  updateMenuItem,
  updateTestimonialStatus,
} from './src/server/db.ts';
import type { BookingStatus, TestimonialStatus } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));

// Public Routes
app.get('/api/public-data', async (_req, res) => {
  try {
    const data = await getPublicSiteData();
    res.json(data);
  } catch (err) {
    console.error('Error loading public data:', err);
    res.status(500).json({ error: 'Não foi possível carregar os dados do site.' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const customerName = String(body.customerName ?? '').trim();
    const contact = String(body.contact ?? '').trim();
    const bookingDate = String(body.bookingDate ?? '').trim();
    const bookingTime = String(body.bookingTime ?? '').trim();
    const guests = Math.min(40, Math.max(1, Number(body.guests ?? 2) || 2));
    const notes = String(body.notes ?? '').trim().slice(0, 500);

    if (!customerName || customerName.length < 2) {
      res.status(400).json({ error: 'Informe seu nome completo.' });
      return;
    }
    if (!contact || contact.length < 8) {
      res.status(400).json({ error: 'Informe um telefone ou WhatsApp válido.' });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
      res.status(400).json({ error: 'Selecione uma data válida.' });
      return;
    }
    if (!bookingTime) {
      res.status(400).json({ error: 'Selecione um horário disponível.' });
      return;
    }

    const booking = await createBooking({
      customerName: customerName.slice(0, 120),
      contact: contact.slice(0, 80),
      bookingDate,
      bookingTime: bookingTime.slice(0, 16),
      guests,
      notes,
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Não foi possível registrar sua reserva.' });
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const customerName = String(body.customerName ?? '').trim();
    const content = String(body.content ?? '').trim();
    const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating ?? 5) || 5)));

    if (!customerName || customerName.length < 2) {
      res.status(400).json({ error: 'Informe seu nome.' });
      return;
    }
    if (!content || content.length < 10) {
      res.status(400).json({ error: 'Escreva um breve comentário sobre sua experiência.' });
      return;
    }

    const created = await createTestimonial({
      customerName: customerName.slice(0, 100),
      content: content.slice(0, 600),
      rating,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating testimonial:', err);
    res.status(500).json({ error: 'Não foi possível enviar seu depoimento.' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!name || name.length < 2) {
      res.status(400).json({ error: 'Informe seu nome.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Informe um e-mail válido.' });
      return;
    }
    if (!message || message.length < 5) {
      res.status(400).json({ error: 'Escreva sua mensagem.' });
      return;
    }

    const saved = await createContactMessage({
      name: name.slice(0, 120),
      email: email.slice(0, 160),
      message: message.slice(0, 1500),
    });
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving contact message:', err);
    res.status(500).json({ error: 'Não foi possível enviar sua mensagem.' });
  }
});

// Admin Auth Routes
app.get('/api/admin/session', (req, res) => {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    res.json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, username: admin.username });
});

app.post('/api/admin/login', (req, res) => {
  const body = req.body as Record<string, unknown>;
  const username = String(body.username ?? '').trim();
  const password = String(body.password ?? '');

  if (!verifyAdminCredentials(username, password)) {
    res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    return;
  }

  const token = createSessionToken(username);
  const isHttps =
    req.secure || req.headers['x-forwarded-proto'] === 'https';

  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  });
  res.json({ authenticated: true, username });
});

app.post('/api/admin/logout', (req, res) => {
  const isHttps =
    req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    path: '/',
  });
  res.json({ authenticated: false });
});

// Protected Admin CRUD Routes
app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
  try {
    const data = await getAdminOverviewData();
    res.json(data);
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Erro ao carregar painel administrativo.' });
  }
});

// Menu Items CRUD
app.post('/api/admin/menu', requireAdmin, async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const category = String(body.category ?? '').trim();
    const name = String(body.name ?? '').trim();
    const description = String(body.description ?? '').trim();
    const price = Number(body.price);
    const photoUrl = String(body.photoUrl ?? '').trim();
    const active = body.active !== false;
    const sortOrder = Number(body.sortOrder ?? 0) || 0;

    if (!category || !name || !Number.isFinite(price) || price < 0) {
      res.status(400).json({ error: 'Preencha categoria, nome e preço válido.' });
      return;
    }

    const item = await createMenuItem({
      category,
      name,
      description,
      price,
      photoUrl,
      active,
      sortOrder,
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('Create menu item error:', err);
    res.status(500).json({ error: 'Erro ao salvar item do cardápio.' });
  }
});

app.patch('/api/admin/menu/:id', requireAdmin, async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const updated = await updateMenuItem(String(req.params.id), {
      category: body.category !== undefined ? String(body.category).trim() : undefined,
      name: body.name !== undefined ? String(body.name).trim() : undefined,
      description:
        body.description !== undefined ? String(body.description).trim() : undefined,
      price: body.price !== undefined ? Number(body.price) : undefined,
      photoUrl: body.photoUrl !== undefined ? String(body.photoUrl).trim() : undefined,
      active: body.active !== undefined ? Boolean(body.active) : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
    });
    res.json(updated);
  } catch (err) {
    console.error('Update menu item error:', err);
    res.status(500).json({ error: 'Erro ao atualizar item.' });
  }
});

app.delete('/api/admin/menu/:id', requireAdmin, async (req, res) => {
  try {
    await deleteMenuItem(String(req.params.id));
    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete menu item error:', err);
    res.status(500).json({ error: 'Erro ao remover item.' });
  }
});

// Gallery Photos CRUD
app.post('/api/admin/gallery', requireAdmin, async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const imageUrl = String(body.imageUrl ?? '').trim();
    const caption = String(body.caption ?? '').trim();
    const displayOrder = Number(body.displayOrder ?? 1) || 1;
    if (!imageUrl) {
      res.status(400).json({ error: 'Informe a URL da imagem.' });
      return;
    }
    const created = await createGalleryPhoto({ imageUrl, caption, displayOrder });
    res.status(201).json(created);
  } catch (err) {
    console.error('Create gallery photo error:', err);
    res.status(500).json({ error: 'Erro ao adicionar foto.' });
  }
});

app.patch('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const updated = await updateGalleryPhoto(String(req.params.id), {
      imageUrl: body.imageUrl !== undefined ? String(body.imageUrl).trim() : undefined,
      caption: body.caption !== undefined ? String(body.caption).trim() : undefined,
      displayOrder:
        body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
    });
    res.json(updated);
  } catch (err) {
    console.error('Update gallery photo error:', err);
    res.status(500).json({ error: 'Erro ao atualizar foto.' });
  }
});

app.delete('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
  try {
    await deleteGalleryPhoto(String(req.params.id));
    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete gallery photo error:', err);
    res.status(500).json({ error: 'Erro ao remover foto.' });
  }
});

// Bookings Management
app.patch('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
  try {
    const status = String((req.body as Record<string, unknown>).status ?? '') as BookingStatus;
    if (!['pendente', 'confirmado', 'cancelado'].includes(status)) {
      res.status(400).json({ error: 'Status inválido.' });
      return;
    }
    const updated = await updateBookingStatus(String(req.params.id), status);
    res.json(updated);
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ error: 'Erro ao atualizar reserva.' });
  }
});

app.delete('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
  try {
    await deleteBooking(String(req.params.id));
    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ error: 'Erro ao excluir reserva.' });
  }
});

// Testimonials Management
app.patch('/api/admin/testimonials/:id', requireAdmin, async (req, res) => {
  try {
    const status = String(
      (req.body as Record<string, unknown>).status ?? ''
    ) as TestimonialStatus;
    if (!['aprovado', 'pendente'].includes(status)) {
      res.status(400).json({ error: 'Status inválido.' });
      return;
    }
    const updated = await updateTestimonialStatus(String(req.params.id), status);
    res.json(updated);
  } catch (err) {
    console.error('Update testimonial error:', err);
    res.status(500).json({ error: 'Erro ao atualizar depoimento.' });
  }
});

app.delete('/api/admin/testimonials/:id', requireAdmin, async (req, res) => {
  try {
    await deleteTestimonial(String(req.params.id));
    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete testimonial error:', err);
    res.status(500).json({ error: 'Erro ao excluir depoimento.' });
  }
});

// FAQs CRUD
app.post('/api/admin/faqs', requireAdmin, async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const question = String(body.question ?? '').trim();
    const answer = String(body.answer ?? '').trim();
    const displayOrder = Number(body.displayOrder ?? 1) || 1;
    if (!question || !answer) {
      res.status(400).json({ error: 'Preencha pergunta e resposta.' });
      return;
    }
    const created = await createFaqItem({ question, answer, displayOrder });
    res.status(201).json(created);
  } catch (err) {
    console.error('Create FAQ error:', err);
    res.status(500).json({ error: 'Erro ao criar pergunta.' });
  }
});

app.patch('/api/admin/faqs/:id', requireAdmin, async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const updated = await updateFaqItem(String(req.params.id), {
      question: body.question !== undefined ? String(body.question).trim() : undefined,
      answer: body.answer !== undefined ? String(body.answer).trim() : undefined,
      displayOrder:
        body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
    });
    res.json(updated);
  } catch (err) {
    console.error('Update FAQ error:', err);
    res.status(500).json({ error: 'Erro ao atualizar pergunta.' });
  }
});

app.delete('/api/admin/faqs/:id', requireAdmin, async (req, res) => {
  try {
    await deleteFaqItem(String(req.params.id));
    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete FAQ error:', err);
    res.status(500).json({ error: 'Erro ao excluir pergunta.' });
  }
});

// Contact Messages Management
app.patch('/api/admin/messages/:id', requireAdmin, async (req, res) => {
  try {
    const read = Boolean((req.body as Record<string, unknown>).read);
    const updated = await updateContactMessageRead(String(req.params.id), read);
    res.json(updated);
  } catch (err) {
    console.error('Update message error:', err);
    res.status(500).json({ error: 'Erro ao atualizar mensagem.' });
  }
});

app.delete('/api/admin/messages/:id', requireAdmin, async (req, res) => {
  try {
    await deleteContactMessage(String(req.params.id));
    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ error: 'Erro ao excluir mensagem.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Acrópole Restaurante & Pizzaria server running on port ${PORT}`);
  });
}

startServer();
