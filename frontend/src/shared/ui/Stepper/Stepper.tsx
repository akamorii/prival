import styles from './Stepper.module.css';

interface StepperProps {
  value: number;
  min?: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export function Stepper({ value, min = 0, onDecrease, onIncrease }: StepperProps) {
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.btn}
        onClick={onDecrease}
        disabled={value <= min}
        aria-label="Уменьшить количество"
      >
        −
      </button>
      <span className={styles.value}>{value}</span>
      <button
        type="button"
        className={styles.btn}
        onClick={onIncrease}
        aria-label="Увеличить количество"
      >
        +
      </button>
    </div>
  );
}
