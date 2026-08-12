import type { Category } from '../../shared/types';
import styles from './CategoryNav.module.css';

interface CategoryNavProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  return (
    <nav className={`${styles.nav} scroll-x`}>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`${styles.chip} ${activeId === c.id ? styles.chipActive : ''}`}
          onClick={() => onSelect(c.id)}
        >
          {c.name}
        </button>
      ))}
    </nav>
  );
}
