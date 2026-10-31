/** 134 → "2h 14min"; 45 → "45min". Ausente/zero → undefined. */
export const formatRuntime = (minutes?: number): string | undefined => {
  if (!minutes || minutes <= 0) return undefined;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}min`;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
};

/**
 * "2024-05-12" → data local no idioma informado ("12/05/2024" em pt-BR).
 * `T00:00:00` evita o deslocamento do fuso UTC; locale inválido cai no default.
 */
export const formatDate = (iso?: string, language = "pt-BR"): string | undefined => {
  if (!iso) return undefined;
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  try {
    return date.toLocaleDateString(language);
  } catch {
    return date.toLocaleDateString();
  }
};
