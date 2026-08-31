import { useRef, useState, type TouchEvent } from 'react';
import { categoryIcon } from '../../lib/categoryIcons';
import { resolvePhotoUrl } from '../../lib/resolvePhotoUrl';
import styles from './PhotoCarousel.module.css';

interface PhotoCarouselProps {
  categoryId: string;
  photoUrls: Array<string | null | undefined>;
  size?: number;
  fontSize?: number;
}

const SWIPE_THRESHOLD = 40;

export function PhotoCarousel({ categoryId, photoUrls, size = 120, fontSize = 52 }: PhotoCarouselProps) {
  const photos = photoUrls.map(resolvePhotoUrl).filter((url): url is string => Boolean(url));
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const activeIndex = Math.min(index, Math.max(photos.length - 1, 0));

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > SWIPE_THRESHOLD) {
      setIndex((i) => Math.max(0, i - 1));
    } else if (delta < -SWIPE_THRESHOLD) {
      setIndex((i) => Math.min(photos.length - 1, i + 1));
    }
  };

  return (
    <div>
      <div
        className={styles.frame}
        style={{ width: size, height: size }}
        onTouchStart={photos.length > 1 ? handleTouchStart : undefined}
        onTouchEnd={photos.length > 1 ? handleTouchEnd : undefined}
      >
        {photos.length > 0 ? (
          <img src={photos[activeIndex]} alt="" />
        ) : (
          <span className={styles.emoji} style={{ fontSize }}>
            {categoryIcon(categoryId)}
          </span>
        )}
      </div>
      {photos.length > 1 && (
        <div className={styles.dots}>
          {photos.map((url, i) => (
            <button
              key={url + i}
              type="button"
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              aria-label={`Фото ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
