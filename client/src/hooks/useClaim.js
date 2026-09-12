import { useCallback, useState } from 'react';
import { api } from '../lib/api';
import { useAlertsRefresh } from '../context/AlertsContext';
import { formatMoney } from '../lib/constants';

/**
 * Claims a discount, patches the given list state in place, refreshes the
 * navbar alerts and exposes a toast message.
 */
export function useClaim(setItems) {
  const [toast, setToast] = useState('');
  const { refresh } = useAlertsRefresh();

  const claim = useCallback(
    async (discount) => {
      const data = await api.discounts.claim(discount.id);
      setItems((items) => items.map((d) => (d.id === discount.id ? { ...d, ...data.item } : d)));
      refresh();
      setToast(
        discount.estimatedSavings > 0
          ? `Claimed ${discount.brand} — about ${formatMoney(discount.estimatedSavings)} saved`
          : `Claimed ${discount.brand}`,
      );
    },
    [setItems, refresh],
  );

  const dismiss = useCallback(() => setToast(''), []);
  return { claim, toast, dismiss };
}
