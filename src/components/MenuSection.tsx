import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { MenuItem } from '../types';
import { formatCurrencyBRL } from '../lib/business';
import { ResilientImage } from './ResilientImage';

interface MenuSectionProps {
  items: MenuItem[];
  loading: boolean;
}

export function MenuSection({ items, loading }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category)));
    return ['Todas', ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'Todas' || item.category === selectedCategory;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <section
      id="cardapio"
      className="py-20 sm:py-24 border-t border-[#2A2A2A] bg-[#1A1A1A]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-[#E63946] mb-2">
              01. Cardápio Digital
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F4] tracking-tight text-balance">
              Pizzas artesanais, massas frescas e sobremesas da casa
            </h2>
            <p className="mt-3 text-base text-[#B3B3B3]">
              Massa de longa fermentação preparada diariamente e ingredientes
              selecionados para servir à mesa ou retirar no balcão.
            </p>
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search
              className="w-4 h-4 text-[#8C8C8C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar sabor ou prato..."
              aria-label="Buscar no cardápio"
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#222222] border border-[#303030] text-sm text-[#F5F5F4] placeholder:text-[#737373] focus:outline-none focus:border-[#E63946] transition-colors"
            />
          </div>
        </div>

        {/* Interactive Category Filter Controls */}
        <div
          className="flex items-center gap-1.5 p-1.5 bg-[#222222] border border-[#2E2E2E] rounded-lg overflow-x-auto mb-10"
          role="tablist"
          aria-label="Categorias do cardápio"
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] ${
                  isActive
                    ? 'bg-[#E63946] text-white'
                    : 'text-[#C4C4C4] hover:text-white hover:bg-[#2C2C2C]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#222222] border border-[#2E2E2E] overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-[#2A2A2A]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 bg-[#2E2E2E] rounded" />
                  <div className="h-5 w-48 bg-[#2E2E2E] rounded" />
                  <div className="h-12 w-full bg-[#2E2E2E] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl bg-[#222222] border border-[#2E2E2E] p-10 text-center">
            <p className="text-base font-medium text-[#E5E5E5]">
              Nenhum item encontrado para essa busca.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Todas');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#E63946] hover:bg-[#C82B38] rounded-lg transition-colors cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="group rounded-xl bg-[#222222] border border-[#2E2E2E] overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#161616]">
                  <ResilientImage
                    src={item.photoUrl}
                    alt={item.name}
                    fallbackLabel={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#A3A3A3] mb-1.5">
                      {item.category}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-[#F5F5F4] leading-snug">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm text-[#B3B3B3] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#2E2E2E] flex items-center justify-between gap-3">
                    <span className="text-lg font-semibold text-[#F5F5F4] tabular-nums">
                      {formatCurrencyBRL(item.price)}
                    </span>
                    <a
                      href="#reservas"
                      className="text-xs font-semibold text-[#E63946] hover:text-white transition-colors whitespace-nowrap shrink-0"
                    >
                      Reservar para saborear
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
