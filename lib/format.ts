// Small formatting helpers shared across the app.

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export const formatGBP = (value: number) => GBP.format(value);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** Deterministic-ish reference generator for new dummy orders. */
export const makeOrderReference = () =>
  `HOA-${Math.floor(10000 + Math.random() * 89999)}`;
