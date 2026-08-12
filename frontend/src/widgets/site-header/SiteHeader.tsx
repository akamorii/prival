import { config } from '../../shared/config/env';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>{config.cafeName}</div>
      <div className={styles.tagline}>{config.cafeTagline}</div>
      <div className={styles.rule} />
    </header>
  );
}
