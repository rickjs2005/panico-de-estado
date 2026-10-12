# Pânico de Estado

Jogo curto (cerca de 5 minutos) de **sátira política fictícia com terror psicológico**.
O jogador escolhe entre dois Brasis hipotéticos: um em que Lula venceu e outro em que Flávio Bolsonaro venceu.
Nos dois, ele vive um dia de pânico fabricado por boatos, cortes, lives e grupos de família.

> Sátira política fictícia. Os eventos e personagens secundários foram inventados.
> Os presidentes aparecem só como versões caricatas e hipotéticas (silhuetas), **sem falas atribuídas a eles**.
> Os boatos centrais (o "churrasco estatizado" e o "pão francês proibido") são invenções absurdas e aparecem marcados como tal dentro do jogo.

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

1. **Tela inicial**: título, aviso de ficção e apresentação das duas rotas.
2. **Escolha do Brasil**: Governo Lula (boato do churrasco) ou Governo Flávio (boato do pão francês).
3. **7 rodadas por rota**: grupo da família, pronunciamento, live de influenciador, coletiva, sala de estar, meme contra comunicado oficial e uma ligação às 3h33. Cada rodada tem 3 reações.
4. **Indicadores**: Pânico, Popularidade e Caos. Eles liberam linhas extras nas cenas e decidem o final.
5. **5 finais por rota**: Calma Oficial, A Comissão da Comissão, Tudo Transmite, Saiu do Grupo e O Outro Brasil.

### Terror psicológico

- notificações que se acumulam, mais rápido quanto maior o pânico;
- mensagens que invadem a tela quando você silencia o grupo ou fica parado sem escolher;
- manchetes contraditórias correndo no rodapé;
- vinheta, scanlines, relógio travado em 03:33 e bateria baixa conforme o pânico sobe;
- zumbido grave de fundo que cresce com o pânico (pode ser desligado).

### Acessibilidade

- feito primeiro para celular, com botões grandes e alto contraste;
- respeita `prefers-reduced-motion`: sem animações, e o rodapé de manchetes fica parado;
- botão fixo para ligar e desligar o som, com a preferência salva no navegador;
- sem violência gráfica e sem sustos repentinos.

## Editar o conteúdo

Todo o texto fica em arquivos de dados, separado dos componentes:

| Arquivo | O que tem |
| --- | --- |
| `src/game/routes/lula.ts` | Rota "Governo Lula": elenco, rodadas, escolhas, notificações, manchetes e finais |
| `src/game/routes/flavio.ts` | Rota "Governo Flávio", com a mesma estrutura espelhada |
| `src/game/engine.ts` | Valores iniciais dos indicadores, nível de pânico e regra de escolha do final |
| `src/game/shared.ts` | Mensagens de cobrança quando o jogador fica parado |
| `src/game/types.ts` | Formato dos dados (rodada, escolha, variante, final) |

Cada escolha tem `effects` (quanto muda cada indicador), `result` (as frases de consequência), além de `ignore` e `aftershock`, que são opcionais.
Uma `variant` adiciona linhas à cena quando um indicador passa de um limite.
Depois de mexer nos números, rode `pnpm endings` para conferir se todos os finais continuam alcançáveis.
