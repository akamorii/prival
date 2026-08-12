import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export function useTableFromUrl(): void {
  const [searchParams] = useSearchParams();
  const setTableNumber = useCartStore((s) => s.setTableNumber);

  useEffect(() => {
    const raw = searchParams.get('table');
    const table = raw ? Number.parseInt(raw, 10) : NaN;
    if (Number.isFinite(table) && table > 0) {
      setTableNumber(table);
    }
  }, [searchParams, setTableNumber]);
}
