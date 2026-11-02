/**
 * Addons de TV ao vivo declaram "channel" ou "tv" como tipo — o mesmo
 * conceito com dois nomes. Estes helpers tratam os dois como sinônimos
 * no filtro de fontes e nas requisições.
 */

/** O tipo pedido é um canal (channel/tv)? */
export const isChannelLike = (kind?: string): boolean =>
  kind === "channel" || kind === "tv";

/** Tipo declarado pelo addon casa com o tipo pedido (com alias channel/tv)? */
export const matchesKind = (declared: string | undefined, requested?: string): boolean => {
  if (!requested) return true;
  if (!declared) return false;
  return declared === requested || (isChannelLike(declared) && isChannelLike(requested));
};

/**
 * Tipos a consultar para um kind. Para canal, pedir os dois nomes: o tipo
 * errado responde 404 e o `settleOrThrow` descarta a falha — assim cobrimos
 * addons que declaram "channel" e addons que declaram "tv".
 */
export const kindVariants = (kind: string): string[] =>
  isChannelLike(kind) ? [kind, kind === "channel" ? "tv" : "channel"] : [kind];
