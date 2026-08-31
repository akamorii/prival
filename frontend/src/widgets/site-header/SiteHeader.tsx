import { useState } from 'react';
import { config } from '../../shared/config/env';
import { InfoPanel } from '../info-panel/InfoPanel';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.infoBtn}
        onClick={() => setInfoOpen(true)}
        aria-label="Информация о заведении"
      >
        ⓘ
      </button>
      <div className={styles.logo}>{config.cafeName}</div>
      <div className={styles.tagline}>{config.cafeTagline}</div>
      <div className={styles.rule} />
      <InfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} />
    </header>
  );
}
