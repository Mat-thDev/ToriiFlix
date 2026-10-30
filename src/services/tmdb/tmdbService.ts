

export class TMDBService {

  private BASE_URI = "https://api.themoviedb.org/3";
  private API_KEY = "";
  private LANGUAGE = "pt-BR";

  constructor({ api_key, language }: TMDB.TMDBBaseOptions) {
    this.API_KEY = api_key;
    this.LANGUAGE = language ?? "pt-BR";
  }

  async findByIMDB(imdbId: string) {
    if(!imdbId) return null;
    const data = await this.fetchData({ endpoint: `/find/${imdbId}` })
    return data;
  }


  async fetchData({ endpoint, retries = 3, timeoutMs = 8000 }: { endpoint: string, retries?: number, timeoutMs?: number }) {

    if(!this.API_KEY) return null;

    const finalUri = `${this.BASE_URI}${endpoint}?api_key=${this.API_KEY}&language=${this.LANGUAGE}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const ctrol = AbortSignal.timeout(timeoutMs);
      try {
        const res = await fetch(finalUri, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${this.API_KEY}`,
          },
          signal: ctrol
        });

        if (res.ok) return res.json();

        const text = await res.text().catch(() => "");
        const retryable = res.status === 429 || (res.status >= 500 && res.status < 600);

        if (retryable && attempt < retries) {
          const retryAfter = res.headers.get("retry-after");
          const backoff = retryAfter ? Number(retryAfter) * 1000 : 300 * Math.pow(2, attempt) + Math.random() * 100;
          await new Promise((r) => setTimeout(r, backoff))
          continue;
        }

        const err = new Error(`TMDB fetch failed ${res.status} ${endpoint}: ${text}`);
        throw err;
      } catch (e: any) {
        const isAbort = e.name === "AbortError" || e.name === "TimeoutError";
        const isNetwork = e.cause?.code === "ECONNRESET" || String(e.message).includes("fetch failed");
        if ((isAbort || isNetwork) && attempt < retries) {
          await new Promise((r) => setTimeout(r, 300 * Math.pow(2, attempt)));
          continue;
        }
        throw e;
      }
    }
  }
}