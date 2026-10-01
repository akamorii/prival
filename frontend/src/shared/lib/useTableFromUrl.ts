import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import type { FulfillmentType } from '../types';

const FULFILLMENT_VALUES: FulfillmentType[] = ['delivery', 'pickup'];

export function useTableFromUrl(): void {
  const [searchParams] = useSearchParams();
  const setFulfillmentType = useCartStore((s) => s.setFulfillmentType);

  useEffect(() => {
    const fulfillment = searchParams.get('fulfillment');
    if (fulfillment && (FULFILLMENT_VALUES as string[]).includes(fulfillment)) {
      setFulfillmentType(fulfillment as FulfillmentType);
    }
  }, [searchParams, setFulfillmentType]);
}
