# Pânico de Estado

Jogo curto (cerca de 7 minutos) de **sátira política fictícia com terror psicológico**.
O jogador escolhe entre dois Brasis hipotéticos: um em que Lula venceu e outro em que Flávio Bolsonaro venceu.
Nos dois, ele vive um dia de pânico fabricado por boatos, cortes, lives e grupos de família.

> Sátira política fictícia. Os eventos e personagens secundários foram inventados.
> Lula e Flávio aparecem só como bonecos caricatos e hipotéticos, **sem falas atribuídas a eles**: apenas reagem.
> Os boatos são invenções para o jogo e aparecem marcados como tal.

## Stack

Next.js 15 (App Router), React 19, Tailwind CSS 3 e TypeScript, a mesma base do `milweb`. Não há outras dependências.
Os sons são sintetizados com Web Audio, sem arquivos de áudio.

## Rodar

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck    # TypeScript
pnpm lint         # ESLint
pnpm build        # build de produção
pnpm endings      # simula todos os caminhos e mostra quantos levam a cada final
```

## Como o jogo funciona

1. **Tela inicial**: título, aviso de ficção, elenco de bonecos e apresentação das duas rotas.
2. **Escolha do Brasil**: Governo Lula ou Governo Flávio. Cada rota tem os próprios boatos, personagens e piadas.
3. **8 rodadas por rota**, alternando decisões e ações rápidas:
   - **decisões**: escolha uma reação, às vezes contra o relógio (grupo da família, live de influenciador, ligação das 3h33);
   - **crise tripla**: na coletiva, escolha qual das três crises atender primeiro; as outras pioram;
   - **tocar nas notificações**: silencie o boato antes que ele cubra a tela;
   - **cortar o sinal**: interrompa o pronunciamento antes do trecho que dá para tirar de contexto;
   - **lixeira**: arraste o meme para o lixo (ou toque em "Lixeira"); cada um apagado pode virar cópias.
4. **Bonecos em cena**: Lula e Flávio em caricaturas hipotéticas (sem falas, só reações), a pessoa jogadora como assessor(a), família, ministros, assessores e influenciadores fictícios. Todos reagem às decisões com expressões e poses (preocupação, deboche, susto, comemoração e desespero).
5. **Indicadores com efeito visível**:
   - **Pânico**: notificações chegam mais rápido, a tela escurece, o relógio trava em 03:33;
   - **Popularidade**: muda a reação do presidente caricato e a aprovação mostrada nas cenas;
   - **Caos**: a interface entorta, o rodapé ganha manchetes extras e, no extremo, a tela "trinca".
6. **5 finais por rota**: Calma Oficial, A Comissão da Comissão, Tudo Transmite, Saiu do Grupo e O Outro Brasil, com opção de jogar de novo ou trocar de rota.

### Boatos (todos inventados para o jogo)

- Rota Lula: igrejas fechando, Brasil comunista ("vão dividir a sua casa"), país entregue à China e o bilhete do "sexto ano vai trocar de sala" lido como outra coisa.
- Rota Flávio: país entregue aos EUA (o almoço vira brunch), mulheres perdendo o voto e a Petrobras "vendida" (era a placa de uma lanchonete, a "Petro-Esfiha").

Os boatos aparecem sempre marcados como invenção. A piada mira quem inventa, quem encaminha sem ler, quem tenta conter e quem lucra.
Os posts, perfis e veículos são fictícios e ficam nos arquivos de rota. Não há conexão com o X/Twitter nem com qualquer API: o jogo funciona offline e sem credenciais.

### Acessibilidade

- feito primeiro para celular, com botões grandes e alto contraste;
- **Tempo extra**: botão fixo no topo que dá 75% a mais de tempo em todos os desafios cronometrados;
- todos os minijogos funcionam por toque, mouse e teclado (a lixeira tem botão, não só arrasto);
- respeita `prefers-reduced-motion`: bonecos e telas param de animar e o rodapé de manchetes fica parado;
- botão fixo para ligar e desligar o som, com a preferência salva no navegador;
- sem violência gráfica e sem sustos repentinos.

## Editar o conteúdo

Todo o texto fica em arquivos de dados, separado dos componentes:

| Arquivo | O que tem |
| --- | --- |
| `src/game/routes/lula.ts` | Rota "Governo Lula": boatos, rodadas, minijogos, notificações, manchetes e finais |
| `src/game/routes/flavio.ts` | Rota "Governo Flávio", com a mesma estrutura espelhada |
| `src/game/characters.ts` | Bonecos: nome, papel e aparência (pele, cabelo, barba, óculos, roupa, acessórios) |
| `src/game/engine.ts` | Valores iniciais, regra de escolha do final e reação automática dos bonecos |
| `src/game/types.ts` | Formato dos dados (rodadas `choice`, `tap`, `interrupt`, `drag`, finais) |

Cada rodada tem um `mode`:

- `choice`: `choices` com `effects`, `result` e `reactions`. Opcionalmente `timer` e `timeout`, e `layout: "cards"` para a crise tripla.
- `tap`: `items` (as notificações), `duration`, `spawnEvery`, `maxOnScreen`.
- `interrupt`: `script`, em que `|` marca a partir de onde cortar é seguro e `[...]` marca o trecho perigoso.
- `drag`: `rumor` e `copies` (os rótulos das cópias que surgem).

Minijogos têm `outcomes.good`, `outcomes.mid` e `outcomes.bad`. `reactions` define a cara de cada boneco depois do resultado.
Depois de mexer nos números, rode `pnpm endings` para conferir se todos os finais continuam alcançáveis.
