import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryPhoto } from '../types';
import { ResilientImage } from './ResilientImage';

interface LightboxProps {
  photos: GalleryPhoto[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

export function Lightbox({
  photos,
  activeIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        onNavigate((activeIndex - 1 + photos.length) % photos.length);
      } else if (event.key === 'ArrowRight') {
        onNavigate((activeIndex + 1) % photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, photos.length, onClose, onNavigate]);

  if (activeIndex === null || !photos[activeIndex]) {
    return null;
  }

  const current = photos[activeIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização ampliada da galeria"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between text-sm text-[#D4D4D4]">
          <span className="tabular-nums font-medium">
            {activeIndex + 1} / {photos.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar galeria"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#242424] hover:bg-[#E63946] text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-[#121212] border border-[#2C2C2C]">
          <ResilientImage
            src={current.imageUrl}
            alt={current.caption || 'Foto da Acrópole Restaurante & Pizzaria'}
            className="w-full max-h-[75vh] object-contain mx-auto"
          />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  onNavigate((activeIndex - 1 + photos.length) % photos.length)
                }
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg bg-black/70 hover:bg-[#E63946] text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate((activeIndex + 1) % photos.length)}
                aria-label="Próxima foto"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg bg-black/70 hover:bg-[#E63946] text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {current.caption && (
          <p className="text-center text-sm sm:text-base text-[#E5E5E5]">
            {current.caption}
          </p>
        )}
      </div>
    </div>
  );
}
