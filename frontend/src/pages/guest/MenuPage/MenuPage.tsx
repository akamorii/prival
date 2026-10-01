import { useEffect, useRef, useState } from 'react';
import type { Dish } from '../../../shared/types';
import { useMenu } from '../../../entities/menu/useMenu';
import { SiteHeader } from '../../../widgets/site-header/SiteHeader';
import { FulfillmentIndicator } from '../../../widgets/fulfillment-indicator/FulfillmentIndicator';
import { CategoryNav } from '../../../widgets/category-nav/CategoryNav';
import { DishCard } from '../../../entities/dish/DishCard';
import { DishModal } from '../../../widgets/dish-modal/DishModal';
import { CartBar } from '../../../widgets/cart-bar/CartBar';
import styles from './MenuPage.module.css';

export function MenuPage() {
  const { categories, dishes, loading } = useMenu();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (categories.length && !activeId) setActiveId(categories[0].id);
  }, [categories, activeId]);

  useEffect(() => {
    if (!categories.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id.replace('cat-', ''));
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );
    categories.forEach((c) => {
      const el = sectionRefs.current[c.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  const handleSelectCategory = (id: string) => {
    setActiveId(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return <div className={styles.loading}>Загружаем меню…</div>;
  }

  return (
    <div>
      <SiteHeader />
      <FulfillmentIndicator />
      <CategoryNav categories={categories} activeId={activeId} onSelect={handleSelectCategory} />

      {categories.map((category) => {
        const items = dishes.filter((d) => d.categoryId === category.id);
        if (!items.length) return null;
        return (
          <div
            key={category.id}
            id={`cat-${category.id}`}
            ref={(el) => {
              sectionRefs.current[category.id] = el;
            }}
            className={styles.section}
          >
            <h2 className={styles.sectionTitle}>{category.name}</h2>
            {items.map((dish) => (
              <DishCard key={dish.id} dish={dish} onOpen={setSelectedDish} />
            ))}
          </div>
        );
      })}

      <div className={styles.bottomSpacer} />

      {selectedDish && <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />}
      <CartBar />
    </div>
  );
}
