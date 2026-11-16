import { useState } from 'react';
import { Expand } from 'lucide-react';
import type { GalleryPhoto } from '../types';
import { ResilientImage } from './ResilientImage';
import { Lightbox } from './Lightbox';

interface GallerySectionProps {
  photos: GalleryPhoto[];
  loading: boolean;
}

export function GallerySection({ photos, loading }: GallerySectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section
      id="galeria"
      className="py-20 sm:py-24 border-t border-[#2A2A2A] bg-[#161616]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold tracking-wider text-[#E63946] mb-2">
            02. Nossa Casa
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F4] tracking-tight text-balance">
            Conheça o ambiente da Acrópole no José Menino
          </h2>
          <p className="mt-3 text-base text-[#B3B3B3]">
            Clique em qualquer fotografia para ampliar os detalhes do nosso salão,
            recepção e preparo artesanal.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[4/5] rounded-xl bg-[#222222] animate-pulse"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-10 text-center text-[#A3A3A3]">
            Nenhuma foto cadastrada na galeria no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ampliar foto: ${photo.caption || `Imagem ${index + 1}`}`}
                className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-[#222222] border border-[#2E2E2E] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946]"
              >
                <ResilientImage
                  src={photo.imageUrl}
                  alt={photo.caption || 'Foto da Acrópole Restaurante & Pizzaria'}
                  fallbackLabel={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Expand className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-sm font-medium text-[#F5F5F4] leading-snug line-clamp-2">
                    {photo.caption || 'Acrópole Restaurante & Pizzaria'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        photos={photos}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={(next) => setActiveIndex(next)}
      />
    </section>
  );
}
