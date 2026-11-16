export type BookingStatus = 'pendente' | 'confirmado' | 'cancelado';
export type TestimonialStatus = 'aprovado' | 'pendente';

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  photoUrl: string;
  active: boolean;
  sortOrder: number;
}

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  displayOrder: number;
}

export interface Booking {
  id: string;
  customerName: string;
  contact: string;
  bookingDate: string;
  bookingTime: string;
  guests: number;
  notes: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  content: string;
  rating: number;
  status: TestimonialStatus;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface PublicSiteData {
  menuItems: MenuItem[];
  galleryPhotos: GalleryPhoto[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
}

export interface AdminOverviewData {
  menuItems: MenuItem[];
  galleryPhotos: GalleryPhoto[];
  bookings: Booking[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  contactMessages: ContactMessage[];
}
