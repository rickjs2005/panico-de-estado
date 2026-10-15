# Pânico de Estado

> **E se o Brasil fosse exatamente aquele que mandaram você temer?**

Jogo curto de sátira política em dois universos alternativos e fictícios:

- **Universo A:** Lula venceu um segundo turno fictício.
- **Universo B:** Flávio Bolsonaro venceu um segundo turno fictício.

Em cada um, os boatos apocalípticos sobre aquele governo **ganharam vida**. Você é um cidadão comum tentando cumprir tarefas banais no primeiro dia desse Brasil impossível. O desfecho junta as duas rotas: um vendedor de kits de sobrevivência lucra com o medo nos dois universos.

> Universo fictício. Lula e Flávio aparecem como caricaturas explicitamente fictícias, com falas inventadas para a obra, e não como citações reais. A sátira mira o autoritarismo imaginado, a burocracia, a trapalhada dos personagens e quem vende o pânico. Ela nunca mira fiéis, mulheres, compradores estrangeiros ou nacionalidades.

## Versão atual: o bairro (mundo 2D)

Ao abrir o site, o jogador escolhe **Lula** ou **Flávio Bolsonaro** (caricaturas fictícias) e já começa num bairro brasileiro em vista 3/4. Não há cadastro nem criação de personagem.

- Andar, correr, falar com moradores, pegar objetos, entrar no carro, dirigir e sair.
- Bairro compacto com praça e coreto, igreja matriz, Fábrica Feliz, Selaria do Zeca, padaria, borracharia, mercadinho, bar, farmácia, escola, lotérica e ruas conectadas.
- Moradores que andam pelas calçadas, olham para o protagonista, pulam para longe do carro e reagem à buzina.
- Feira livre na avenida: bater numa barraca derruba as frutas e o feirante reclama.
- **Missão do Flávio: Chicote Expresso.** Na porta da fábrica, o patrão trata os funcionários bem. Seu Boato acha isso um absurdo e manda buscar um chicote na Selaria do Zeca. O jogador vai de carro, pega o chicote no expositor e volta com ele balançando no carro. Ao receber o chicote, o patrão vira capataz de desenho animado: estala o chicote no ar, a fábrica acelera, a chaminé solta fumaça em forma de cifrão, a faixa muda para "META: 300%" e os funcionários passam a correr com caixas. A consequência fica salva e continua visível.
- O Lula explora o mesmo bairro. A missão dele é a próxima etapa.

### Controles

| | Computador | Celular |
| --- | --- | --- |
| Andar | WASD ou setas | Direcional virtual |
| Correr | Shift | Empurrar o direcional até a borda |
| Interagir (Falar, Pegar, Entrar, Sair, Entregar) | E ou Enter | Botão de ação |
| Carro | W/↑ acelera, S/↓ freia e dá ré, A/D ←/→ vira, Espaço freio de mão, H buzina | Aponte o direcional para onde quer ir; segure **Ré** para voltar; **Bi-bi** buzina |

O menu (☰) tem **Reiniciar experiência**, que apaga o progresso salvo no navegador, e **Trocar personagem**.

### Como funciona

- **Phaser 4** cuida do mundo: movimento, colisão, câmera, interações e ordem de desenho pela posição no chão. **React** cuida da seleção de personagem e do HUD.
- Estados explícitos "a pé" e "dirigindo": só um deles recebe os comandos. Ao sair, o jogo procura um lugar livre ao lado do carro e nunca deixa o personagem preso.
- A missão é feita só de dados (`src/world/mission.ts`): etapas, eventos que concluem cada etapa e falas. A cena informa eventos (falou, pegou, entregou) e a transição só acontece uma vez.
- Personagens montados por partes: cabeça de frente, de lado e de costas, tronco, braços e pernas animados por código. A vista de frente reaproveita a cabeça dos bonecos do jogo original (`PuppetHead`).
- O carro é feito de fatias empilhadas: a mesma vista de cima repetida em camadas deslocadas para cima, o que dá altura em qualquer ângulo.

### Onde editar o mundo

| Arquivo | O que tem |
| --- | --- |
| `src/world/map.ts` | Ruas, quarteirões, prédios, objetos, moradores e pontos de partida |
| `src/world/mission.ts` | Missão Chicote Expresso: etapas, transições e falas |
| `src/world/looks.ts` | Aparência dos moradores e dos protagonistas |
| `src/world/game/art.ts` | Toda a arte desenhada em SVG por código |
| `src/world/game/WorldScene.ts` | Cena principal: controles, câmera, interações e consequências |
| `src/world/game/Walker.ts`, `Car.ts`, `Npc.ts` | Personagem animado, carro empilhado e moradores |
| `src/components/world/` | Seleção de personagem, HUD e direcional virtual |

Para testar com atalhos de depuração, abra com `?debug=1`. Isso expõe `window.__pde` (estado, teleporte e ação).

### Recursos e licenças

- Toda a arte do bairro, dos personagens e do carro é desenhada em código (SVG em `src/world/game/art.ts` e `src/components/Puppet.tsx`). Não há imagens, fontes ou sons de terceiros.
- Sons sintetizados com Web Audio (`src/lib/sound.ts`).
- Dependência nova: [Phaser](https://github.com/phaserjs/phaser) 4.2.1, licença MIT.
- Os pacotes da Kenney (CC0) pesquisados antes não foram usados nesta versão.

## Versão anterior: episódios

A versão em episódios encenados continua disponível em `/episodios`.

### Episódios

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

Next.js 15 (App Router), React 19, Tailwind CSS 3, TypeScript e Phaser 4 (mundo 2D).
Personagens, objetos e cenários são SVG desenhados em código. Os sons são sintetizados com Web Audio. Não há imagens externas, APIs nem login: o jogo funciona offline.

## Rodar e checar

```bash
pnpm install
pnpm dev             # http://localhost:3000
pnpm typecheck       # TypeScript
pnpm lint            # ESLint
pnpm check:content   # confere o roteiro dos episódios e o mapa/missão do mundo 2D
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
