import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './TablesQrPage.module.css';

function tableUrl(table: number): string {
  return `${window.location.origin}/?table=${table}`;
}

function downloadCanvas(tableNumber: number) {
  const canvas = document.getElementById(`qr-${tableNumber}`) as HTMLCanvasElement | null;
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `stol-${tableNumber}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function TablesQrPage() {
  const [tablesCount, setTablesCount] = useState(12);
  const tables = Array.from({ length: tablesCount }, (_, i) => i + 1);

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tables-count">
            Количество столов
          </label>
          <input
            id="tables-count"
            className={styles.input}
            type="number"
            min={1}
            max={200}
            value={tablesCount}
            onChange={(e) => setTablesCount(Math.max(1, Number(e.target.value)))}
          />
        </div>
        <Button size="sm" onClick={() => window.print()}>
          Скачать / распечатать QR-коды
        </Button>
      </div>

      <div className={styles.grid}>
        {tables.map((table) => (
          <div key={table} className={styles.tile}>
            <QRCodeCanvas id={`qr-${table}`} value={tableUrl(table)} size={120} />
            <div className={styles.tableLabel}>Стол №{table}</div>
            <div className={styles.url}>{tableUrl(table)}</div>
            <button type="button" className={styles.downloadBtn} onClick={() => downloadCanvas(table)}>
              Скачать PNG
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
