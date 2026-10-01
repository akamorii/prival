import { useRef, useState, type DragEvent } from 'react';
import { uploadImage } from '../../../shared/api/uploadApi';
import { resolvePhotoUrl } from '../../../shared/lib/resolvePhotoUrl';
import styles from './PhotoGalleryEditor.module.css';

interface PhotoGalleryEditorProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function PhotoGalleryEditor({ value, onChange }: PhotoGalleryEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) {
      setError('Можно загрузить только изображения');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of images) {
        uploaded.push(await uploadImage(file));
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить файл');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const moveTo = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className={styles.grid}>
        {value.map((url, index) => (
          <div key={url + index} className={styles.tile}>
            <img src={resolvePhotoUrl(url)} alt="" />
            <span className={styles.indexBadge}>{index + 1}</span>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeAt(index)}
              aria-label={`Удалить фото ${index + 1}`}
            >
              ✕
            </button>
            <div className={styles.moveRow}>
              <button
                type="button"
                className={styles.moveBtn}
                disabled={index === 0}
                onClick={() => moveTo(index, -1)}
                aria-label="Сдвинуть левее"
              >
                ←
              </button>
              <button
                type="button"
                className={styles.moveBtn}
                disabled={index === value.length - 1}
                onClick={() => moveTo(index, 1)}
                aria-label="Сдвинуть правее"
              >
                →
              </button>
            </div>
          </div>
        ))}

        <div
          className={`${styles.addTile} ${dragActive ? styles.addTileActive : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <span className={styles.addIcon}>🖼️</span>
          <span className={styles.addText}>Добавить фото</span>
          {uploading && <div className={styles.status}>Загрузка…</div>}
          <input
            ref={inputRef}
            className={styles.hiddenInput}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              handleFiles(Array.from(e.target.files ?? []));
              e.target.value = '';
            }}
          />
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
