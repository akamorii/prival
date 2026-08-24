import { categoryIcon } from '../../lib/categoryIcons';
import { resolvePhotoUrl } from '../../lib/resolvePhotoUrl';
import styles from './DishThumb.module.css';

interface DishThumbProps {
  categoryId: string;
  photoUrl?: string | null;
  size?: number;
  fontSize?: number;
}

export function DishThumb({ categoryId, photoUrl, size = 64, fontSize = 28 }: DishThumbProps) {
  const resolvedUrl = resolvePhotoUrl(photoUrl);
  return (
    <div className={styles.thumb} style={{ width: size, height: size }}>
      {resolvedUrl ? (
        <img src={resolvedUrl} alt="" />
      ) : (
        <span className={styles.emoji} style={{ fontSize }}>
          {categoryIcon(categoryId)}
        </span>
      )}
    </div>
  );
}
