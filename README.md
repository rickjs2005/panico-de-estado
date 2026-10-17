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
- **Brasil do Lula: uma cidade maior para explorar** (veja abaixo), com uma campanha de seis missões jogáveis na própria cidade, escolhas com consequências e a cerimônia final "Ditadura do Carimbo".
- **Brasil do Flávio: outra cidade, com mapa próprio** (veja "O Brasil do Flávio"), com seis missões sobre trabalho e salário, privatização, soberania e ordem e voto, e a cerimônia final "Eleição no Cofre". No lugar da cachaça, a **motociata**; e o Flávio caricato dá **tiros pro alto** de desenho animado.
- O bairro original (`src/world/map.ts`, `src/world/mission.ts`, `src/world/game/LulaWorld.ts`, `WorldScene.ts`) continua no código, com o Chicote Expresso antigo e as quatro missões antigas do Lula, mas não é mais usado: as duas cidades abrem direto.
- **Cachaça como energia de corrida do Lula caricato:** correr gasta a barra; as placas CACHAÇA · ENERGIA espalhadas pela cidade recarregam. Andar e dirigir continuam funcionando com a barra zerada. No Brasil do Flávio não há barra: a corrida é livre.
- Cada Brasil mantém o próprio progresso. O menu "Reiniciar este Brasil" apaga só o do protagonista atual.

## A cidade do Lula (mundo em construção)

Um Brasil fictício e absurdo onde o Lula caricato já governa. A cidade tem 4800 × 3600 px, cerca de 3,5 vezes a área do bairro, e é limitada por um morro com o letreiro "BRASIL HIPOTÉTICO" ao norte, um canal a oeste, uma baía com o navio "Destino: China" ao sul e um muro "fim do mapa" a leste.

| Distrito | O que tem |
| --- | --- |
| **Centro Cívico** | Praça da Revolução dos Áudios (calçada de ondas, coreto, chafariz, Monumento ao Áudio de 3 Minutos, frades), Prefeitura Popular, Ministério do Áudio com megafone gigante, Igreja Matriz interditada com correntes e cadeado, Repartição de Carimbos (interior), Secretaria da Coletivização, Banco Estatal, Assembleia da Fé lacrada e estacionamento municipal |
| **Vila do Mutirão** (residencial) | Casas, conjuntos habitacionais com varais, pátios, pracinha com campinho e placas de propriedade coletiva |
| **Largo da Feira** (comercial) | Feira livre na Rua da Feira, mercadinho, padaria, Bar do Tião (interior), farmácia, oficina, borracharia, shopping popular, lotérica, pastelaria e estacionamento |
| **Cidade Universitária** (educacional) | Universidade do Pânico no modo "liberou geral" (barracas, caixas de som, faixa), biblioteca, escola com depósito de kits coloridos, quadra, cantina do DCE e área de convivência |
| **Polo Industrial** | Fábrica Estatal Nº 1, galpões coletivos, depósitos, pátio de carga com caminhões e estacionamento |
| **Terminal Brasil–China** | Alfândega do Impossível, armazéns de exportação, pátio de contêineres, esteira de despacho do Brasil em caixas, guindaste e cais |

**Infraestrutura:** anel de ruas na borda, três avenidas (do Povo, do Áudio e da Exportação) e ruas locais com traçado próprio em cada distrito; calçadas, meio-fio, faixas de pedestre em todos os cruzamentos, placas com o nome das ruas, postes nas avenidas, sete estacionamentos com vagas pintadas e onze carros estacionados em pontos úteis.

**Todas as 46 edificações têm interior.** Casas (cozinha, área de descanso com cama ou rede, sala), conjuntos (portaria, corredor e apartamento), prefeitura e ministério (recepção, gabinete, arquivo, reuniões, Central de Áudios), igrejas (nave, altar, sino ou violão, sacristia), escola e universidade (salas, merenda, auditório, DCE, reitoria), comércio (gôndolas, vitrines, balcões, cozinhas, estoques), oficinas e indústria (máquinas, porta-paletes, empilhadeira, contêineres). Cada interior tem pelo menos duas interações: sentar, deitar, ligar TV e rádio, abrir geladeira e armário, tocar sino, órgão ou campainha, carimbar, tirar senha, acionar máquinas, examinar objetos e beber cachaça onde faz sentido. As casas têm três variações sorteadas por prédio (clássica, quartão e vendinha, cada uma com um canto de passatempo com ação própria). Padaria, bar, mercadinho, farmácia, lotérica e shopping do Largo da Feira ganharam hortifruti, cafezinho, mesa de pingue-pongue, senhas, filas com balizas e bancos no corredor, e a calçada das lojas tem bicicletário, bancos e canteiros. As igrejas interditadas mantêm correntes e cadeado na porta da frente ("Ler o decreto") e entram pela **porta lateral** (tapete azul). Dentro da sacristia há o mural do decreto: **arrancar o decreto** abre a igreja de verdade (a fachada ganha a porta aberta e a luz quente, o interior troca cartazes, acende os castiçais e tira os cavaletes de interdição, e o pastor muda a fala), e **pregar de volta** interdita outra vez. O estado fica salvo no progresso da cidade e sobrevive a recarregar a página. A Assembleia da Fé tem o mesmo mural, com o lacre do Ministério. Os outros três lugares com estado também mudam por uma ação normal dentro do prédio: a alavanca do Depósito de Kits (distribuir ou repor os kits), a alavanca do Controle de Despacho (parar ou religar o terminal) e a portaria na Reitoria (expediente normal ou liberou geral). Todas voltam ao estado anterior pela mesma ação e persistem ao recarregar.

**Rotina diária dos moradores:** a cidade tem relógio (um dia dura 10 minutos reais; o jogo começa às 7h30 e a hora aparece no painel, com ☀ de dia e 🌙 à noite). Cada um dos 40 moradores da rua dorme em casa (as casas mais próximas do distrito dele), sai de manhã e **anda de verdade pelas calçadas e faixas** até o seu ponto, almoça num estabelecimento (padaria, pastelaria, cantina ou refeitório), volta ao ponto e, à noite, uns passam no Bar do Tião e todos voltam para casa. Quem está dentro de um prédio some da rua e aparece **dentro do prédio** se você entrar (até 4 por vez); quem é do mesmo grupo (conversa, fila) sai e volta junto. À noite a rua escurece. Ao falar com um morador que está a caminho, ele comenta o que está fazendo. A hora fica salva no progresso da cidade; saves antigos sem hora começam às 7h30. Com `?debug=1`, `window.__pde.setHora(21)` muda a hora e `window.__pde.rotinas()` mostra quantos estão dentro, andando ou no ponto.

**Ruas vivas:** 40 moradores genéricos passeiam, atravessam nas faixas, conversam em duplas e esperam em filas; até 36 carros circulam por **todas as ruas**, avenidas e ruas locais, na faixa da direita, e escolhem a saída em cada cruzamento (reto, direita ou esquerda). Nos cruzamentos entra um carro por vez (cruzamentos colados dividem a vez), e quem fica travado muito tempo segue em frente para desfazer o impasse. Freiam para pedestres e para o jogador, buzinam e ultrapassam carros parados quando ninguém vem na outra mão. O movimento acompanha a hora: 36 carros de dia, cerca de 60% no começo da noite e 8 de madrugada (os carros só entram e saem de cena longe da câmera). A Rua da Feira fica fechada aos carros da cidade: a feira ocupa a pista.

**Objetos que se mexem e cães:** cada placa CACHAÇA · ENERGIA tem um caixote com três garrafas. O Lula pega uma (ela fica na mão), bebe quando quiser (a barra de corrida enche) e joga a garrafa vazia: ela voa, quica e rola, ou cai direto na lixeira se houver uma por perto; o caixote se reabastece aos poucos. Nos balcões dos interiores também dá para pegar a garrafa. Três bolas soltas (campinho da Vila do Mutirão, quadra da escola e praça) rolam quando o Lula anda contra elas ou chuta ("Chutar a bola"), quicam nas paredes e voltam para o lugar se ficarem perdidas longe. Dezessete vira-latas com nome (Caramelo, Carimbo, Decreto, Fiado, Pix, Mutirão, Estagiário…) moram pelos seis distritos: passeiam perto de casa, sentam, latem, fogem dos carros, correm atrás da bola, dormem à noite e, de vez em quando ou depois de um carinho ("Fazer carinho no…"), seguem o Lula por um tempo. Nenhum deles bloqueia o caminho.

**Textos:** as falas e os nomes da cidade não usam a palavra "boato" (o `check:city` confere isso nos textos da cidade); o tom irônico fica por conta das situações. O Seu Boato virou **Seu Repassa** e o Ministério do Boato, **Ministério do Áudio**. A mesma regra vale para o Brasil do Flávio.

**Exploração:**
- O nome do distrito aparece ao entrar nele, e o HUD mostra onde você está.
- O mapa abre com a tecla M ou com o botão 🗺️. Ele mostra a posição atual e os lugares, e marca um destino com seta e distância.
- Lugares menores entram no mapa depois que você passa por eles.
- O carro mais próximo é o que você dirige. Ao sair numa vaga pintada, o jogo avisa que o carro está estacionado.
- Batidas derrubam frutas da feira, viram lixeiras e cones e fazem tambores balançarem.
- Toda porta tem tapete. Perto dela, o botão mostra a ação certa ("Entrar no mercadinho", "Entrar na casa") e uma seta amarela indica o que vai receber a ação: porta, carro, móvel ou morador.
- Dentro, o HUD mostra o prédio e o cômodo; a saída é o tapete vermelho embaixo ("Sair para a rua"). Ao sair, o jogador volta à mesma porta, em um ponto livre.
- O mapa marca com ✓ os prédios já visitados, avisa quando você está dentro de uma edificação e mostra a ficha de cada prédio (cômodos, interações, cachaça).
- Paredes internas, fachadas, árvores e placas altas ficam transparentes quando o personagem passa atrás.
- Energia: a barra cheia dura cerca de 15 s de corrida; 11 pontos de cachaça (6 na rua, 5 dentro de bar, padaria, cantina, república e DCE). Andar e dirigir não gastam energia.

**Campanha: seis missões, escolhas com consequências e a Ditadura do Carimbo.** Uma missão ativa por vez, começando por Seu Repassa na praça. O jogador pode cumprir, desobedecer, sabotar ou reinterpretar as ordens: cada solução muda algo visível no mundo, faz um personagem reagir, fica registrada no save e aparece na cerimônia final. Não há moedas, loja, XP, cronômetro nem punição: errar só gera uma fala, e todo erro é recuperável.

| # | Missão | O que se faz | Escolhas (todas concedem o selo) | O que muda no mundo |
| --- | --- | --- | --- | --- |
| 1 | **Protocolo do Áudio** | Descobrir qual formulário vale (3 avisos da praça e a Tia Nilza; bastam 2 pistas) e entregar no guichê da Repartição | Entregar o formulário certo, ou **contestar a contradição entre os avisos** (precisa ter lido 2); os formulários errados são negados | Cartaz da credencial na Repartição (carimbo ou recurso), fala da atendente e do Seu Repassa |
| 2 | **Operação Cadeado: Segunda Via** | Inspecionar a porta, ouvir o pastor, pegar o cadeado no bar do Tião (o freguês dá uma pista) e decidir na porta da igreja | **Cumprir** (instalar), **sabotar** (cadeado de papelão pintado) ou **usar a brecha** (cadeado na frente e lateral regulamentada; só aparece com a pista do bar) | A fachada da Igreja Matriz muda de forma diferente em cada uma (e reconhece se a igreja for reaberta depois), com fila na porta lateral ou placa da portaria 7; o pastor e o Tião reagem |
| 3 | **Kit Gay do Zap: Carga Extraviada** | Ler etiqueta e romaneio das caixas do mercadinho e carregar a certa (a errada abre uma cena engraçada e a caixa volta), entregar no depósito e decidir sobre os kits | **Distribuir lacrados**, **afixar o romaneio e desmentir o zap** ou **deixar o zap correr** | Cartaz e placa no depósito; fila na porta quando o zap corre solto; a Diretora e o Kiko comentam |
| 4 | **Campus Sem Freio** | Falar com a Reitora, ler o alvará e regular grave, médio e agudo da mesa de som (níveis sempre no HUD, com som por canal), testar o som e decidir na portaria | **Autorizar a festa**, **negociar o horário** ou **ignorar a ordem** (só assembleia) | O estado do campus (festa ou expediente), a faixa e a portaria mudam; a Reitora e o estudante comentam |
| 5 | **Coletivizou Até a Chave** | Descobrir onde está a chave (Osvaldo e Rose; a ordem não importa e o segundo da conversa entrega a chave), pegar a caixa de ferramentas no armário e atender os três postos (elevador, muro, prensa) na ordem que quiser, examinando o defeito antes; checklist e destino por posto pendente | Pendurar a chave no gancho coletivo, **devolvê-la ao Vô Didi** ou **quebrá-la** | Elevador, muro e prensa mostram o conserto; o gancho da Associação muda; o Vô Didi comenta |
| 6 | **Brasil, Destino China** | Reunir o regulamento do frete (peso, destino e conteúdo, com 2 de 3 pistas), retirar a caixa, acertar as etiquetas (4 opções cada, o painel mostra quantas batem), levar ao despacho, religar o terminal se preciso e conferir o manifesto | **Despachar o Brasil**, **trocar a carga por cachaça** ou **sabotar a esteira** (as duas últimas exigem ter conferido o manifesto) | A carga no embarque, o rastreio no painel e o terminal (a sabotagem o para de verdade) |
| final | **Ditadura do Carimbo** | Falar com Seu Repassa e subir ao palanque do Monumento ao Áudio | Duas ações curtas na cerimônia (como proclamar, como pedir aplausos) | Coroa de carimbos no monumento, faixa, plateia, decreto e o Formulário de Discordância (só em 30 de fevereiro) na praça, mais falas dos moradores |

**A cerimônia final.** Depois do sexto selo, Seu Repassa convida o jogador ao palanque (indicado no HUD, no mapa e na rua com a estrela dourada; nada interrompe uma ação em andamento). O Lula caricato se declara "Presidente Vitalício Provisório, até segunda ordem emitida por ele mesmo": a declaração é sempre a mesma, e o resto depende do que foi decidido. Com maioria de decisões obedientes, a cidade cai numa obediência burocrática exagerada (o aplauso ganha senha e o Cartório rejeita o governante por falta de reconhecimento de firma). Com maioria de sabotagens, a proclamação acontece mas a cidade e as instituições a ignoram. Nas trajetórias mistas, o relatório combina a consequência específica de cada decisão. Depois dela, a cidade continua explorável (a praça fica marcada, moradores comentam o decreto) e a cerimônia pode ser revista no palanque sem duplicar nenhuma recompensa. O selo extra "Ditadura do Carimbo" fica fora dos seis do Passaporte. Tudo é ficção satírica: a caricatura é inventada e a sátira mira a burocracia e o autoritarismo, nunca fatos reais.

**Interface.** O cartão da missão destaca o objetivo da etapa; checklist, destino e item carregado ficam em detalhes recolhíveis (a preferência fica salva só no navegador; em tela estreita começam recolhidos) e os indicadores numéricos (níveis do som, etiquetas que batem) ficam sempre visíveis, com número além das marcas. O destino principal da missão é uma estrela dourada no mapa e na cidade (várias, quando há mais de um pendente); dentro dos prédios a estrela marca as interações ativas. O botão 🛂 abre o **Passaporte do Absurdo** com os selos, o que você decidiu em cada missão e o **diário de pistas**. As escolhas funcionam por mouse, toque e teclado (Tab, setas, 1 a 9, Enter, Esc para "Ainda não"); o foco vai para o painel ao abrir e volta ao fechar (mapa, passaporte, pausa, diálogos e escolhas). Em telas de toque, o diálogo fica acima do direcional no retrato e entre o direcional e o botão de ação na paisagem. Com `prefers-reduced-motion`, não há tremor de câmera, clarão, confete denso, balanço de marcadores nem animações SVG do mapa.

As missões são **dados** (`missoes/campanha.ts`); o motor (`missoes/motor.ts`) é puro e recebe eventos (`falou:<morador>`, `usou:<ponto>`, `lugar:<lugar>:<estado>`, `cerimonia:fim`), aplica efeitos (itens, flags, notas do diário, escolhas, lugares, sons) e devolve saídas; a cena (`game/city/Missoes.ts`) apenas emite eventos e mostra consequências. Cada etapa pode declarar `exige`/`volta` (se o save não tem o item exigido, volta à etapa certa), `alvos` contextuais, `lista` (checklist) e `painel` (indicadores). O progresso fica em `campanha` no save da cidade do Lula, indexado pelo **id** da etapa: recarregar retoma a etapa, saves do formato antigo (só índice) são migrados, itens que não existem mais ou incoerentes são corrigidos sem apagar missões nem selos, o item não duplica nem é entregue duas vezes, eventos fora de ordem são ignorados, lugares já alterados antes da missão não dão recompensa automática e missão concluída não volta a pendente. **Reiniciar este Brasil** limpa só a cidade do protagonista atual; o Brasil do Flávio usa outra chave e tem o próprio passaporte (o **Passaporte da Ordem**). Com `?debug=1`: `window.__pde.campanha()`, `iniciar("<missão>")`, `emite("usou:<ponto>")`, `escolhas()`, `escolhe("<id>")`, `baloes()`, `ctx()`, `npc("<id>")`, `npcsDentro()`, `cerimonia()` e `reverCerimonia()`.

### Como a cidade está organizada

| Arquivo | O que tem |
| --- | --- |
| `src/world/cidade/layout.ts` | Geometria: tamanho, limites, ruas e distritos |
| `src/world/cidade/distritos/*.ts` | Um arquivo por distrito: chão, prédios, objetos, lugares, estacionamentos, carros, moradores e paradas de cachaça |
| `src/world/cidade/interiores/index.ts` | Catálogo: cada prédio aponta para um modelo de interior e tem nome próprio |
| `src/world/cidade/interiores/modelos.ts` | Modelos (casa, conjunto, prefeitura, igreja, mercado, fábrica…): cômodos, paredes, móveis, interações e moradores |
| `src/world/cidade/interiores/detalhes.ts` | Detalhes por modelo (objetos e ações a mais depois da planta base) e as ações que mudam o estado de um lugar |
| `src/world/cidade/interiores/kits.ts`, `plan.ts` | Conjuntos de móveis reaproveitados e o montador (ids estáveis, sorteio determinístico, espelhamento) |
| `src/world/cidade/relogio.ts` | Hora do dia, períodos e escuridão da rua |
| `src/world/cidade/navegacao.ts` | Grade de caminhos a pé (A*) feita das colisões do jogo; prefere calçada e faixa ao asfalto |
| `src/world/cidade/rotinas.ts` | Agenda de cada morador (casa, ponto, almoço, bar) e as falas por atividade |
| `src/world/game/city/Rotinas.ts` | Faz os moradores cumprirem a agenda: andam, entram e saem dos prédios e aparecem nos interiores |
| `src/world/cidade/vida.ts` | Moradores genéricos (passeio, travessia, conversa, fila) e cores dos carros do trânsito |
| `src/world/cidade/ruas.ts` | Rede de ruas do trânsito: cruzamentos, trechos com faixa por sentido e curvas; sai dos retângulos de `ROADS` |
| `DistrictContent.decals` (em `distritos/*.ts`) | Detalhes pintados no chão (tapetes, degraus, setas de fila), desenhados por `CityScene.drawDecals`; todo prédio também ganha sombra de contato |
| `src/world/cidade/places.ts` | Estados persistentes dos lugares: igreja aberta/interditada, depósito vazio/abastecido, terminal em operação/parado, universidade normal/liberou geral |
| `src/world/cidade/progress.ts` | Progresso próprio da cidade (estados, lugares descobertos e destino), numa chave separada |
| `src/world/cidade/index.ts` | Junta os distritos e calcula colisões, portas e vagas |
| `src/world/game/city/CityScene.ts` | Cena da cidade: chão em blocos, câmera, carros, portas, estados, descoberta e destino |
| `src/world/game/city/interior.ts` | Monta um interior quando o jogador entra e destrói ao sair (só um existe por vez) |
| `src/world/game/city/interactions.ts` | Comportamentos das interações, reaproveitados por tipo |
| `src/world/game/city/traffic.ts` | Trânsito: escolha de rota, vez nos cruzamentos, frenagem, buzina, ultrapassagem e volume por hora |
| `src/world/game/city/cityArt.ts`, `interiorArt.ts` | Arte dos prédios, objetos de rua e móveis (SVG desenhado em código) |
| `src/world/game/city/culler.ts` | Só deixa visível o que está perto da câmera |
| `src/components/world/CityMap.tsx` | Mapa da cidade |
| `src/world/cidade/missoes/motor.ts`, `campanha.ts` | Motor puro da campanha (etapas, eventos, escolhas, itens, diário, recuperação de saves) e os dados das seis missões e do epílogo, falas por estado, selos e a tabela de decisões |
| `src/world/cidade/missoes/final.ts` | Roteiro puro da cerimônia final: apura as decisões, define o tom (obediência, decretos ignorados ou misto) e devolve os passos e as marcas da praça |
| `src/world/cidade/interiores/missoes.ts` | Interações, objetos e cartazes das missões dentro dos prédios |
| `src/world/game/city/Missoes.ts`, `Adornos.ts` | Gerente da campanha na cena (diálogos, escolhas, HUD, destinos, celebração, cerimônia) e as consequências desenhadas na rua (igreja, campus, depósito, embarque e a praça depois da cerimônia) |
| `src/world/cidade/caes.ts`, `game/city/Caes.ts`, `Bolas.ts`, `Garrafas.ts` | Cães e bolas (dados: nome, casa, pelagem) e o comportamento deles na cena; caixotes de cachaça, garrafa na mão e garrafa jogada |
| `src/components/world/Passaporte.tsx`, `useModal.ts` | Selos, Passaporte (com decisões e diário), cartão de selo, diálogo com **Pular** e escolhas; foco preso e devolvido nos painéis |
| `src/world/cidade/definicao.ts`, `ativa.ts`, `lula.ts` | O formato de uma cidade (`CidadeDef`) e a cidade do Lula; `ativaCidade(hero)` troca a cidade ativa (as exportações de `index.ts` passam a apontar para ela) antes de a cena abrir |
| `src/world/cidade/flavio/` | O Brasil do Flávio inteiro: layout, distritos, catálogo de interiores, `textos.ts` (tradução das falas dos interiores para este universo), moradores, cães, lugares, campanha, cerimônia e interiores de missão |
| `src/world/cidade/interiores/modelosFlavio.ts` | Interiores que só existem no Flávio: Posto de Saúde Premium, Casa de Leilões e Tribunal Eleitoral do Cofre |
| `src/world/game/city/flavio/`, `temas.ts` | Bordas e lugares desenhados do Flávio, a motociata, as consequências na rua e os textos de cena de cada universo |

Cada prédio, interior, cômodo, parede, objeto, interação, lugar, morador, carro e estacionamento tem um id estável. Os campos `hooks` (missões e personagens futuros), `place` (estado persistente) e `interior` (porta) são onde as próximas histórias se conectam, sem redesenhar o mapa. Objetos, interações, cartazes e moradores de interior podem depender de um estado (`when`): o depósito de kits fica vazio quando o lugar muda para "vazio", o corredor da universidade perde as barracas no "expediente normal" e a igreja troca castiçais, cartazes e pastor entre "interditada" e "aberta". Uma interação com `setPlace` (tipo `decreto`) muda o estado de um lugar: salva o progresso, redesenha a rua e refaz o interior onde o jogador está. `check:city` confere que todo estado citado existe e que quem muda um lugar tem a interação de volta em cada estado. Com `?debug=1`, `window.__pde.setPlace("igreja-matriz", "aberta")` muda um estado na hora e `window.__pde.enter("com-padaria")` entra direto num prédio.

`pnpm check:city` confere ids, prédios dentro dos distritos e fora das ruas, portas sem objetos na frente e a rede de ruas do trânsito (conectada, sem becos, faixas e curvas sobre o asfalto e longe de prédios e objetos). Para cada uma das 46 edificações, confere que há interior ligado ao prédio certo, entrada livre, saída junto à parede de baixo, pelo menos duas interações e acesso a todos os cômodos, interações, moradores e balcões de cachaça (também com os estados alternativos dos lugares). Por busca em grade, testa se dá para chegar a pé a todas as portas, lugares, moradores e paradas de cachaça, e de carro a todos os estacionamentos e veículos.

### Controles

| | Computador | Celular |
| --- | --- | --- |
| Andar | WASD ou setas | Direcional virtual |
| Correr | Shift | Empurrar o direcional até a borda |
| Interagir (entrar, sair, sentar, ligar, abrir, falar, beber…) | E ou Enter | Botão de ação (mostra a ação) |
| Levantar | Qualquer direção | Direcional |
| Mapa da cidade | M (Esc fecha) | Botão 🗺️ |
| Carro ou moto | W/↑ acelera, S/↓ freia e dá ré, A/D ←/→ vira, Espaço freio de mão, H buzina | Aponte o direcional para onde quer ir; segure **Ré** para voltar; **Bi-bi** (ou **Fom-fom**, na moto) buzina |
| Tiro pro alto (Flávio, na rua) | F | Botão **Pro alto** |

O menu (☰) pausa o mundo e tem **Reiniciar este Brasil**, que apaga apenas o progresso do protagonista atual, e **Trocar personagem**.

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
| `src/world/mission.ts` | Mundo do bairro: o Chicote Expresso do Flávio e as quatro missões antigas do Lula (a campanha da cidade do Lula fica em `src/world/cidade/missoes/`) |
| `src/world/game/LulaWorld.ts`, `lulaArt.ts` | Identidade do Brasil do Lula, consequências persistentes e objetos |
| `src/world/stamina.ts`, `save.ts` | Energia de corrida e progresso separado por protagonista |
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

## O Brasil do Flávio (cidade própria)

Outro Brasil fictício e absurdo, agora com o Flávio caricato governando. É uma cidade nova, com mapa próprio de 4800 × 3600 px: serra com letreiro ao norte, rio a oeste, mata a leste e o mar ao sul, onde o navio "Destino: EUA · Carga: o Brasil" espera no cais. O motor é o mesmo da cidade do Lula (trânsito, rotinas, interiores, campanha, mapa); os dados ficam em `src/world/cidade/flavio/`.

| Distrito | O que tem |
| --- | --- |
| **Esplanada da Ordem** (cívico) | Praça do Desfile com o palanque e a estátua "À Motociata, eterna e barulhenta", Palácio da Ordem, Ministério da Ordem Comunicacional, Cartório das Autorizações, Tribunal Eleitoral do Cofre, Gabinete do Desmentido e Secretaria de Privatização |
| **Condomínio Pátria Amada** (residencial) | Casas atrás de cancela, administração, Edifício Patriota, Motoclube Pátria Sobre Rodas e a pracinha com catraca |
| **Colégio Cívico-Militar** (educacional) | Colégio, Cantina do Rancho, Faculdade de Ordem Unida, Biblioteca dos Livros Aprovados e República dos Cadetes |
| **Livre Mercado** (comercial) | Posto de Saúde Premium com catraca e camarote VIP, farmácia, banco, shopping, lotérica, padaria, supermercado, choperia, pastelaria e a feira da Rua do Pedágio |
| **Distrito do Chicote** (industrial) | Fábrica Feliz, Galpão das Metas, Selaria do Zeca, RH do calendário sem dezembro, almoxarifado, galpões terceirizados, oficina e borracharia |
| **Porto Brasil–EUA** | Casa de Leilões da Pátria, Alfândega do Made In, Imobiliária Floresta Inteira, a reserva nacional "aluga-se", armazéns, Controle de Embarque, esteira, guindaste e cais |

**Números:** 20 ruas, 54 edificações, todas com interior (137 cômodos, mais de 380 interações), 41 moradores com rotina diária, 17 cães com nome (Coturno, Crachá, Cancela, Boleto…), 3 bolas e 15 veículos estacionados, motos incluídas. Os interiores reaproveitam as plantas da cidade do Lula com as falas traduzidas para este universo (`flavio/textos.ts`; o `check:city` reprova fala do Lula com marca daquele universo que ficou sem tradução). Posto, Casa de Leilões e Tribunal têm plantas próprias.

**Motociata no lugar da cachaça.** Não há barra de energia: a corrida é livre. Subir numa das motos estacionadas (motoclube, Esplanada, shopping, porto) chama a motociata, que segue o rastro do jogador; na moto, a buzina é **Fom-fom**.

**Tiro pro alto.** Na rua, F (ou o botão **Pro alto**) dispara um tiro de desenho animado: "POW!", clarão, pombos fugindo, moradores tapando o ouvido e cães correndo. É sempre para cima, nunca mira em ninguém e não acerta nada. Dentro dos prédios não funciona (o Flávio caricato faz uma piada).

**Campanha: seis missões e a Eleição no Cofre.** Mesmo motor e mesmas regras da campanha do Lula: uma missão ativa por vez, começando pelo @PatriotaRaiz.Oficial na Praça do Desfile, toda escolha concede o selo e muda algo visível, e todo erro é recuperável.

| # | Missão | O que se faz | Escolhas (todas concedem o selo) | O que muda no mundo |
| --- | --- | --- | --- | --- |
| 1 | **Chicote Expresso** | Falar com Seu Durval e ler o quadro de metas da Fábrica Feliz, buscar o chicote na Selaria do Zeca e decidir na porta da fábrica | **Entregar o chicote de couro**, **trocar por vale-refeição** ou **um chicote de alcaçuz** (só depois de ouvir o Zeca: a ordem não diz de quê) | Placa na porta da fábrica, chicote pendurado de enfeite, cartazes dentro; Durval, Zeca e o @PatriotaRaiz comentam |
| 2 | **Dezembro Realocado** | Ouvir a Dona Rosângela e ler o calendário oficial no RH, acertar o relógio de ponto no dia e na hora da placa lá fora (terça, 3h; "terça, 15h" é pegadinha) e bater o ponto | **Aceitar o calendário sem dezembro**, **devolver dezembro à caneta** ou **parcelar o 13º em doze novembros** | Calendário com dezembro na parede, cartaz e placa no RH, fila na porta quando o calendário fica sem dezembro; o Tonhão comenta |
| 3 | **SUS com Catraca** | Falar com a Recepcionista Premium e ler o regulamento no consultório do posto | **Cobrar os cinco reais da Vó Zuleica**, **liberar a catraca para todos** ou **usar o artigo 2º** (idoso não paga) | O estado da catraca (fachada e interior), cartazes e a fila comum na calçada; Zuleica e a recepcionista reagem |
| 4 | **Leilão da Petrobras** | Conferir o lote 1 (um barril, usado), o rodapé da planilha de arremates e o leiloeiro (bastam 2 de 3) e decidir no púlpito | **Vender ao pinguim por um peixe**, **cancelar e devolver o barril** ou **não dar lance** (o lote volta ao patrimônio) | Quadro do resultado no salão e placa na porta; Leila Farah e o leiloeiro comentam |
| 5 | **Urna com Autorização** | No cartório, ouvir a atendente (a autorização pede a certidão de voto, que pede a autorização) e o Mesário Anderson (o regimento antigo) | **Emitir a autorização em três vias**, **rasgar a exigência** ou **usar o título de eleitor** | Cartaz, placa e fila na porta quando a autorização sai em três vias; a Prima Kelly e o mesário comentam |
| 6 | **Brasil, Destino EUA** | Retirar a caixa do Brasil (com laço) no Armazém 1, declarar na Alfândega, conferir o manifesto e levar à esteira do cais com o terminal em operação | **Embarcar com laço**, **devolver ao armazém** ou **embarcar só a caixa vazia** | Caixa e placa no cais, rastreio no Controle de Embarque; Robson e o @PatriotaRaiz comentam |
| final | **Eleição no Cofre** | Conferir a urna oficial na Sala do Cofre do Tribunal e subir ao palanque da Praça do Desfile | Duas ações curtas: como anunciar (da moto, lendo com o hino ou com um tiro pro alto) e o que fazer quando a praça quer votar | Faixa sobre o palanque, cadeado na Moto da Pátria, plateia, decreto e "senha do cofre: solicite no cofre"; falas da cidade |

**A cerimônia final.** O anúncio é sempre o mesmo: a eleição está garantida e guardada no cofre, até segunda ordem emitida pelo próprio presidente, e a senha fica com ele. O resto depende das decisões: com maioria obediente, a praça aplaude em fila por ordem de crachá; com maioria rebelde, a cidade vai para a feira e ignora o cofre; nas trajetórias mistas, o relatório junta a consequência de cada decisão. O selo extra "Eleição no Cofre" fica fora dos seis do **Passaporte da Ordem**, e a cerimônia pode ser revista no palanque sem duplicar recompensa.

O progresso fica numa chave própria (`panico-de-estado:cidade-flavio:v1`); "Reiniciar este Brasil" no Flávio não toca na cidade do Lula. Tudo é ficção satírica: a sátira mira a burocracia, o autoritarismo imaginado e quem vende medo, nunca quem trabalha, quem vota, quem compra ou alguma nacionalidade.

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
pnpm check:city      # as duas cidades: ids, distritos, colisões, acessos a pé e de carro, campanha e traduções
pnpm check:world     # progressão, ações fora de ordem, compatibilidade dos saves e energia
pnpm check:campanha  # campanha do Lula: motor, todas as decisões, escolhas, recuperação de saves, cerimônia final
pnpm check:campanha-flavio  # campanha do Flávio: as seis missões com cada decisão, relógio, catraca, terminal, Eleição no Cofre
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
