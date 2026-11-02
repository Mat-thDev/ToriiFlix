export const isChannelLike = (kind?: string): boolean =>
  kind === "channel" || kind === "tv" || kind === "Porn";

export const matchesKind = (declared: string | undefined, requested?: string): boolean => {
  if (!requested) return true;
  if (!declared) return false;
  return declared === requested || (isChannelLike(declared) && isChannelLike(requested));
};

export const kindVariants = (kind: string): string[] =>
  isChannelLike(kind) ? [kind, kind === "channel" ? "tv" : "channel"] : [kind];
