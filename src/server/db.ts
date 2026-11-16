import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type {
  AdminOverviewData,
  Booking,
  BookingStatus,
  ContactMessage,
  FaqItem,
  GalleryPhoto,
  MenuItem,
  PublicSiteData,
  Testimonial,
  TestimonialStatus,
} from '../types.ts';
import {
  INITIAL_BOOKINGS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_FAQS,
  INITIAL_GALLERY_PHOTOS,
  INITIAL_MENU_ITEMS,
  INITIAL_TESTIMONIALS,
} from './seed.ts';

interface LocalDatabase {
  menuItems: MenuItem[];
  galleryPhotos: GalleryPhoto[];
  bookings: Booking[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  contactMessages: ContactMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'acropole-db.json');

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseClient;
}

function ensureLocalDb(): LocalDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial: LocalDatabase = {
      menuItems: INITIAL_MENU_ITEMS,
      galleryPhotos: INITIAL_GALLERY_PHOTOS,
      bookings: INITIAL_BOOKINGS,
      testimonials: INITIAL_TESTIMONIALS,
      faqs: INITIAL_FAQS,
      contactMessages: INITIAL_CONTACT_MESSAGES,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as LocalDatabase;
}

function saveLocalDb(data: LocalDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DATA_FILE);
}

let supabaseSeeded = false;

async function ensureSupabaseSeeded(sb: SupabaseClient): Promise<void> {
  if (supabaseSeeded) return;
  try {
    const { count: menuCount } = await sb
      .from('menu_items')
      .select('*', { count: 'exact', head: true });
    if (menuCount === 0) {
      await sb.from('menu_items').insert(
        INITIAL_MENU_ITEMS.map((item) => ({
          category: item.category,
          name: item.name,
          description: item.description,
          price: item.price,
          photo_url: item.photoUrl,
          active: item.active,
          sort_order: item.sortOrder,
        }))
      );
    }

    const { count: galleryCount } = await sb
      .from('gallery_photos')
      .select('*', { count: 'exact', head: true });
    if (galleryCount === 0) {
      await sb.from('gallery_photos').insert(
        INITIAL_GALLERY_PHOTOS.map((photo) => ({
          image_url: photo.imageUrl,
          caption: photo.caption,
          display_order: photo.displayOrder,
        }))
      );
    }

    const { count: testimonialCount } = await sb
      .from('testimonials')
      .select('*', { count: 'exact', head: true });
    if (testimonialCount === 0) {
      await sb.from('testimonials').insert(
        INITIAL_TESTIMONIALS.map((t) => ({
          customer_name: t.customerName,
          content: t.content,
          rating: t.rating,
          status: t.status,
          created_at: t.createdAt,
        }))
      );
    }

    const { count: faqCount } = await sb
      .from('faqs')
      .select('*', { count: 'exact', head: true });
    if (faqCount === 0) {
      await sb.from('faqs').insert(
        INITIAL_FAQS.map((f) => ({
          question: f.question,
          answer: f.answer,
          display_order: f.displayOrder,
        }))
      );
    }
    supabaseSeeded = true;
  } catch (err) {
    console.error('Supabase initial seed check skipped:', err);
  }
}

export async function getPublicSiteData(): Promise<PublicSiteData> {
  const sb = getSupabase();
  if (sb) {
    await ensureSupabaseSeeded(sb);
    const [menuRes, galleryRes, testRes, faqRes] = await Promise.all([
      sb
        .from('menu_items')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
      sb.from('gallery_photos').select('*').order('display_order', { ascending: true }),
      sb
        .from('testimonials')
        .select('*')
        .eq('status', 'aprovado')
        .order('created_at', { ascending: false }),
      sb.from('faqs').select('*').order('display_order', { ascending: true }),
    ]);

    return {
      menuItems: (menuRes.data ?? []).map((row) => ({
        id: String(row.id),
        category: String(row.category),
        name: String(row.name),
        description: String(row.description),
        price: Number(row.price),
        photoUrl: String(row.photo_url ?? ''),
        active: Boolean(row.active),
        sortOrder: Number(row.sort_order ?? 0),
      })),
      galleryPhotos: (galleryRes.data ?? []).map((row) => ({
        id: String(row.id),
        imageUrl: String(row.image_url),
        caption: String(row.caption ?? ''),
        displayOrder: Number(row.display_order ?? 1),
      })),
      testimonials: (testRes.data ?? []).map((row) => ({
        id: String(row.id),
        customerName: String(row.customer_name),
        content: String(row.content),
        rating: Number(row.rating),
        status: row.status as TestimonialStatus,
        createdAt: String(row.created_at),
      })),
      faqs: (faqRes.data ?? []).map((row) => ({
        id: String(row.id),
        question: String(row.question),
        answer: String(row.answer),
        displayOrder: Number(row.display_order ?? 1),
      })),
    };
  }

  const db = ensureLocalDb();
  return {
    menuItems: db.menuItems
      .filter((item) => item.active)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    galleryPhotos: [...db.galleryPhotos].sort((a, b) => a.displayOrder - b.displayOrder),
    testimonials: db.testimonials
      .filter((t) => t.status === 'aprovado')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    faqs: [...db.faqs].sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const sb = getSupabase();
  if (sb) {
    await ensureSupabaseSeeded(sb);
    const [menuRes, galleryRes, bookingRes, testRes, faqRes, msgRes] = await Promise.all([
      sb
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
      sb.from('gallery_photos').select('*').order('display_order', { ascending: true }),
      sb.from('bookings').select('*').order('created_at', { ascending: false }),
      sb.from('testimonials').select('*').order('created_at', { ascending: false }),
      sb.from('faqs').select('*').order('display_order', { ascending: true }),
      sb.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);

    return {
      menuItems: (menuRes.data ?? []).map((row) => ({
        id: String(row.id),
        category: String(row.category),
        name: String(row.name),
        description: String(row.description),
        price: Number(row.price),
        photoUrl: String(row.photo_url ?? ''),
        active: Boolean(row.active),
        sortOrder: Number(row.sort_order ?? 0),
      })),
      galleryPhotos: (galleryRes.data ?? []).map((row) => ({
        id: String(row.id),
        imageUrl: String(row.image_url),
        caption: String(row.caption ?? ''),
        displayOrder: Number(row.display_order ?? 1),
      })),
      bookings: (bookingRes.data ?? []).map((row) => ({
        id: String(row.id),
        customerName: String(row.customer_name),
        contact: String(row.contact),
        bookingDate: String(row.booking_date),
        bookingTime: String(row.booking_time),
        guests: Number(row.guests ?? 2),
        notes: String(row.notes ?? ''),
        status: row.status as BookingStatus,
        createdAt: String(row.created_at),
      })),
      testimonials: (testRes.data ?? []).map((row) => ({
        id: String(row.id),
        customerName: String(row.customer_name),
        content: String(row.content),
        rating: Number(row.rating),
        status: row.status as TestimonialStatus,
        createdAt: String(row.created_at),
      })),
      faqs: (faqRes.data ?? []).map((row) => ({
        id: String(row.id),
        question: String(row.question),
        answer: String(row.answer),
        displayOrder: Number(row.display_order ?? 1),
      })),
      contactMessages: (msgRes.data ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
        message: String(row.message),
        read: Boolean(row.read),
        createdAt: String(row.created_at),
      })),
    };
  }

  const db = ensureLocalDb();
  return {
    menuItems: [...db.menuItems].sort((a, b) => a.sortOrder - b.sortOrder),
    galleryPhotos: [...db.galleryPhotos].sort((a, b) => a.displayOrder - b.displayOrder),
    bookings: [...db.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    testimonials: [...db.testimonials].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    faqs: [...db.faqs].sort((a, b) => a.displayOrder - b.displayOrder),
    contactMessages: [...db.contactMessages].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    ),
  };
}

export async function createMenuItem(
  input: Omit<MenuItem, 'id'>
): Promise<MenuItem> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('menu_items')
      .insert({
        category: input.category,
        name: input.name,
        description: input.description,
        price: input.price,
        photo_url: input.photoUrl,
        active: input.active,
        sort_order: input.sortOrder,
      })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Erro ao criar item');
    return {
      id: String(data.id),
      category: String(data.category),
      name: String(data.name),
      description: String(data.description),
      price: Number(data.price),
      photoUrl: String(data.photo_url ?? ''),
      active: Boolean(data.active),
      sortOrder: Number(data.sort_order ?? 0),
    };
  }
  const db = ensureLocalDb();
  const created: MenuItem = { id: `menu-${randomUUID()}`, ...input };
  db.menuItems.push(created);
  saveLocalDb(db);
  return created;
}

export async function updateMenuItem(
  id: string,
  patch: Partial<Omit<MenuItem, 'id'>>
): Promise<MenuItem> {
  const sb = getSupabase();
  if (sb) {
    const payload: Record<string, unknown> = {};
    if (patch.category !== undefined) payload.category = patch.category;
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.price !== undefined) payload.price = patch.price;
    if (patch.photoUrl !== undefined) payload.photo_url = patch.photoUrl;
    if (patch.active !== undefined) payload.active = patch.active;
    if (patch.sortOrder !== undefined) payload.sort_order = patch.sortOrder;

    const { data, error } = await sb
      .from('menu_items')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Item não encontrado');
    return {
      id: String(data.id),
      category: String(data.category),
      name: String(data.name),
      description: String(data.description),
      price: Number(data.price),
      photoUrl: String(data.photo_url ?? ''),
      active: Boolean(data.active),
      sortOrder: Number(data.sort_order ?? 0),
    };
  }
  const db = ensureLocalDb();
  const idx = db.menuItems.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('Item não encontrado');
  db.menuItems[idx] = { ...db.menuItems[idx], ...patch };
  saveLocalDb(db);
  return db.menuItems[idx];
}

export async function deleteMenuItem(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('menu_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = ensureLocalDb();
  db.menuItems = db.menuItems.filter((i) => i.id !== id);
  saveLocalDb(db);
}

export async function createGalleryPhoto(
  input: Omit<GalleryPhoto, 'id'>
): Promise<GalleryPhoto> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('gallery_photos')
      .insert({
        image_url: input.imageUrl,
        caption: input.caption,
        display_order: input.displayOrder,
      })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Erro ao adicionar foto');
    return {
      id: String(data.id),
      imageUrl: String(data.image_url),
      caption: String(data.caption ?? ''),
      displayOrder: Number(data.display_order ?? 1),
    };
  }
  const db = ensureLocalDb();
  const created: GalleryPhoto = { id: `gallery-${randomUUID()}`, ...input };
  db.galleryPhotos.push(created);
  saveLocalDb(db);
  return created;
}

export async function updateGalleryPhoto(
  id: string,
  patch: Partial<Omit<GalleryPhoto, 'id'>>
): Promise<GalleryPhoto> {
  const sb = getSupabase();
  if (sb) {
    const payload: Record<string, unknown> = {};
    if (patch.imageUrl !== undefined) payload.image_url = patch.imageUrl;
    if (patch.caption !== undefined) payload.caption = patch.caption;
    if (patch.displayOrder !== undefined) payload.display_order = patch.displayOrder;

    const { data, error } = await sb
      .from('gallery_photos')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Foto não encontrada');
    return {
      id: String(data.id),
      imageUrl: String(data.image_url),
      caption: String(data.caption ?? ''),
      displayOrder: Number(data.display_order ?? 1),
    };
  }
  const db = ensureLocalDb();
  const idx = db.galleryPhotos.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Foto não encontrada');
  db.galleryPhotos[idx] = { ...db.galleryPhotos[idx], ...patch };
  saveLocalDb(db);
  return db.galleryPhotos[idx];
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('gallery_photos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = ensureLocalDb();
  db.galleryPhotos = db.galleryPhotos.filter((p) => p.id !== id);
  saveLocalDb(db);
}

export async function createBooking(
  input: Omit<Booking, 'id' | 'status' | 'createdAt'>
): Promise<Booking> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('bookings')
      .insert({
        customer_name: input.customerName,
        contact: input.contact,
        booking_date: input.bookingDate,
        booking_time: input.bookingTime,
        guests: input.guests,
        notes: input.notes,
        status: 'pendente',
      })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Erro ao criar reserva');
    return {
      id: String(data.id),
      customerName: String(data.customer_name),
      contact: String(data.contact),
      bookingDate: String(data.booking_date),
      bookingTime: String(data.booking_time),
      guests: Number(data.guests ?? 2),
      notes: String(data.notes ?? ''),
      status: data.status as BookingStatus,
      createdAt: String(data.created_at),
    };
  }
  const db = ensureLocalDb();
  const created: Booking = {
    id: `res-${randomUUID().slice(0, 8)}`,
    ...input,
    status: 'pendente',
    createdAt: new Date().toISOString(),
  };
  db.bookings.unshift(created);
  saveLocalDb(db);
  return created;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Reserva não encontrada');
    return {
      id: String(data.id),
      customerName: String(data.customer_name),
      contact: String(data.contact),
      bookingDate: String(data.booking_date),
      bookingTime: String(data.booking_time),
      guests: Number(data.guests ?? 2),
      notes: String(data.notes ?? ''),
      status: data.status as BookingStatus,
      createdAt: String(data.created_at),
    };
  }
  const db = ensureLocalDb();
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error('Reserva não encontrada');
  db.bookings[idx] = { ...db.bookings[idx], status };
  saveLocalDb(db);
  return db.bookings[idx];
}

export async function deleteBooking(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('bookings').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = ensureLocalDb();
  db.bookings = db.bookings.filter((b) => b.id !== id);
  saveLocalDb(db);
}

export async function createTestimonial(
  input: Omit<Testimonial, 'id' | 'status' | 'createdAt'>
): Promise<Testimonial> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('testimonials')
      .insert({
        customer_name: input.customerName,
        content: input.content,
        rating: input.rating,
        status: 'pendente',
      })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Erro ao enviar depoimento');
    return {
      id: String(data.id),
      customerName: String(data.customer_name),
      content: String(data.content),
      rating: Number(data.rating),
      status: data.status as TestimonialStatus,
      createdAt: String(data.created_at),
    };
  }
  const db = ensureLocalDb();
  const created: Testimonial = {
    id: `test-${randomUUID()}`,
    ...input,
    status: 'pendente',
    createdAt: new Date().toISOString(),
  };
  db.testimonials.unshift(created);
  saveLocalDb(db);
  return created;
}

export async function updateTestimonialStatus(
  id: string,
  status: TestimonialStatus
): Promise<Testimonial> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('testimonials')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Depoimento não encontrado');
    return {
      id: String(data.id),
      customerName: String(data.customer_name),
      content: String(data.content),
      rating: Number(data.rating),
      status: data.status as TestimonialStatus,
      createdAt: String(data.created_at),
    };
  }
  const db = ensureLocalDb();
  const idx = db.testimonials.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Depoimento não encontrado');
  db.testimonials[idx] = { ...db.testimonials[idx], status };
  saveLocalDb(db);
  return db.testimonials[idx];
}

export async function deleteTestimonial(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('testimonials').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = ensureLocalDb();
  db.testimonials = db.testimonials.filter((t) => t.id !== id);
  saveLocalDb(db);
}

export async function createFaqItem(
  input: Omit<FaqItem, 'id'>
): Promise<FaqItem> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('faqs')
      .insert({
        question: input.question,
        answer: input.answer,
        display_order: input.displayOrder,
      })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Erro ao criar FAQ');
    return {
      id: String(data.id),
      question: String(data.question),
      answer: String(data.answer),
      displayOrder: Number(data.display_order ?? 1),
    };
  }
  const db = ensureLocalDb();
  const created: FaqItem = { id: `faq-${randomUUID()}`, ...input };
  db.faqs.push(created);
  saveLocalDb(db);
  return created;
}

export async function updateFaqItem(
  id: string,
  patch: Partial<Omit<FaqItem, 'id'>>
): Promise<FaqItem> {
  const sb = getSupabase();
  if (sb) {
    const payload: Record<string, unknown> = {};
    if (patch.question !== undefined) payload.question = patch.question;
    if (patch.answer !== undefined) payload.answer = patch.answer;
    if (patch.displayOrder !== undefined) payload.display_order = patch.displayOrder;

    const { data, error } = await sb
      .from('faqs')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Pergunta não encontrada');
    return {
      id: String(data.id),
      question: String(data.question),
      answer: String(data.answer),
      displayOrder: Number(data.display_order ?? 1),
    };
  }
  const db = ensureLocalDb();
  const idx = db.faqs.findIndex((f) => f.id === id);
  if (idx === -1) throw new Error('Pergunta não encontrada');
  db.faqs[idx] = { ...db.faqs[idx], ...patch };
  saveLocalDb(db);
  return db.faqs[idx];
}

export async function deleteFaqItem(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('faqs').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = ensureLocalDb();
  db.faqs = db.faqs.filter((f) => f.id !== id);
  saveLocalDb(db);
}

export async function createContactMessage(
  input: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>
): Promise<ContactMessage> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('contact_messages')
      .insert({
        name: input.name,
        email: input.email,
        message: input.message,
        read: false,
      })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Erro ao enviar mensagem');
    return {
      id: String(data.id),
      name: String(data.name),
      email: String(data.email),
      message: String(data.message),
      read: Boolean(data.read),
      createdAt: String(data.created_at),
    };
  }
  const db = ensureLocalDb();
  const created: ContactMessage = {
    id: `msg-${randomUUID()}`,
    ...input,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.contactMessages.unshift(created);
  saveLocalDb(db);
  return created;
}

export async function updateContactMessageRead(
  id: string,
  read: boolean
): Promise<ContactMessage> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('contact_messages')
      .update({ read })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Mensagem não encontrada');
    return {
      id: String(data.id),
      name: String(data.name),
      email: String(data.email),
      message: String(data.message),
      read: Boolean(data.read),
      createdAt: String(data.created_at),
    };
  }
  const db = ensureLocalDb();
  const idx = db.contactMessages.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error('Mensagem não encontrada');
  db.contactMessages[idx] = { ...db.contactMessages[idx], read };
  saveLocalDb(db);
  return db.contactMessages[idx];
}

export async function deleteContactMessage(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('contact_messages').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const db = ensureLocalDb();
  db.contactMessages = db.contactMessages.filter((m) => m.id !== id);
  saveLocalDb(db);
}
