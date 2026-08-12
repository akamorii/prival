import { useEffect, useState } from 'react';
import type { RangeReport } from '../../../shared/api/reportsApi';
import { fetchReport, ordersToCsv } from '../../../shared/api/reportsApi';
import { todayKey } from '../../../shared/lib/format';
import { formatPrice } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './ReportsPage.module.css';

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [from, setFrom] = useState(todayKey());
  const [to, setTo] = useState(todayKey());
  const [dayReport, setDayReport] = useState<RangeReport | null>(null);
  const [rangeReport, setRangeReport] = useState<RangeReport | null>(null);

  useEffect(() => {
    fetchReport(todayKey(), todayKey()).then(setDayReport);
  }, []);

  useEffect(() => {
    fetchReport(from, to).then(setRangeReport);
  }, [from, to]);

  return (
    <div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Заказов сегодня</div>
          <div className={styles.statValue}>{dayReport?.ordersCount ?? '—'}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Сумма сегодня</div>
          <div className={styles.statValue}>{dayReport ? formatPrice(dayReport.total) : '—'}</div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="report-from">
            С
          </label>
          <input
            id="report-from"
            className={styles.input}
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="report-to">
            По
          </label>
          <input
            id="report-to"
            className={styles.input}
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          disabled={!rangeReport?.orders.length}
          onClick={() => rangeReport && downloadCsv(ordersToCsv(rangeReport.orders), `otchet-${from}-${to}.csv`)}
        >
          Скачать CSV
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Заказов за период</div>
          <div className={styles.statValue}>{rangeReport?.ordersCount ?? '—'}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Сумма за период</div>
          <div className={styles.statValue}>{rangeReport ? formatPrice(rangeReport.total) : '—'}</div>
        </div>
      </div>
    </div>
  );
}
