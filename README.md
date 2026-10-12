# Pânico de Estado

> **E se o Brasil fosse exatamente aquele que mandaram você temer?**

Jogo curto de sátira política em dois universos alternativos e fictícios:

- **Universo A:** Lula venceu um segundo turno fictício.
- **Universo B:** Flávio Bolsonaro venceu um segundo turno fictício.

Em cada um, os boatos apocalípticos sobre aquele governo **ganharam vida**. Você é um cidadão comum tentando cumprir tarefas banais no primeiro dia desse Brasil impossível. O desfecho junta as duas rotas: um vendedor de kits de sobrevivência lucra com o medo nos dois universos.

> Universo fictício. Lula e Flávio aparecem como caricaturas explicitamente fictícias, com falas inventadas para a obra, e não como citações reais. A sátira mira o autoritarismo imaginado, a burocracia, a trapalhada dos personagens e quem vende o pânico. Ela nunca mira fiéis, mulheres, compradores estrangeiros ou nacionalidades.

## Episódios

| Rota | Episódio | Tarefa do dia | O absurdo | Interação |
| --- | --- | --- | --- | --- |
| Lula | **Operação Amém** | Levar a Tia Nilza ao culto | O Lula caricato entra com um cadeado maior que a porta; fechar a igreja exige senha da própria igreja | Achar um carimbo numa mesa que enche de papel (o carimbo escolhido muda o desfecho) |
| Lula | **O Último Pão de Queijo** | Tomar café | Um fiscal divide o último pão de queijo entre 214 milhões; uma máquina nacionaliza os objetos | Montar o café antes que a máquina carimbe tudo |
| Lula | **Brasil em Entrega** | Buscar uma encomenda | O mapa do Brasil vai na esteira para a China; os estados fogem da caixa | Encaixar as regiões no mapa |
| Flávio | **Brasil, Frete Internacional** | Despachar um presente | O Flávio caricato tenta mandar o Brasil aos EUA; Brasília veio com ministérios demais | Separar o que vai na caixa de 3 kg e o que fica |
| Flávio | **Urna com Autorização** | Levar a Prima Kelly para votar | Uma urna exige autorizações sem fim para o voto das mulheres | Escolher os documentos que expõem as contradições até a Kelly se autorizar |
| Flávio | **Petrobras na Sacola** | Abastecer o carro | Uma refinaria vendida numa sacola, sem manual, cabo ou frete | Montar a entrega para a compradora prática |
| As duas | **Kit de Sobrevivência** | Comprar um carregador | Valdir dos Kits vende o mesmo medo em duas embalagens | Escolher o que fazer (as opções dependem do seu dia) |

Cada episódio tem uma reação rápida logo no começo, uma tarefa principal e um ramo de consequência diferente para cada resultado: vitória, meio-termo ou desastre. Falhar sempre gera uma variação engraçada e o jogo continua. Cada episódio rende um objeto para a coleção.

### Finais (5 por rota)

Assinante do Medo · Pacote Dois Brasis · O Que Tem Dentro · Cliente Perdido (só com 2+ vitórias) · Cliente Fidelizado (só com até 1 vitória).
Finais e objetos descobertos ficam salvos no navegador. O final sempre oferece jogar o outro Brasil.

## Stack

Next.js 15 (App Router), React 19, Tailwind CSS 3 e TypeScript, sem dependências novas.
Personagens, objetos e cenários são SVG desenhados em código. Os sons são sintetizados com Web Audio. Não há imagens externas, APIs nem login: o jogo funciona offline.

## Rodar e checar

```bash
pnpm install
pnpm dev             # http://localhost:3000
pnpm typecheck       # TypeScript
pnpm lint            # ESLint
pnpm check:content   # confere o roteiro: ramos de toda tarefa, resultados, personagens e finais
pnpm build           # build de produção
```

## Controles e acessibilidade

- **Falas:** toque no palco, em **▶ Continuar** ou aperte Enter/Espaço. **⏩ Pular falas** avança até a próxima ação.
- **Mover objetos:** arraste, ou toque no objeto e depois no destino. Funciona por toque, mouse e teclado.
- **Cronômetros:** têm botão de pausa. O botão **Tempo extra**, no topo, dá 75% a mais de tempo.
- **Som:** botão fixo no topo, com a preferência salva.
- **Movimento reduzido:** respeita `prefers-reduced-motion`. Entradas, poses e balões aparecem sem animação.
- Mesmo com o cenário e os personagens ocupando a maior parte da tela, a interface tem alto contraste e botões grandes.

## Onde editar

| Arquivo | O que tem |
| --- | --- |
| `src/game/routes/lula.ts`, `src/game/routes/flavio.ts` | Episódios: falas, entradas, objetos de cena, tarefas e ramos |
| `src/game/finale.ts` | Desfecho compartilhado (Valdir dos Kits) e os 5 finais |
| `src/game/characters.ts` | Personagens: nome, papel e aparência |
| `src/game/script.ts` | Atalhos para escrever cenas: `say`, `enter`, `set`, `nar`… |
| `src/game/types.ts` | Formato dos beats e das três mecânicas (`find`, `assign`, `steps`) |
| `src/components/Backdrops.tsx` | Cenários e os objetos que mudam com a cena |
| `src/components/Props.tsx` | Biblioteca de objetos em SVG |
| `src/components/Puppet.tsx` | Bonecos, poses e expressões |
| `docs/pesquisa.md` | Pesquisa de narrativas alarmistas que serviu de base para as cenas |

Um episódio é uma lista de *beats* executados em ordem. Exemplo:

```ts
enter("lula", 80, { from: "right", mood: "carrega", holding: "cadeado" }),
say("pastor", "Para fechar, precisa pegar senha.", "deboche"),
set("cadeado", "porta"),
{ t: "task", task: { kind: "find", ... }, branches: { fecha: [...], desabou: [...], tempo: [...] } },
```

Depois de editar, rode `pnpm check:content`.

## Sobre a pesquisa

`docs/pesquisa.md` reúne 26 narrativas alarmistas documentadas, 13 de cada campo, com link, data, contexto e ideia de adaptação. Limitação: a leitura direta de páginas e do X/Twitter foi bloqueada no ambiente de pesquisa. Por isso, os links e datas vêm de resultados de busca e precisam ser conferidos antes de qualquer uso público. O jogo não depende dessa pesquisa nem de nenhum feed ao vivo.
