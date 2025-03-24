export const $parseCreatedAtAgo = (createdAt: string): string => {
  const { locale } = useI18n();
  const date = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  const translations = {
    fr: {
      0: "Aujourd'hui",
      1: "Hier",
      other: (days: number) => `Il y a ${days} jours`,
    },
    en: {
      0: "Today",
      1: "Yesterday",
      other: (days: number) => `It has been ${days} days`,
    },
  };

  const lang = locale.value === "fr" ? "fr" : "en";
  return diffDays <= 1 ? translations[lang][diffDays.toString() as "0" | "1"] : translations[lang].other(diffDays);
};
