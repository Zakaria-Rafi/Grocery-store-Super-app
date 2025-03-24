export const $cutName = (name: string): string => {
  return name.slice(0, 20) + "...";
};

export const $formatPrice = (price: number): string => {
  return price.toFixed(2);
};

export const $localizePrice = (price: number): string => {
  const locale = useI18n().locale;
  return new Intl.NumberFormat(locale.value, {
    style: "currency",
    currency: locale.value === "fr" ? "EUR" : "USD",
    currencyDisplay: "narrowSymbol",
  }).format(price);
};

export const $localizeQuantity = (quantity: number): string => {
  const locale = useI18n().locale;
  return locale.value === "fr" ? `qte: ${quantity}` : `qty: ${quantity}`;
};
