export const money = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const signed = (n, c) => (c === 'in' ? '+' : '−') + money(n);

// Parse 'YYYY-MM-DD' as a local calendar date so the day never shifts with the timezone.
export const formatDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
