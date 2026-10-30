# StreamFlix — Dossiê Completo do Projeto

> Documento de referência única: o que é, como funciona, o que usa, arquivos
> importantes, onde o projeto está e **como refazer do zero preservando a
> essência** (desktop + webOS). Consolida `README.md`, `ARCHITECTURE.md`,
> `ROADMAP.md`, `BACKLOG.md`, `PROMPT-CONTINUIDADE.md` e auditoria integral
> do código-fonte (107 arquivos em `src/`, ~14.400 linhas TS/TSX).
>
> Data da auditoria: 2026-10-26.

---

## Índice

1. [O que é](#1-o-que-é)
2. [Como funciona (arquitetura e fluxos)](#2-como-funciona)
3. [O que usa (stack e dependências)](#3-o-que-usa)
4. [Mapa de arquivos importantes](#4-mapa-de-arquivos-importantes)
5. [Algoritmos e lógica central](#5-algoritmos-e-lógica-central)
6. [Plataformas: Desktop (Tauri/mpv) e webOS](#6-plataformas)
7. [Licenças — o que pode / não pode](#7-licenças)
8. [Estado atual do projeto](#8-estado-atual-do-projeto)
9. [Fila de tarefas vigente (newupdate.detalhe.txt)](#9-fila-de-tarefas)
10. [Armadilhas comprovadas (não redescubra)](#10-armadilhas-comprovadas)
11. [Refazer do zero — guia para manter a essência](#11-refazer-do-zero)
12. [Dívida técnica e pendências](#12-dívida-técnica-e-pendências)

---

## 1. O que é

**StreamFlix** é um cliente de streaming cinematográfico **em PT-BR**, com
**áudio dublado PT-BR inteligente** — vídeo de alta qualidade combinado com
uma **fonte de áudio externa sincronizada** (quando o vídeo escolhido não
traz dublagem embutida).

- **Identidade e código 100% próprios.** Usa o **ecossistema aberto do
  Stremio** (protocolo de addons HTTP + Cinemeta) como fonte de conteúdo, mas
  **nada é copiado do Stremio** (UI/CSS/shell são GPL e estão proibidos).
- **Dual-target:** Windows 10/11 (`.exe` Tauri v2 + **libmpv** embarcado) e
  **LG webOS** (IPK, player HTML5, navegação por controle remoto 10-foot).
- **Diferencial:** pipeline de áudio externo PT-BR com sincronismo, correção
  de drift, ajuste manual e honestidade sobre limites de codec.

### Essência inegociável (o que deve sobreviver a qualquer refazer)

1. **Arquitetura em camadas:** `UI → Engine (pura) → Integração → Mundo externo`.
   A Engine **nunca** importa React/Tauri/mpv. A UI **nunca** fala HTTP de addon.
2. **Áudio externo PT-BR sincronizado** — o coração do produto.
3. **Dual-target por capabilities**, nunca `if (isWindows)` espalhado:
   desktop usa mpv, TV usa HTML5.
4. **100% PT-BR** via chaves i18n; erros amigáveis sempre em PT-BR.
5. **TypeScript strict** + testes Vitest em toda lógica pura nova.
6. **Protocolo aberto Stremio / dependências MIT apenas** — zero GPL.
7. **Identidade visual própria** (tema dark cinematográfico, tokens CSS próprios).

---

## 2. Como funciona

### 2.1 Visão em camadas

```
ADDONS STREMIO / SERVIÇOS EXTERNOS
  Cinemeta (catálogo/meta) · Torrentio e demais addons (streams/legendas)
  TMDB (títulos, arte, gente, trailers PT-BR) · epg.pw (EPG) · debrid
        │  fetch direto do renderer (protocolo aberto, CORS aberto)
        ▼
CAMADA DE INTEGRAÇÃO   src/integration/**   (StremioClient, TMDB, EPG, debrid)
        │  converte para tipos próprios — tipos do Stremio NUNCA vazam p/ UI
        ▼
STREAMFLIX ENGINE      src/engine/* + src/audio/*   (DOMÍNIO PURO, sem React/Tauri)
        │  ranking de streams, matching, sync/drift, resolução de áudio externo
        ▼
PLAYER                 src/player/*   (PlayerAdapter: MpvAdapter | HtmlVideoAdapter)
        ▼
ESTADO + HOOKS         src/stores/* (Zustand) · React Query · hooks
        ▼
INTERFACE              src/pages/* + src/components/* + src/navigation/*
                       (React 18, rotas lazy, foco espacial, 10-foot ready)
```

**Regra de dependência:** `UI → Engine → Integration → Mundo externo`.
Ciclos proibidos. Hoje o único módulo de áudio que depende do engine é
`AudioSourceResolver` (o caminho inverso não existe).

### 2.2 Pipeline ao clicar "Assistir" (fluxo estrela)

1. **Listar streams** — `StremioStreamService.streamsFor(type, id)` agrega
   todos os addons com recurso `stream` via `Promise.allSettled` e converte em
   `StreamCandidate[]` (qualidade, tamanho, seeders, codecs, provider,
   idiomas embutidos). Conta `torrentOnly` (streams só com `infoHash` — não
   tocam no navegador).
2. **Extrair metadados** — `engine/streamMeta.ts` faz parsing do texto do
   addon (padrão Torrentio): `parseSizeGB`, `parseSeeders`, `detectPtBrAudio`,
   `detectAudioCodec`, `detectVideoCodec`, `detectEmbeddedAudioLangs`,
   `parseProvider`.
3. **Ranquear** — `StreamResolver.rankStreams(candidates, target)` com
   `codecBonus` específico por alvo (`browser` / `tv` / `mpv`). Detalhe na §5.
4. **Verificar dublagem** — `AudioMatcher.needsExternalAudio(tracks)`: há
   faixas mas nenhuma é PT-BR → aciona busca externa.
5. **Achar áudio externo** — `AudioSourceResolver.findExternalAudio(...)`
   filtra URLs diretas do **mesmo conteúdo** com PT-BR, com provedores
   preferidos de dublagem.
6. **Vetar por segurança** — `MediaMatcher.isSameContent(a, b)` confere IDs,
   temporada/episódio, runtime (±3 min) e ano. **Conservador: sem match, sem
   áudio externo** (nunca mixar conteúdo errado).
7. **Carregar no player**
   - **mpv (.exe):** `MpvAdapter.loadWithExternalAudio` → `loadfile` +
     `audio-add` nativo + `audio-delay`. O mpv mistura as duas fontes.
   - **HTML5 (web/TV):** `useExternalAudio` cria um `<audio>` separado que
     segue o `<video>` (play/pause/seek), com `DriftMonitor` corrigindo deriva.
8. **UI** — menu Áudio mostra "🇧🇷 Português (Brasil) — Áudio externo" vs
   "Áudio original", ajuste manual `±0.1 / ±0.5 s` e leitura de offset
   (`+0,7s`) e deriva (ppm).

### 2.3 Seleção de player

`src/player/selectAdapter.ts`:

```ts
const MPV_UI_READY = true;
selectAdapter() →
  se MPV_UI_READY && Platform.getCapabilities().mpvEmbed → MpvAdapter
  senão → HtmlVideoAdapter
```

`mpvEmbed` é verdadeiro apenas dentro do Tauri (`__TAURI_INTERNALS__`).
Fora do `.exe` (dev web, E2E, webOS) **sempre HTML5** — por isso o teste web
**não prova o mpv**.

### 2.4 Navegação e foco (10-foot / TV)

- `src/navigation/FocusEngine.ts` — navegação espacial **pura**
  (`directionScore`, `pickBest`, `moveFocus`, `panOnDeadEnd`).
- `src/navigation/FocusProvider.tsx` — teclado + gamepad + remoto; dispara
  `sf:close-menus`.
- `src/navigation/backStack.ts` + `useBackHandler.ts` — "Voltar" fecha
  modal/prévia/gaveta antes de navegar.
- `src/platform/input.ts` — mapa unificado de ações (`up/down/left/right/
  confirm/back/playPause`) a partir de teclado, **webOS (461/415/19)**,
  **Tizen (10009/10182)**, `MediaPlayPause`, CH+/CH−, gamepad e Magic Remote
  (wheel, `deltaMode`).
- Modo TV (`stores/tvMode.ts`): `auto | ligado | desligado`; adiciona
  `body.tv` / `tv-mode` / `tv-preview`; previews só sob foco/OK.

### 2.5 Rotas (`src/App.tsx`, todas lazy exceto Home)

| Rota | Página | Função |
|---|---|---|
| `/` | `HomePage` | Hero + carrosséis das fileiras |
| `/filmes`, `/series`, `/animes` | `BrowsePage` | grade com filtros, paginação |
| `/canais` | `ChannelsPage` | guia IPTV, EPG, favoritos, zap |
| `/minha-lista` | `MyListPage` | continuar assistindo + biblioteca |
| `/config` | `ConfigPage` | geral/áudio/qualidade/TMDB/atalhos/avançado |
| `/pesquisa` | `SearchPage` | busca fuzzy + gente (TMDB) |
| `/explorar/:rowId` | `ExplorePage` | fileira em grade |
| `/titulo/:id` | `DetailPage` | ficha, temporadas, semelhantes, modal trailer |
| `/assistir/:id` | `PlayerPage` | **o player (2.575 linhas)** |
| `/embed/:id` | `EmbedPage` | iframe de teste isolado |
| `/descobrir` | `DiscoverPage` | Cinemeta top/featured |
| `/addons` | `AddonsPage` | instalar/ativar addons |
| `*` | `HomePage` | catch-all |

### 2.6 i18n

- `src/i18n/index.ts` — i18next, **único locale `pt-BR`**, `fallbackLng: pt-BR`.
- `src/i18n/locales/pt-BR.json` — ~300 chaves **planas com pontos**
  (`nav.inicio`, `player.audioSt.*`, `error.*`, `canais.*`, `config.*`…),
  interpolação `{{count}}`, `{{q}}`, `{{ppm}}`, `{{codec}}`.
- **Regra de ferro:** nenhum texto de usuário hardcoded em inglês. Exceções
  atuais: `ErrorBoundary.tsx` e o `showBootError` de `main.tsx` (antes do
  i18n subir) — corrigíveis.

---

## 3. O que usa

### 3.1 Runtime (`dependencies`)

| Pacote | Papel |
|---|---|
| `react` 18 + `react-dom` | UI |
| `react-router-dom` 6 | rotas |
| `@tanstack/react-query` 5 | estado servidor (catálogos/metas/streams, cache) |
| `zustand` 4 | estado cliente (settings, ui, tvMode, profiles, títulos, canais) |
| `i18next` + `react-i18next` | tradução PT-BR |
| `hls.js` 1.7 | HLS no navegador (webOS/Safari usam HLS nativo primeiro) |
| `tauri-plugin-libmpv-api` 0.3.2 | ponte JS↔Rust do mpv (só no .exe) |

### 3.2 Dev

`typescript` 5.5 (strict + `noUnusedLocals` + `noUnusedParameters` +
`noFallthroughCasesInSwitch`), `vite` 6, `vitest` 2.1 + `@vitest/coverage-v8`
+ `jsdom`, `@playwright/test` 1.63 (projeto **Edge**), `@tauri-apps/cli` 2.11,
`@webosose/ares-cli` 2.4, `@vitejs/plugin-react`.

### 3.3 Scripts (`package.json`)

| Comando | O que faz |
|---|---|
| `npm run dev` | `vite --open --port 1420` |
| `npm run build` | `tsc -b && vite build` |
| `npm test` | `vitest run` (62 arquivos, ~343 casos) |
| `npm run test:e2e` | Playwright (Edge, `e2e/smoke.spec.ts`, 9 fluxos) |
| `npm run lint` | `tsc --noEmit` |
| `npm run pack:tv` | `node scripts/pack-tv.js` → IPK webOS |
| `npm run tauri` | CLI do Tauri (`npx tauri build --debug`) |

### 3.4 Serviços externos

| Serviço | URL / uso |
|---|---|
| **Cinemeta** | `https://v3-cinemeta.strem.io` — catálogo/meta padrão (protocolo Stremio) |
| **Addons do usuário** | manifest em localStorage (`sf-addons`); seeds: Torrentio (streams+debrid), Streaming Catalogs, BestCine, FenixFlix, Veyra, PleiadesStream, FrostView TV |
| **TMDB** | títulos/sinopses PT-BR, arte, episódios, trailers, "gente" (`VITE_TMDB_API_KEY`) |
| **epg.pw** | EPG de canais (CORS aberto, TTL 24h/30min) |
| **Debrid** | Torbox, RealDebrid, Premiumize, AllDebrid, DebridLink, EasyDebrid, Offcloud, Put.io — via config do manifest do Torrentio (`VITE_TORBOX_API_KEY` no boot) |

### 3.5 Segredos (`.env` — nunca commitar)

- `VITE_TMDB_API_KEY`
- `VITE_TORBOX_API_KEY`

**URLs com token debrid nunca entram em log/commit** — só host+tamanho
(`decisionLog.shortUrl`).

---

## 4. Mapa de arquivos importantes

### 4.1 Documentos (raiz)

| Arquivo | Papel |
|---|---|
| `AGENTS.md` | regras de trabalho obrigatórias para IAs |
| `README.md` | como rodar |
| `ARCHITECTURE.md` | decisões de arquitetura + tabela de licenças Stremio |
| `ROADMAP.md` | 18 fases incremental |
| `BACKLOG.md` | pendências pós-Fase 16 |
| `PROMPT-CONTINUIDADE.md` | contexto de sessão: estado + armadilhas mpv |
| `newupdate.detalhe.txt` | **fila de 14 tarefas do dono** (fonte da verdade de product) |
| `DOSSIE-PROJETO.md` | este documento |

### 4.2 Núcleo puro (sem React/Tauri — testável em Vitest)

| Arquivo | Papel |
|---|---|
| `src/engine/StreamResolver.ts` | ranking: `scoreCandidate`, `codecBonus`, `rankStreams`, `pickBest`, `orderForPicker`, `applyQualityLimit` |
| `src/engine/streamMeta.ts` | parsers de texto (tamanho, seeders, codecs, PT-BR, provider) |
| `src/engine/MediaMatcher.ts` | `isSameContent` — veto de conteúdo divergente |
| `src/audio/AudioMatcher.ts` | `isPtBr`, `findPtBrTrack`, `needsExternalAudio`, `titleSuggestsPtBr` |
| `src/audio/AudioSourceResolver.ts` | `findExternalAudio` + `PREFERRED_DUB_PROVIDERS` |
| `src/audio/AudioSyncEngine.ts` | `calculateAudioSync`, `resolveStartOffset`, `applyAudioSync`, `fpsStretchPpm`, classe `DriftMonitor` (mínimos quadrados) |
| `src/audio/compatibility.ts` | `CUT_WARNING`, `checkRuntimeCompatible` |
| `src/types/media.ts` | contrato do domínio: `MediaItem`, `Episode`, `Season`, `CatalogRow`, `AudioTrack`, `StreamCandidate` |
| `src/navigation/FocusEngine.ts` | navegação espacial pura |
| `src/search/engine.ts` | `smartSearch`, `rankResults`, levenshtein |
| `src/recommendations/engine.ts` | `becauseYouWatched` |
| `src/player/skipRules.ts`, `introMemory.ts` | pular abertura/créditos, memória por série |

### 4.3 Integração (`src/integration/`)

| Arquivo | Papel |
|---|---|
| `stremio/StremioClient.ts` | **protocolo puro**: `manifest`, `catalog`, `meta`, `stream`, `subtitles` (só `http(s)`, `AbortSignal.timeout(12000)`) |
| `stremio/StremioAddonService.ts` | addons em localStorage, debrid, seeds |
| `stremio/builtinAddons.ts` | Cinemeta, Torrentio, Streaming Catalogs, BestCine, FenixFlix, Veyra, PleiadesStream, FrostView TV |
| `stremio/StremioCatalogService.ts` / `StremioMetadataService` | catálogo (`top`, `featured`, `latest`, `search`) e meta (`getAuto` tenta series+movie) |
| `stremio/StremioChannelService.ts` | canais IPTV (tipos `channel`/`tv`) |
| `stremio/StremioSubtitleService.ts` | legendas agregadas por addon |
| `stremio/cinemeta.ts` | mappers Cinemeta→`MediaItem` + `translateGenre` |
| `stremio/channelZap.ts`, `channelWindow.ts`, `channelOffline.ts` | zap, janela virtual de linhas, canais offline |
| `stremio/debridBootstrap.ts` | `applyBakedTorbox(env)` no boot |
| `localization/*` | TMDB: `tmdb`, `tmdbArt`, `tmdbCatalog`, `tmdbDetails`, `tmdbEpisodes`, `tmdbTrailer`, `TitleLocalizer`, `useDisplayTitle` |
| `epg/EpgService.ts` | EPG epg.pw |

### 4.4 Player (`src/player/`)

| Arquivo | Papel |
|---|---|
| `PlayerAdapter.ts` | **contrato**: `load`, `loadWithExternalAudio`, `play/pause/seek`, `setVolume`, `setAudioDelay`, `select/listAudioTracks`, `setSpeed?`, `select/listSubtitleTracks?`, `add/clearSubtitle?`, `destroy` |
| `MpvAdapter.ts` | 492 linhas; libmpv via plugin; single-flight `ensure()`; aguarda `file-loaded`; `aid`/`sid` só string; `track-list` só escalares |
| `HtmlVideoAdapter.ts` | DOM `<video>` + hls.js; HLS nativo na TV; `setAudioDelay` no-op |
| `selectAdapter.ts` | escolha mpv vs HTML5 |
| `resolve.ts` | `resolvePlayable`, `playTargetFor`, `nextEpisodeId` |
| `skipRules.ts` / `introMemory.ts` / `embedSources.ts` | abertura, memória, fontes de teste |

### 4.5 Plataforma (`src/platform/`)

| Arquivo | Papel |
|---|---|
| `capabilities.ts` | `getCapabilities()` → `{windowControls, fileSystem, mpvEmbed, tv, gamepad, dualAudio}` |
| `input.ts` | mapa unificado teclado/remoto webOS+Tizen/gamepad/Magic Remote |
| `mediaCaps.ts` | `probeMediaCaps()` → `{mse, hlsNative, mp4avc, hevc}` |
| `polyfills.ts` | `AbortSignal.timeout`, `Promise.allSettled` p/ Chromium antigo da TV |

> **Atenção:** `ARCHITECTURE.md` menciona `platform/window.ts`,
> `filesystem.ts`, `playerHost.ts` e as pastas `src/features/`,
> `src/layouts/` — **esses arquivos/pastas não existem** (features/layouts
> estão vazias; window/filesystem são booleans em `capabilities`).

### 4.6 UI — componentes e páginas

- **Componentes:** `TopBar`, `Hero`, `Carousel` (contém `MediaCard`), 
  `ExpandedCard`, `SafeImg`, `ScrollToTop` (+`RouteTitle`), `ErrorBoundary`,
  `ChannelPlayerLayer`, `ChannelOfflineScreen` *(órfão)*, `icons.tsx` (20 SVGs),
  `topbarScroll.ts`, `channelDrawerFocus.ts`.
- **Páginas:** as 13 da tabela de rotas + `PlaceholderPage` *(órfão)*.
- **Player de canais ≠ player de conteúdo:** canais usam `ChannelPlayerLayer`
  + auto-zap inline; conteúdo/séries usam `.sf-controls` + picker `sf-picker`.

### 4.7 Estado (`src/stores/` Zustand) e biblioteca

`settings.ts` (prefs persistidas), `ui.ts` (preview único, ratings),
`tvMode.ts`, `profiles.ts` (perfis → ns de biblioteca), `titles.ts` (cache
título TMDB), `channelFavorites.ts`, `channelOffline.ts`;
`src/library/LibraryService.ts`, `progress.ts` (retomada, `continuingItems`),
`notifications.ts` (sino da TopBar).

### 4.8 Infra

| Caminho | Papel |
|---|---|
| `src-tauri/tauri.conf.json` | productName `StreamFlix`, **identifier `flix.stream.app`**, janela 1280×720, CSP `null`, `resources: lib/**/*` (DLLs do mpv) |
| `src-tauri/Cargo.toml` | `tauri` 2 + `tauri-plugin-libmpv` 0.3.2 |
| `src-tauri/src/main.rs` | registra `.plugin(tauri_plugin_libmpv::init())` |
| `src-tauri/capabilities/default.json` | `core:default`, fullscreen, `libmpv:default` |
| `src-tauri/lib/` | `libmpv-2.dll` (~94 MB) + wrapper (gitignored) |
| `webos/appinfo.json` | id `flix.stream.app`, versão **0.1.7**, 1920×1080 |
| `webos/` | ícones próprios, IPKs gerados, README de instalação |
| `scripts/pack-tv.js` | build TV com `--base=./` → `dist-tv` → `webos/build` → `ares-package` |
| `scripts/backup.ps1` | ciclo de 5 slots (`D:\STREMFIX-backups` + `vez.txt`) |
| `index.html` | `lang="pt-BR"`, **guard de boot TV** (10 s → "ERRO-TV-BOOT") |
| `tests/` | 62 arquivos Vitest (~343 casos) |
| `e2e/smoke.spec.ts` | 9 fluxos E2E no Edge (mock, sem rede) |

---

## 5. Algoritmos e lógica central

### 5.1 Ranking de streams (`StreamResolver`)

`scoreCandidate` (soma):

1. **Qualidade** (regex): 4K/2160=100, 1440/2K=90, 1080=80, 720=60, 480=40,
   CAM=10; sem padrão=50 (45 se string vazia).
2. **PT-BR** em `langHints`: **+30**.
3. **PT-BR embutido** (modo TV, `preferEmbeddedPtBr`): **+40**.
4. **URL direta** (`.mp4|.webm|.m3u8|.mkv|.avi|.mov`): **+5**.
5. **Codec por alvo** (`codecBonus`):
   - `mpv`: 0 (toca tudo, sem viés).
   - `tv`: HEVC/H264 +8; EAC3/AC3/AAC +6; **DTS/DTS-HD/TrueHD −25**.
   - `browser`: H264 +10, AV1/VP9 +5; **HEVC −25** (tela preta);
     **EAC3/AC3/DTS/DTS-HD/TrueHD/Atmos −25** (mudo); AAC/MP3/Opus/Vorbis/FLAC +8.

Ordenação **estável** (empate mantém ordem do addon). `orderForPicker`:
2 arquivos maiores primeiro → provedores preferidos → resto. `applyQualityLimit`:
`max` mantém só a melhor, `limit` corta acima do teto, `auto` não filtra
(fonte sem qualidade detectada **nunca** é excluída).

### 5.2 Detecção de PT-BR (`AudioMatcher`)

- Variantes: `pt-br, pt_br, ptbr, por-br, pb, pt, por` (+ prefixo `pt-br*`,
  `portuguese-brasil`).
- `titleSuggestsPtBr`: heurística conservadora (`dublado/dub`, `pt br`, `br`
  palavra inteira, `português/portuguese`, `brazil/brazilian`).
- "legendado" **não** conta como áudio PT-BR (é legenda).

### 5.3 Sync e drift (`AudioSyncEngine`)

- `calculateAudioSync(points)`: offset = média de `audio − video`; confiança
  pela dispersão (`<0.15s` alta, `<0.6s` média, senão baixa); ≥2 pontos e
  janela >60 s → drift em **ppm**.
- `resolveStartOffset(saved, autoSync, manual)`: memória por título vence
  (usa `??` p/ respeitar offset salvo `0`).
- `DriftMonitor` (janela deslizante, máx. 30 amostras, span ≥10 s):
  `driftPpm` por **mínimos quadrados**; `needsSnap(tol=0.35)`.
- `fpsStretchPpm(from,to)`: `(from/to − 1) × 1e6`.
- **HTML5:** snap se `|drift| > 0.35 s`; senão, se `|ppm| > 500`, corrige
  `playbackRate` (clamp ±2 %, `preservesPitch`).

### 5.4 Igualdade de conteúdo (`MediaMatcher.isSameContent`)

1. IDs divergentes (imdb/tmdb) → **false**.
2. Mesmo imdb: série exige temporada+episódio iguais; filme → runtime ±3 min.
3. Mesmo tmdb → true.
4. Título normalizado (NFD, sem acento) diferente → false.
5. Ano com diferença >1 → false.
6. Runtime compatível (final).

### 5.5 Áudio externo (`AudioSourceResolver`)

Filtro: `url ≠ vídeo atual` + URL direta + `hasPtBr`. Ordenação: provedor
preferido (`BluDV`, `Comando`, `MicoLeaoDublado`, `BestCine`) → PT-BR
embutido confirmado → **menor `sizeGB`** (só o áudio será usado) → posição no
ranking geral. Sempre exibe `CUT_WARNING`.

---

## 6. Plataformas

### 6.1 Desktop (Windows 10/11) — Tauri v2 + mpv

- `mpvEmbed = isTauri` (detectar por **`__TAURI_INTERNALS__`**).
- `MpvAdapter`: `init` com `vo=gpu-next`, `hwdec=auto-safe`,
  `alang/slang=pt-BR,pt,en`; HLS com cache (`cache-secs=20`,
  `demuxer-max-bytes=80MiB`); `audio-add` externo + `audio-delay`.
- Build: `npx tauri build --debug` (~3 min) →
  `src-tauri/target/debug/streamflix.exe`.
  **O app aberto derruba o linker** (`os error 5`).
- Validação real: só pelo `.exe` (Config → Avançado → Diagnóstico do player,
  conferir o **Build exibido**).

### 6.2 webOS (LG TV) — HTML5 + IPK

- Build: `npx vite build --base=./ --outDir=dist-tv` — **`base` relativa
  obrigatória** (caminho absoluto → tela preta ao abrir por arquivo).
- `scripts/pack-tv.js` copia `dist-tv` → `webos/build` + `appinfo.json` +
  ícones → `ares-package` → IPK. Sem SDK LG, o script avisa e sai com 0.
- Comportamento na TV: ranking alvo `tv`, modo 10-foot automático
  (`body.tv`), previews sob foco, player HTML5 (mpv não existe no webOS),
  `dualAudio=false` (1 mídia por vez), teclas remoto mapeadas.
- Falta: validação em TV física (Fase 18b) e testes de controle reais.

### 6.3 Capacidades (runtime)

```
Capabilities = {
  windowControls, fileSystem,  // Tauri
  mpvEmbed,                    // .exe com libmpv
  tv,                          // webOS (UA ou ?tv)
  gamepad,                     // Gamepad API
  dualAudio                    // !tv
}
```

---

## 7. Licenças

| Componente | Licença | Decisão |
|---|---|---|
| `stremio-core` / `stremio-core-web` | **MIT** | ✅ permitido como dependência (não copiar código) |
| `stremio-addon-sdk` + **Addon Protocol** | MIT / protocolo aberto | ✅ cliente próprio com `fetch` |
| **Cinemeta** | serviço HTTP público | ✅ fonte padrão (com cache) |
| `stremio-video` | permissiva (verificar tag) | ⚠️ estudar só |
| `stremio-web` (React UI) | **GPL-2.0** | ❌ **nunca** copiar componentes/CSS/assets |
| `stremio-shell` (Qt/mpv.cpp) | **GPL-3.0** | ❌ **nunca** copiar |
| `tauri-plugin-libmpv` | **MPL-2.0** | ✅ dependência |
| logos/traduções/icons do Stremio | diversas | ❌ identidade própria |

---

## 8. Estado atual do projeto

### 8.1 ROADMAP — 18 fases (todas fechadas em "prep")

| Fase | Escopo | Status |
|---|---|---|
| 1 | Fundação (Vite/React/TS/i18n/mocks) | ✅ |
| 2–7 | UI, foco, catálogo, cards, detalhes, trailers | ✅ |
| 8 | Player HTML5 → mpv | ✅ (mpv ativo no .exe) |
| 9 | Integração Stremio isolada | ✅ |
| 10–12 | Seleção de streams, áudio externo, sync | ✅ |
| 13–14 | Biblioteca/progresso, configurações | ✅ |
| 15–16 | Otimização, testes | ✅ (~343 unit + 9 E2E) |
| 17 | Build Windows | ⚠️ `.exe` compila/roda; faltam ícones/instalador assinado/auto-update |
| 18 | webOS | ⚠️ prep pronto; **falta TV física** |

### 8.2 O que já funciona (não requebrar)

- Player mpv no `.exe` (`MPV_UI_READY=true`): hwdec, faixas reais,
  PT-BR interno/externo automático, legendas de addon (OpenSubtitles via
  `/subtitles`), capítulos (pular abertura/créditos), intro por série,
  stall acoplado, destroy no unmount, fullscreen via janela OS.
- Menu Áudio/legenda PT-BR + sincronismo manual e deriva.
- Canais IPTV com EPG, favoritos, auto-zap de canal offline.
- Perfis, biblioteca, continuar assistindo, centro de notificações.
- E2E (Edge, 9 fluxos) e suíte unit verdes.

### 8.3 Limites conhecidos (não tente "consertar" no HTML5)

- Navegador **não decodifica HEVC** (tela preta) nem **EAC3/DTS** (mudo) —
  o ranking penaliza; a cura é o mpv.
- Torrents sem debrid (`infoHash`) **não tocam** no navegador.
- Home ainda é **mock**; o real vive em "Descobrir" (pendência Fase 9b).

### 8.4 Estado do ambiente / repositório

- Rust estável + MSVC + Tauri CLI 2 instalados; Node 24; Git local **sem
  remoto** (GitHub adiado); backups em ciclo de 5 slots.
- **Divergência de máquina:** docs e `backup.ps1` apontam `D:\STREMFIX`
  (usuário `DIEGO`); esta cópia vive em `C:\Users\Matt\...`. Ajustar caminhos.
- **`vite.config.ts` e `vitest.config.ts` ausentes** nesta cópia (existiam no
  projeto antigo) — build/test rodam com defaults + flags CLI; `tsconfig.json`
  referencia `vite.config.ts` inexistente.
- Versões divergentes: npm/Tauri `0.1.0` vs `webos` `0.1.7`.
- `diagn-stico-inicial-projeto-stremfix.json` (~122 MB) é log de sessão bruto
  — candidato a exclusão.

---

## 9. Fila de tarefas

Fonte: `newupdate.detalhe.txt` (14 itens, escrita do dono). Status conforme
`PROMPT-CONTINUIDADE.md`:

| # | Tarefa | Status |
|---|---|---|
| 1 | Legenda `forced` não identificada no player | ✅ feito |
| 2 | Filtros de **ano** e de **streaming** (Netflix/Disney…) em Filmes/Séries | ⏳ pendente (streaming exige TMDB↔IMDb ou manifest do addon) |
| 3 | Botão Todos/Filmes/Séries na aba Anime | ✅ feito |
| 4 | Canais: layout TV, buffer 15 s, reinício invisível de travamento, EPG grátis | ⏳ travado (manifest do addon + decisão EPG/buffer) |
| 5 | Transição home→seleção de torrent sem flash de imagem (fundo preto, instantâneo) | ⚠️ parcial (lastArt ok; "instantâneo" não) |
| 6 | Pular abertura/episódio via AniSkip/IntroDB | ⚠️ parcial (capítulos+memória ok; API só pesquisa) |
| 7 | Gêneros de anime não funcionam (addon de metadados) | ⏳ travado (manifest) |
| 8 | "Mostrar mais" some em alguns gêneros | ✅ feito (otimista) |
| 9 | Botão "Melhor" + filtros múltiplos + filtro "Corrida" (veículos) | ⏳ pendente |
| 10 | Marcador de episódio assistido | ⏳ pendente (ids concluídos + check) |
| 11 | Deletar arquivo no Torbox ao fechar o vídeo | ⏳ travado (chave Torbox + decisão auto×perguntar) |
| 12 | Aperfeiçoar comandos do controle | ⏳ travado (precisa dizer qual controle) |
| 13 | Log completo de diagnóstico do app | ⚠️ parcial (diário do player ok; falta rede/catálogo) |
| 14 | Manifest do addon de catálogo (ex.: Marvel) | ⏳ travado (manifest) |

**Travados só com o dono:** manifests (2, 4, 7, 14), chave Torbox + decisão
(11), controle exato (12), chave TMDB, assinatura do release.

---

## 10. Armadilhas comprovadas

> Do `PROMPT-CONTINUIDADE.md` §6 — **não redescubra**.

1. `getProperty` em formato **`node` DERRUBA o processo** (libmpv-wrapper
   0.1.1 + libmpv 0.41). Só **escalares**: `track-list/count`,
   `track-list/N/type`, `track-list/N/lang`…
2. **`aid`/`sid` só como string** (`aid=auto` sempre foi string); número JSON
   vira double e o mpv rejeita.
3. Tauri detectado por **`__TAURI_INTERNALS__`** — nunca só `__TAURI__`
   (só existe com `withGlobalTauri`, desligado; o .exe rodou HTML5 meses).
4. `ensure()` do `MpvAdapter` precisa **single-flight** (10 inits no mount).
5. `loadfile` é assíncrono: `load()` registra `waitForFileLoaded` **antes** do
   comando e aguarda `file-loaded` (timeout 15 s não rejeita).
6. `end-file` do teardown vaza após `loadfile replace`: filtrar por
   `awaitingStart` + `playlist_entry_id` e deduplicar (o plugin re-entrega
   eventos ~100×/s).
7. `seek`/`aid` sem arquivo são ignorados com log (não erro).
8. **Nunca editar arquivos com PowerShell `Set-Content`** (corrompe acentos) —
   usar ferramenta de edição.
9. **Nunca** `useRef`/`useEffect` após early-return no `PlayerPage`
   (React #310). Re-auditar ao mexer no arquivo.
10. `mpvReload` é o funil único de carga com dedupe por chave
    `url|audioUrl`; "manual" força o reload.
11. HLS no webOS: **pipeline nativo primeiro**, hls.js só como retry.
12. `index.html` precisa do guard de boot TV (10 s → `ERRO-TV-BOOT`) para
    evitar tela preta silenciosa na TV.
13. Streams de torrent só com `infoHash` não tocam no navegador — exibir
    estado "torrent-only" claro.

---

## 11. Refazer do zero

### 11.1 Ordem de construção (espelha as 18 fases)

1. **Fundação** — Vite + React 18 + TS strict + i18n pt-BR + tokens CSS
   próprios (`tokens.css`) + `index.html` com guard de boot TV.
2. **Domínio puro primeiro** (com Vitest desde o dia 1):
   `streamMeta` → `StreamResolver` (3 alvos) → `MediaMatcher` →
   `AudioMatcher` → `AudioSourceResolver` → `AudioSyncEngine`+`DriftMonitor`.
3. **Integração Stremio** — `StremioClient` próprio (`fetch`, 5 endpoints,
   timeout, allowlist `http(s)`) + Cinemeta default + `StremioAddonService`
   (localStorage) + mappers (`cinemeta.ts`) + TMDB para PT-BR.
4. **PlayerAdapter + HtmlVideoAdapter** (hls.js, HLS nativo na TV,
   `loadWithExternalAudio` degradando para `load` + aviso).
5. **UI + foco espacial** — TopBar/Hero/Carousel/MediaCard/Detail/Player,
   `FocusEngine` + `backStack`, modo TV 10-foot, mapa de input unificado.
6. **Estado e persistência** — Zustand (settings/profiles/ui) + React Query
   + `LibraryService`/`progress` (localStorage → interface p/ SQLite depois).
7. **Tauri + libmpv por último** — `src-tauri` (identifier único,
   `resources: lib/**`), `MpvAdapter` com as regras da §10, `selectAdapter`.
8. **webOS** — build `--base=./`, `appinfo.json`, `pack:tv`, ícones,
   validação em TV física.

### 11.2 Checklist de essência (aceite de qualquer refazer)

- [ ] Engine sem import de React/Tauri (verificar por grep).
- [ ] UI sem `fetch` direto de addon (só via `StremioClient`).
- [ ] Ranking com os 3 alvos (`browser`/`tv`/`mpv`) e penalidades
      HEVC/DTS corretas.
- [ ] Áudio externo PT-BR com `MediaMatcher` conservador
      (**sem match → sem áudio externo**).
- [ ] `Platform.getCapabilities()` — zero `if (isWindows)` na UI.
- [ ] Todo texto de usuário no `pt-BR.json` (nada hardcoded).
- [ ] `npm run build` + `npm test` verdes; E2E verde ao mexer em UI/player.
- [ ] Nenhum arquivo/GPL do Stremio no repo.
- [ ] Segredos só em `.env`; URLs com token fora de logs e commits.
- [ ] Dois builds: `dist` (Tauri, caminhos absolutos) e `dist-tv`
      (`--base=./`, relativos) — nunca trocar os dois.

### 11.3 Se puder escolher de novo (recomendações)

- **Particionar desde o início** o player (o `PlayerPage.tsx` atual tem
  2.575 linhas): separar `PlayerControls`, `SourcePicker`, `AudioMenu`,
  `ChannelLayer` em módulos.
- **Criar `vite.config.ts`/`vitest.config.ts` versionados** (aliases,
  thresholds de cobertura) — não depender de defaults.
- **Home já nascer via Cinemeta** (hoje é mock).
- Unificar versionamento (npm/Tauri/webOS) num único fonte.
- Manter `PROMPT-CONTINUIDADE.md` vivo como "memória de armadilhas".

---

## 12. Dívida técnica e pendências

**Código**
- Home mock → Cinemeta real (BACKLOG Fase 9b).
- Particionar `PlayerPage.tsx` (2.575 linhas); extrair `DetailModal`/
  `PlayerControls` (hoje inline).
- Componentes órfãos: `ChannelOfflineScreen.tsx`, `PlaceholderPage.tsx`.
- Pastas vazias: `src/features/`, `src/layouts/`; `src/genres/` não existe.
- Docs desatualizados: `ARCHITECTURE.md` cita `platform/window.ts`,
  `filesystem.ts`, `playerHost.ts` (inexistentes), `AudioTrackDetector`
  (na verdade métodos dos adapters) e `DriftMonitor` como arquivo (é classe
  dentro de `AudioSyncEngine.ts`).
- Exceções i18n: `ErrorBoundary.tsx`, `showBootError` em `main.tsx`.

**Produto** — fila da §9 (filtros, buffer de canais, AniSkip, marcador de
assistido, limpeza Torbox, log total).

**Infra**
- Recriar `vite.config.ts`/`vitest.config.ts`; corrigir `tsconfig.json`.
- Ajustar caminhos `D:\STREMFIX` (docs, `backup.ps1`).
- Ícones/instalador Windows assinado, auto-update (Fase 17b).
- Validação em TV física (18b) + ícones PNG finais.
- Assinatura/TMDB aberta para busca "por gente".
- Excluir `diagn-stico-inicial-projeto-stremfix.json` (122 MB) e adicionar
  ao `.gitignore`.
- Git sem remoto — definir quando publicar.

---

### Comandos essenciais

```bat
cd /d <pasta-do-projeto>
npm install
npm run dev        http://localhost:1420
npm run build      tsc + vite (obrigatório após código)
npm test           Vitest (62 arquivos, ~343 casos)
npm run test:e2e   Playwright no Edge (9 fluxos)
npm run pack:tv    IPK webOS (exige SDK LG)
npx tauri build --debug   .exe (fechar o app antes!)
```
