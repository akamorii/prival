import { categoryIcon } from '../../lib/categoryIcons';
import styles from './DishThumb.module.css';

interface DishThumbProps {
  categoryId: string;
  photoUrl?: string;
  size?: number;
  fontSize?: number;
}

export function DishThumb({ categoryId, photoUrl, size = 64, fontSize = 28 }: DishThumbProps) {
  return (
    <div className={styles.thumb} style={{ width: size, height: size }}>
      {photoUrl ? (
        <img src={photoUrl} alt="" />
      ) : (
        <span className={styles.emoji} style={{ fontSize }}>
          {categoryIcon(categoryId)}
        </span>
      )}
    </div>
  );
}
