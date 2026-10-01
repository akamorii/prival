import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './TablesQrPage.module.css';

const CANVAS_ID = 'qr-site';

function siteUrl(): string {
  return window.location.origin;
}

function downloadCanvas() {
  const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'privalcafe-qr.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function TablesQrPage() {
  return (
    <div>
      <div className={styles.toolbar}>
        <Button size="sm" onClick={() => window.print()}>
          Скачать / распечатать QR-код
        </Button>
      </div>

      <div className={styles.grid}>
        <div className={styles.tile}>
          <QRCodeCanvas id={CANVAS_ID} value={siteUrl()} size={160} />
          <div className={styles.tableLabel}>Привал</div>
          <div className={styles.url}>{siteUrl()}</div>
          <button type="button" className={styles.downloadBtn} onClick={downloadCanvas}>
            Скачать PNG
          </button>
        </div>
      </div>
    </div>
  );
}
