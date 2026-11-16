-- Schema SQL para Supabase (PostgreSQL) — Acrópole Restaurante & Pizzaria

create extension if not exists "pgcrypto";

-- 1. Itens do cardápio
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  photo_url text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Fotos da galeria
create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null default '',
  display_order integer not null default 1,
  created_at timestamptz not null default now()
);

-- 3. Agendamentos / Reservas recebidas
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  contact text not null,
  booking_date date not null,
  booking_time text not null,
  guests integer not null default 2 check (guests >= 1 and guests <= 40),
  notes text not null default '',
  status text not null default 'pendente' check (status in ('pendente', 'confirmado', 'cancelado')),
  created_at timestamptz not null default now()
);

-- 4. Depoimentos de clientes
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  content text not null,
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  status text not null default 'pendente' check (status in ('aprovado', 'pendente')),
  created_at timestamptz not null default now()
);

-- 5. Perguntas e respostas do FAQ
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order integer not null default 1,
  created_at timestamptz not null default now()
);

-- 6. Mensagens recebidas pelo formulário de contato
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Habilitar RLS (o backend utiliza SUPABASE_SERVICE_ROLE_KEY com acesso autenticado)
alter table public.menu_items enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.bookings enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.contact_messages enable row level security;
