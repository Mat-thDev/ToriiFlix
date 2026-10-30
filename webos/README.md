# webOS / LG TV — pacote IPK (Fase 18, prep)

## Instalar na TV (Developer Mode, igual ao Stremio IPK)

1. `npm run build` e depois `npm run pack:tv`
   - Sem o SDK, o script imprime o passo a passo e sai sem erro
   - Com o SDK (`ares-package`), gera `webos/*.ipk`
2. `ares-install <arquivo>.ipk` com a TV pareada (`ares-setup-device`)
3. Na TV, o modo TV ativa sozinho (UA webOS): fontes maiores, foco reforçado

## Artefatos (gerados localmente, próprios)

- `webos/icon.png` (80×80), `largeIcon.png` (130×130), `splash.png`
  (1920×1080): marca própria simples (fundo escuro + play vermelho).
- IPK de teste: `webos/flix.stream.app_0.1.0_all.ipk` (via `npm run pack:tv`,
  exige o CLI webOS: `npm install -D @webosose/ares-cli`).

## Comportamento na TV (por construção)

- Ranking de fontes usa o alvo `tv`: HEVC/Dolby sem penalidade, DTS penalizado
- Sem autoplay pesado: previews só sob foco/OK (não há hover no controle)
- Player HTML5 com os codecs da TV; mpv não existe no webOS
- Validação real exige a TV física (Fase 18 cobre prep; device testa na 18b)
