import { useRef, useState, type DragEvent } from 'react';
import { uploadImage } from '../../../shared/api/uploadApi';
import { resolvePhotoUrl } from '../../../shared/lib/resolvePhotoUrl';
import styles from './ImageDropzone.module.css';

interface ImageDropzoneProps {
  value?: string | null;
  onChange: (url: string | undefined) => void;
}

export function ImageDropzone({ value, onChange }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Можно загрузить только изображение');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить файл');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const preview = resolvePhotoUrl(value);

  return (
    <div>
      <div
        className={`${styles.zone} ${dragActive ? styles.zoneActive : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <img className={styles.preview} src={preview} alt="" />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>🖼️</span>
            <span className={styles.placeholderText}>
              Перетащите изображение сюда
              <br />
              или нажмите, чтобы выбрать файл
            </span>
          </div>
        )}

        {preview && !uploading && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            aria-label="Удалить фото"
          >
            ✕
          </button>
        )}

        {uploading && <div className={styles.status}>Загрузка…</div>}

        <input
          ref={inputRef}
          className={styles.hiddenInput}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
