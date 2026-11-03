// scripts/check-tv.js — pré-validação antes de `npm run pack:tv` (Fase 18).
// Verifica typecheck, build de teste com base relativa, appinfo.json, ícones,
// referências quebradas e URLs locais no bundle. Exit code 1 em qualquer falha.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const failures = [];
const warnings = [];
const passed = [];

const ok = (msg) => {
  passed.push(msg);
  console.log(`[check:tv] ✅ ${msg}`);
};
const fail = (msg) => {
  failures.push(msg);
  console.error(`[check:tv] ❌ ${msg}`);
};
const warn = (msg) => {
  warnings.push(msg);
  console.warn(`[check:tv] ⚠️  ${msg}`);
};

// ---------------------------------------------------------------------------
// 1. Typecheck (o pack:tv não roda tsc — erros de tipo passariam direto)
// ---------------------------------------------------------------------------
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  ok('Typecheck (tsc --noEmit) sem erros');
} catch {
  fail('Typecheck falhou (erros de tipo em src/ ou scripts/)');
}

// ---------------------------------------------------------------------------
// 2. Build de teste com base relativa (./) — obrigatória para file:// na TV
// ---------------------------------------------------------------------------
const CHECK_DIR = 'dist-tv-check';
try {
  rmSync(CHECK_DIR, { recursive: true, force: true });
  mkdirSync(CHECK_DIR, { recursive: true });
  execSync(`npx vite build --base=./ --outDir=${CHECK_DIR}`, { stdio: 'inherit' });
  ok(`Build de teste gerado em ${CHECK_DIR}/ (base=./)`);
} catch {
  fail('Build de teste (vite build --base=./) falhou');
}

// ---------------------------------------------------------------------------
// 3. webos/appinfo.json
// ---------------------------------------------------------------------------
const APPINFO_PATH = 'webos/appinfo.json';
let appInfo = null;
try {
  appInfo = JSON.parse(readFileSync(APPINFO_PATH, 'utf-8'));
  ok('appinfo.json é JSON válido');
} catch {
  fail('appinfo.json ilegível ou JSON inválido');
}

if (appInfo) {
  const required = ['id', 'version', 'type', 'main', 'title', 'icon', 'resolution'];
  const missing = required.filter((k) => !appInfo[k] || typeof appInfo[k] !== 'string');
  if (missing.length) fail(`appinfo.json sem campos obrigatórios: ${missing.join(', ')}`);
  else ok('appinfo.json com todos os campos obrigatórios');

  if (appInfo.type && appInfo.type !== 'web') {
    fail(`appinfo.json type="${appInfo.type}" — deve ser "web" para webOS`);
  }
  if (appInfo.id && !/^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(appInfo.id)) {
    fail(`appinfo.json id="${appInfo.id}" fora do formato reverse-DNS (ex: flix.torii.app)`);
  }
  if (appInfo.version && !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(appInfo.version)) {
    fail(`appinfo.json version="${appInfo.version}" fora do formato semver (x.y.z)`);
  }
  if (appInfo.resolution && appInfo.resolution !== '1920x1080') {
    warn(`appinfo.json resolution="${appInfo.resolution}" — o alvo do projeto é 1920x1080`);
  }
}

// ---------------------------------------------------------------------------
// 4. Ícones PNG (dimensões lidas do header IHDR)
// ---------------------------------------------------------------------------
const readPngSize = (path) => {
  const buf = readFileSync(path);
  const isPng = buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47;
  if (!isPng) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};

const expectedIcons = [
  { file: 'webos/icon.png', width: 80, height: 80 },
  { file: 'webos/largeIcon.png', width: 130, height: 130 },
  { file: 'webos/splash.png', width: 1920, height: 1080 },
];
for (const { file, width, height } of expectedIcons) {
  if (!existsSync(file)) {
    fail(`${file} ausente`);
    continue;
  }
  const size = readPngSize(file);
  if (!size) {
    fail(`${file} não é um PNG válido`);
  } else if (size.width !== width || size.height !== height) {
    fail(`${file} é ${size.width}x${size.height} — esperado ${width}x${height}`);
  } else {
    ok(`${file} ${width}x${height}`);
  }
}

// ---------------------------------------------------------------------------
// 5. Saída do build: index.html, caminhos relativos, referências existentes
// ---------------------------------------------------------------------------
const CHECK_INDEX = join(CHECK_DIR, 'index.html');
if (!existsSync(CHECK_INDEX)) {
  fail(`${CHECK_INDEX} não existe (build de teste não gerou index.html)`);
} else {
  const html = readFileSync(CHECK_INDEX, 'utf-8');
  const checkDirAbs = resolve(CHECK_DIR);

  const refPattern = /(?:src|href)="([^"]+)"/g;
  const refs = [...html.matchAll(refPattern)].map((m) => m[1]);
  if (refs.length === 0) warn('index.html sem nenhuma referência src/href');

  let broken = 0;
  let absolute = 0;
  for (const ref of refs) {
    if (ref.startsWith('data:') || ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('#')) continue;
    if (ref.startsWith('/')) {
      absolute++;
      fail(`index.html usa caminho absoluto "${ref}" — TV exige caminho relativo (./...)`);
      continue;
    }
    const target = resolve(checkDirAbs, ref.split('?')[0].split('#')[0]);
    if (!target.startsWith(checkDirAbs) || !existsSync(target)) {
      broken++;
      fail(`index.html referencia arquivo inexistente: "${ref}"`);
    }
  }
  if (absolute === 0 && broken === 0 && refs.length > 0) {
    ok(`index.html: ${refs.length} referência(s) relativa(s) e existente(s)`);
  }

  // CSS gerado: url(...) deve resolver (ou ser data:/http externo)
  const assetsDir = join(CHECK_DIR, 'assets');
  if (existsSync(assetsDir)) {
    const cssFiles = readdirSync(assetsDir).filter((f) => f.endsWith('.css'));
    let cssBroken = 0;
    for (const cssFile of cssFiles) {
      const cssPath = join(assetsDir, cssFile);
      const css = readFileSync(cssPath, 'utf-8');
      const urlPattern = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
      for (const m of css.matchAll(urlPattern)) {
        let u = m[1];
        try { u = decodeURIComponent(u); } catch { /* mantém raw */ }
        if (u.startsWith('data:') || u.startsWith('http://') || u.startsWith('https://') || u.startsWith('#')) continue;
        if (u.startsWith('/')) {
          cssBroken++;
          fail(`${cssFile}: url() absoluto "${u}" — deve ser relativo`);
          continue;
        }
        const target = resolve(dirname(cssPath), u.split('?')[0].split('#')[0]);
        if (!existsSync(target)) {
          cssBroken++;
          fail(`${cssFile}: url() referencia arquivo inexistente "${u}"`);
        }
      }
    }
    if (cssBroken === 0) ok(`CSS: ${cssFiles.length} arquivo(s) sem referências quebradas`);
  }
}

// ---------------------------------------------------------------------------
// 6. appinfo.main presente no bundle
// ---------------------------------------------------------------------------
if (appInfo && appInfo.main && existsSync(CHECK_DIR)) {
  if (existsSync(join(CHECK_DIR, appInfo.main))) {
    ok(`appinfo main="${appInfo.main}" presente no bundle`);
  } else {
    fail(`appinfo main="${appInfo.main}" não existe no bundle ${CHECK_DIR}/`);
  }
}

// ---------------------------------------------------------------------------
// 7. URLs locais proibidas no bundle (APIs https externas são permitidas)
// ---------------------------------------------------------------------------
if (existsSync(CHECK_DIR)) {
  const collectFiles = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = join(dir, e.name);
      return e.isDirectory() ? collectFiles(p) : [p];
    });
  const bundleFiles = collectFiles(CHECK_DIR).filter((f) => /\.(js|css|html|json|svg)$/.test(f));
  let localRefs = 0;
  for (const file of bundleFiles) {
    const content = readFileSync(file, 'utf-8');
    if (content.includes('localhost') || content.includes('127.0.0.1')) {
      localRefs++;
      fail(`${file}: contém localhost/127.0.0.1 — bloqueado no bundle da TV`);
    }
  }
  if (localRefs === 0) ok(`Sem localhost/127.0.0.1 em ${bundleFiles.length} arquivo(s) do bundle`);
}

// ---------------------------------------------------------------------------
// 8. Tamanho do JS (aviso — TVs têm pouca memória)
// ---------------------------------------------------------------------------
if (existsSync(join(CHECK_DIR, 'assets'))) {
  const jsFiles = readdirSync(join(CHECK_DIR, 'assets')).filter((f) => f.endsWith('.js'));
  const totalJs = jsFiles.reduce((sum, f) => sum + statSync(join(CHECK_DIR, 'assets', f)).size, 0);
  const mb = totalJs / (1024 * 1024);
  if (mb > 5) warn(`JS total ${mb.toFixed(1)} MB (> 5 MB) — risco de OOM em TVs mais fracas`);
  else ok(`JS total ${mb.toFixed(2)} MB (limite de aviso: 5 MB)`);
}

// ---------------------------------------------------------------------------
// Resumo
// ---------------------------------------------------------------------------
console.log('');
console.log(`[check:tv] ── Resumo: ${passed.length} ok, ${warnings.length} aviso(s), ${failures.length} falha(s)`);
if (failures.length > 0) {
  console.error('[check:tv] FALHOU — corrija antes de rodar npm run pack:tv');
  process.exit(1);
}
console.log('[check:tv] TUDO OK — seguro rodar npm run pack:tv');
