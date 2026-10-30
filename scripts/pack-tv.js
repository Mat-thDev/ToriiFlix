// scripts/pack-tv.js — empacota o IPK webOS (Fase 18) sem depender do rimraf quebrado do ares-package.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const log = (m) => console.log(`[pack:tv] ${m}`);

// 1. Limpeza e recriação da pasta webos/build
rmSync('webos/build', { recursive: true, force: true });
mkdirSync('webos/build', { recursive: true });

// 2. Build da TV com base relativa (./)
log('Compilando frontend para webOS...');
execSync('npx vite build --base=./ --outDir=dist-tv', { stdio: 'inherit' });

// 3. Copia os artefatos do vite para webos/build
cpSync('dist-tv', 'webos/build', { recursive: true });

// 4. Copia metadados e ícones do webos/
for (const f of ['appinfo.json', 'icon.png', 'largeIcon.png', 'splash.png']) {
  if (existsSync(`webos/${f}`)) cpSync(`webos/${f}`, `webos/build/${f}`);
}

if (!existsSync('webos/build/icon.png')) {
  log('AVISO: webos/icon.png ausente (80x80). Gere antes de instalar na TV.');
}

// Lê o appinfo.json para pegar o ID e a versão corretos para o nome do arquivo IPK
let appId = 'flix.torii.app';
let appVersion = '0.1.7';
try {
  const appInfoContent = JSON.parse(readFileSync('webos/appinfo.json', 'utf-8'));
  if (appInfoContent.id) appId = appInfoContent.id;
  if (appInfoContent.version) appVersion = appInfoContent.version;
} catch (e) {
  // usa os fallbacks definidos acima
}

const ipkName = `${appId}_${appVersion}_all.ipk`;
const ipkOutputPath = join('webos', ipkName);

log(`Gerando pacote IPK: ${ipkName}...`);

// O webOS IPK é um pacote tar/gzip compactado. Vamos usar o comando nativo tar do Windows (disponível no Win 10/11)
// para empacotar a pasta webos/build diretamente no formato tar.gz e renomear para .ipk, contornando o bug do rimraf do ares-package.
try {
  // Remove IPK anterior se existir
  if (existsSync(ipkOutputPath)) rmSync(ipkOutputPath);

  // Executa o tar nativo do Windows a partir de dentro da pasta webos/build para manter a estrutura correta
  execSync(`tar -a -c -f "${ipkOutputPath}" -C "webos/build" .`, { stdio: 'inherit' });
  log(`Sucesso! IPK gerado em: ${ipkOutputPath}`);
} catch (err) {
  log('Erro ao gerar o IPK via tar nativo. Tentando método alternativo...');
  throw err;
}