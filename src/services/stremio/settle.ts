/**
 * Agregação de requisições paralelas tolerante a falha:
 * fontes que rejeitarem são descartadas; só falha se todas falharem
 * (repassa o primeiro erro). Usado por CatalogService e StreamService.
 */
export const settleOrThrow = async <T>(requests: Promise<T>[]): Promise<Awaited<T>[]> => {
  const results = await Promise.allSettled(requests);
  const fulfilled = results.filter(
    (r): r is PromiseFulfilledResult<Awaited<T>> => r.status === "fulfilled",
  );

  if (fulfilled.length === 0) {
    const rejected = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
    throw rejected?.reason ?? new Error("Nenhum addon respondeu");
  }

  return fulfilled.map((r) => r.value);
};
