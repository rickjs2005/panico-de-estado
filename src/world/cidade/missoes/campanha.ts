import type { Campanha, Cond, Efeito, EtapaDef, FalaPorEstado, MissaoDef, Opcao, Regra } from "./motor";

/**
 * Campanha da cidade do Lula: seis missões, em ordem, uma ativa por vez, mais a cerimônia final.
 * Tudo aqui é dado (textos, etapas, regras de evento, escolhas, pontos de interação). Quem executa é o
 * motor (`motor.ts`) e a cena. Os ids de prédios, lugares e moradores são os da cidade atual.
 *
 * Convenção dos eventos: "falou:<id do morador>", "usou:<id do ponto>", "lugar:<lugar>:<estado>" (quando
 * uma ação muda o estado de um lugar) e "cerimonia:fim". As flags de cada missão começam com o id dela;
 * as decisões ficam em `d.<missão>` e sobrevivem à missão (a cerimônia final lê todas).
 */

const nenhum: Cond = { item: "" };
const com = (item: string): Cond => ({ item });
const tem = (flag: string): Cond => ({ flag });
const vale = (flag: string, igual: string | number | boolean): Cond => ({ flag, igual });
const min = (flag: string, n: number): Cond => ({ flag, min: n });
const nao = (c: Cond): Cond => ({ nao: c });
const no = (lugar: string, estado: string): Cond => ({ lugar, estado });

const nota = (id: string, texto: string): Efeito => ({ nota: id, texto });
const decide = (missao: string, valor: string): Efeito => ({ flag: `d.${missao}`, valor });

// ------------------------------------------------------------------ 1 · Protocolo do Áudio

const aviso = (n: number, texto: string, anota: string, avanca: boolean): Regra => ({
  evento: `usou:aviso-${n}`,
  faz: [
    { marca: `protocolo.a${n}`, conta: "protocolo.avisos" },
    { marca: `protocolo.p${n}`, conta: "protocolo.pistas" },
    nota(`aviso-${n}`, `Aviso ${n} da praça: ${anota}`),
    { ler: `AVISO ${n}: ${texto}` },
    ...(avanca ? [{ se: [min("protocolo.pistas", 2)], entao: [{ avancar: true } as Efeito] } as Efeito] : []),
  ],
});

const nilza = (avanca: boolean): Regra => ({
  evento: "falou:nilza",
  faz: [
    { marca: "protocolo.pnilza", conta: "protocolo.pistas" },
    { dialogo: ["Formulário? O azul, querido. Foi o que a minha comadre usou em 1994.", "O amarelo é para quem tem pressa, e ninguém tem pressa em trezentos anos úteis."], quem: "Tia Nilza" },
    nota("nilza", "Tia Nilza jura que é o azul. Ela erra com muita convicção."),
    ...(avanca ? [{ se: [min("protocolo.pistas", 2)], entao: [{ avancar: true } as Efeito] } as Efeito] : []),
  ],
});

const negado = (cor: string, motivo: string): Opcao => ({
  id: cor,
  rotulo: `Entregar o formulário ${cor}`,
  faz: [{ soma: "protocolo.erros" }, { som: "erro" }, { dialogo: [`CARIMBO NEGADO: ${motivo}`, "A atendente devolve o papel com um sorriso de quem ama devolver papel."], quem: "Dona Protocolo" }, nota(`form-${cor}`, `Formulário ${cor}: negado (${motivo}).`)],
});

const PROTOCOLO: MissaoDef = {
  id: "protocolo",
  numero: 1,
  titulo: "Protocolo do Áudio",
  local: "Centro Cívico",
  inicio: {
    npc: "boato",
    quem: "Seu Repassa, na praça",
    alvo: { x: 2330, y: 1060, label: "Seu Repassa" },
    dialogo: [
      "Seu Repassa: Montaram um governo inteiro com áudios do grupo da família.",
      "Falta a credencial presidencial. Ela só sai na Repartição de Carimbos, com o formulário que estiver valendo hoje.",
      "Qual está valendo? Os avisos da praça dizem. Os avisos e as comadres. Os dois não costumam combinar.",
    ],
  },
  etapas: [
    {
      id: "falar",
      objetivo: "Fale com Seu Repassa, na praça.",
      alvo: { x: 2330, y: 1060, label: "Seu Repassa" },
      regras: [{ evento: "falou:boato", faz: [{ avancar: true }] }],
    },
    {
      id: "avisos",
      objetivo: "Descubra qual formulário vale hoje: avisos da praça e moradores ({protocolo.pistas}/2 pistas para decidir).",
      alvo: { x: 2400, y: 1070, label: "Avisos da praça" },
      alvos: [
        { se: [nao(tem("protocolo.p1"))], alvo: { x: 2250, y: 1040, label: "Aviso 1" } },
        { se: [nao(tem("protocolo.p2"))], alvo: { x: 2560, y: 1040, label: "Aviso 2" } },
        { se: [nao(tem("protocolo.pnilza"))], alvo: { x: 2116, y: 776, label: "Tia Nilza" } },
      ],
      regras: [
        aviso(1, "o protocolo vigente é o formulário da cor da gema do ovo.", "o vigente é o da cor de gema.", true),
        aviso(2, "o formulário azul foi revogado ontem, mas ainda é distribuído.", "azul foi revogado (mas ainda distribuem).", true),
        aviso(3, "o formulário verde só vale em ano bissexto. Este ano não é.", "verde só vale em ano bissexto (este não é).", true),
        nilza(true),
      ],
    },
    {
      id: "carimbar",
      objetivo: "Entregue o formulário que vale no guichê da Repartição de Carimbos. Dá para reler os avisos a qualquer hora.",
      alvo: { predio: "civ-reparticao", label: "Repartição de Carimbos" },
      regras: [
        aviso(1, "o protocolo vigente é o formulário da cor da gema do ovo.", "o vigente é o da cor de gema.", false),
        aviso(2, "o formulário azul foi revogado ontem, mas ainda é distribuído.", "azul foi revogado (mas ainda distribuem).", false),
        aviso(3, "o formulário verde só vale em ano bissexto. Este ano não é.", "verde só vale em ano bissexto (este não é).", false),
        nilza(false),
        {
          evento: "falou:atendente",
          faz: [
            { dialogo: ["Formulário revogado não passa. Formulário errado também não.", "Mas, se dois avisos da praça se contradisserem, eu aceito um recurso. É lei. Acabei de inventar, mas é lei."], quem: "Dona Protocolo" },
            nota("recurso", "Dona Protocolo aceita recurso quando os avisos da praça se contradizem."),
          ],
        },
        {
          evento: "usou:guiche",
          faz: [
            {
              escolha: {
                titulo: "Qual formulário você entrega no guichê?",
                quem: "Dona Protocolo",
                opcoes: [
                  {
                    id: "amarelo",
                    rotulo: "Entregar o formulário amarelo (cor de gema)",
                    faz: [
                      decide("protocolo", "carimbo"),
                      { som: "acerto" },
                      { dialogo: ["Amarelo, cor de gema, vigente desde ontem. CARIMBADO.", "A credencial sai no mesmo dia. Pelos padrões daqui, isso é um milagre."], quem: "Dona Protocolo" },
                      nota("credencial", "Credencial presidencial carimbada no formulário amarelo."),
                      { concluir: true },
                    ],
                  },
                  negado("azul", "revogado ontem, rasgado e arquivado"),
                  negado("verde", "este ano não é bissexto"),
                  {
                    id: "recurso",
                    rotulo: "Contestar a contradição entre os avisos",
                    faz: [
                      {
                        se: [min("protocolo.avisos", 2)],
                        entao: [
                          decide("protocolo", "recurso"),
                          { som: "acerto" },
                          { dialogo: ["Dois avisos que se contradizem? Isso é um vício de origem. RECURSO DEFERIDO.", "A credencial sai por contestação, que é o jeito mais respeitado de não ter formulário."], quem: "Dona Protocolo" },
                          nota("credencial", "Credencial presidencial conseguida por recurso, sem carimbar formulário."),
                          { concluir: true },
                        ],
                        senao: [{ som: "erro" }, { ler: "Contradição? Preciso ter lido pelo menos dois avisos da praça para contestar." }],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "aviso-1", etapas: ["avisos", "carimbar"], fora: { x: 2250, y: 1040, label: "Ler o aviso 1" } },
    { id: "aviso-2", etapas: ["avisos", "carimbar"], fora: { x: 2560, y: 1040, label: "Ler o aviso 2" } },
    { id: "aviso-3", etapas: ["avisos", "carimbar"], fora: { x: 2400, y: 1100, label: "Ler o aviso 3" } },
    { id: "guiche", etapas: ["carimbar"] },
  ],
  conclusao: ["Credencial presidencial na mão! O governo dos áudios agora tem papel passado.", "Seu Repassa vai reconhecer o documento. Passe lá quando quiser."],
  selo: { id: "credencial", nome: "Credencial Presidencial", cor: "#c62835", icone: "🪪" },
};

// ------------------------------------------------------------------ 2 · Operação Cadeado: Segunda Via

const CADEADO: MissaoDef = {
  id: "cadeado",
  numero: 2,
  titulo: "Operação Cadeado: Segunda Via",
  local: "Igreja Matriz e Largo da Feira",
  inicio: {
    npc: "boato",
    quem: "Seu Repassa, na praça",
    alvo: { x: 2330, y: 1060, label: "Seu Repassa" },
    dialogo: [
      "Seu Repassa: Chegou um áudio de 3 minutos mandando interditar a Igreja Matriz.",
      "O cadeado é maior que a porta. Confere a porta e fala com o pastor.",
      "Quem guarda o cadeado grande é o Tião, no bar do Largo da Feira. O que fazer com ele, aí é com você.",
    ],
  },
  etapas: [
    {
      id: "inspecionar",
      objetivo: "Inspecione a porta da igreja e fale com o Pastor Josué ({cadeado.n}/2).",
      alvo: { x: 1840, y: 1150, label: "Porta da Igreja Matriz" },
      alvos: [
        { se: [nao(tem("cadeado.porta"))], alvo: { x: 1840, y: 1150, label: "Porta da Igreja Matriz" } },
        { se: [nao(tem("cadeado.pastor"))], alvo: { x: 1905, y: 1150, label: "Pastor Josué" } },
      ],
      regras: [
        {
          evento: "usou:porta-igreja",
          faz: [
            { marca: "cadeado.porta", conta: "cadeado.n" },
            nota("porta-pequena", "A porta da igreja é pequena e o cadeado do decreto é do tamanho de um fusca."),
            { ler: "A porta é pequena. O cadeado do decreto é do tamanho de um fusca." },
            { se: [min("cadeado.n", 2)], entao: [{ avancar: true }] },
          ],
        },
        {
          evento: "falou:pastor",
          faz: [
            { marca: "cadeado.pastor", conta: "cadeado.n" },
            { dialogo: ["Interditar de novo? A porta já dorme de tanto cadeado.", "Se é pra cumprir o áudio, o Tião guarda o cadeado grande. O decreto só fala da porta da frente, reparou?"], quem: "Pastor Josué" },
            nota("pastor-lateral", "Pastor Josué: o decreto só fala da porta da frente."),
            { se: [min("cadeado.n", 2)], entao: [{ avancar: true }] },
          ],
        },
      ],
    },
    {
      id: "retirar",
      objetivo: "Pegue o cadeado grande com o Tião, no Bar do Largo da Feira. O freguês fiel sempre sabe de alguma coisa.",
      alvo: { predio: "com-bar-tiao", label: "Bar do Tião" },
      regras: [
        {
          evento: "falou:fregues",
          faz: [
            { marca: "cadeado.brecha" },
            { dialogo: ["Interditaram a igreja? Pela frente, né? Eu entro pela lateral desde 1998.", "O decreto numerou todas as portas, menos a lateral. Esqueceram de numerar."], quem: "Freguês fiel" },
            nota("brecha", "Freguês do bar: o decreto não numerou a porta lateral da igreja. Dá para usar isso."),
          ],
        },
        {
          evento: "usou:cadeado-tiao",
          se: [nenhum],
          faz: [{ pegar: "cadeado" }, { dialogo: ["O cadeado é enorme, mas só pesa no papel.", "Leva pra igreja. De carro cabe no banco de trás. Se quiser, pendura onde bem entender."], quem: "Tião" }, nota("cadeado-tiao", "Peguei o cadeado grande do Tião."), { avancar: true }],
        },
      ],
    },
    {
      id: "instalar",
      objetivo: "Leve o cadeado à porta da Igreja Matriz e decida o que fazer com ele (de carro cabe).",
      alvo: { predio: "civ-igreja-matriz", label: "Igreja Matriz" },
      exige: [com("cadeado")],
      volta: "retirar",
      regras: [
        {
          evento: "falou:fregues",
          faz: [{ marca: "cadeado.brecha" }, { dialogo: ["Pela lateral eu entro desde 1998. O decreto esqueceu de numerar aquela porta."], quem: "Freguês fiel" }, nota("brecha", "Freguês do bar: o decreto não numerou a porta lateral da igreja. Dá para usar isso.")],
        },
        {
          evento: "usou:instalar-cadeado",
          se: [com("cadeado")],
          faz: [
            {
              escolha: {
                titulo: "O cadeado grande está na sua mão. O que fazer na porta da igreja?",
                opcoes: [
                  {
                    id: "cumprir",
                    rotulo: "Cumprir a ordem: instalar o cadeado grande",
                    faz: [
                      decide("cadeado", "cumpriu"),
                      { soltar: true },
                      {
                        se: [no("igreja-matriz", "aberta")],
                        entao: [{ lugar: ["igreja-matriz", "interditada"] }, { ler: "Cadeado instalado: a igreja está interditada." }],
                        senao: [{ ler: "A igreja já estava interditada: lavrei a segunda via do cadeado." }],
                      },
                      nota("cadeado-fim", "Instalei o cadeado grande, conforme o áudio."),
                      { concluir: true },
                    ],
                  },
                  {
                    id: "sabotar",
                    rotulo: "Sabotar: trocar por um cadeado de papelão pintado",
                    faz: [
                      decide("cadeado", "sabotou"),
                      { soltar: true },
                      { se: [no("igreja-matriz", "interditada")], entao: [{ lugar: ["igreja-matriz", "aberta"] }] },
                      { ler: "Pendurei um cadeado de papelão com tinta dourada. De longe, ninguém percebe." },
                      nota("cadeado-fim", "Troquei o cadeado por um de papelão pintado."),
                      { concluir: true },
                    ],
                  },
                  {
                    id: "brecha",
                    rotulo: "Usar a brecha: cadeado na frente, porta lateral regulamentada",
                    se: [tem("cadeado.brecha")],
                    faz: [
                      decide("cadeado", "brecha"),
                      { soltar: true },
                      { se: [no("igreja-matriz", "aberta")], entao: [{ lugar: ["igreja-matriz", "interditada"] }] },
                      { ler: "Cadeado na porta da frente, tudo dentro do decreto. A lateral segue livre, e legal." },
                      nota("cadeado-fim", "Cadeado na frente e porta lateral regulamentada: obedeci à letra do decreto."),
                      { concluir: true },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "porta-igreja", etapas: ["inspecionar"], fora: { x: 1840, y: 1150, label: "Inspecionar a porta da igreja" } },
    { id: "cadeado-tiao", etapas: ["retirar"], se: [nenhum] },
    { id: "instalar-cadeado", etapas: ["instalar"], se: [com("cadeado")], fora: { x: 1840, y: 1150, label: "Decidir o que fazer com o cadeado" } },
  ],
  conclusao: ["Operação encerrada: a porta da igreja já mostra o que foi decidido.", "Seu Repassa: “Em burocracia, quem assina por último manda.”"],
  selo: { id: "cadeado-presidencial", nome: "Cadeado Presidencial", cor: "#d9a520", icone: "🔒" },
};

// ------------------------------------------------------------------ 3 · Kit Gay do Zap: Carga Extraviada

const CAIXAS = {
  a: { etiqueta: "PARA: BORRACHARIA 24H", romaneio: "40 câmaras de ar para bicicleta coletiva", erro: "Quarenta câmaras de ar enchem sozinhas e a loja vira piscina de bolinhas. Seu Kiko fecha a tampa com o joelho." },
  b: { etiqueta: "PARA: ACADEMIA DO POVO (HALTERES FRÁGEIS)", romaneio: "300 lápis de cor, 120 colas, 1 cartilha", erro: "" },
  c: { etiqueta: "PARA: ESCOLA ESTADUAL PODE REPASSAR", romaneio: "12 sacos de cimento (para o muro do vizinho)", erro: "O saco rasga e o mercadinho vira obra. Seu Kiko pede para eu não contar ao vizinho." },
} as const;

const caixa = (l: "a" | "b" | "c"): Regra => ({
  evento: `usou:caixa-${l}`,
  faz: [
    { marca: `zap.${l}`, conta: "zap.n" },
    nota(`caixa-${l}`, `Caixa ${l.toUpperCase()}: etiqueta "${CAIXAS[l].etiqueta}", romaneio: ${CAIXAS[l].romaneio}.`),
    { ler: `CAIXA ${l.toUpperCase()}. Etiqueta: “${CAIXAS[l].etiqueta}”. Romaneio: ${CAIXAS[l].romaneio}.` },
  ],
});

const levar = (l: "a" | "b" | "c"): Regra => ({
  evento: `usou:levar-${l}`,
  se: [nenhum],
  faz:
    l === "b"
      ? [{ pegar: "caixa-zap" }, nota("levar-b", "Levei a caixa B: o romaneio é de material escolar."), { ler: "Essa é a da escola! O romaneio manda, não a etiqueta. Vou levar ao Depósito de Kits (dá para ir de carro)." }, { avancar: true }]
      : [{ soma: "zap.erros" }, { som: "erro" }, { dialogo: [CAIXAS[l].erro, "Nada se perde: a caixa volta para o estoque."], quem: "Seu Kiko" }, nota(`erro-${l}`, `Abri a caixa ${l.toUpperCase()} sem conferir o romaneio: ${CAIXAS[l].romaneio}.`)],
});

const ZAP: MissaoDef = {
  id: "zap",
  numero: 3,
  titulo: "Kit Gay do Zap: Carga Extraviada",
  local: "Largo da Feira e Cidade Universitária",
  inicio: {
    npc: "kiko",
    quem: "Seu Kiko, no Mercadinho",
    alvo: { predio: "com-mercadinho", label: "Seu Kiko, no Mercadinho" },
    dialogo: [
      "Seu Kiko: Chegou uma carga com as etiquetas trocadas, e o zap já espalhou que é outra coisa.",
      "A escola encomendou lápis de cor, cola e cartilha. A caixa deles está no estoque, junto com duas que não são.",
      "Confere a etiqueta e o romaneio. O romaneio não mente. Se errar a caixa, a gente ri e tenta de novo.",
    ],
  },
  etapas: [
    {
      id: "etiquetas",
      objetivo: "Descubra qual caixa é da escola (lápis, cola e cartilha): leia etiqueta e romaneio ({zap.n}/3 lidas) e carregue a certa.",
      alvo: { predio: "com-mercadinho", label: "Estoque do Mercadinho" },
      regras: [caixa("a"), caixa("b"), caixa("c"), levar("a"), levar("b"), levar("c")],
    },
    {
      id: "entregar",
      objetivo: "Entregue a caixa no Depósito de Kits, na Cidade Universitária.",
      alvo: { predio: "edu-deposito", label: "Depósito de Kits" },
      exige: [com("caixa-zap")],
      volta: "etiquetas",
      regras: [
        {
          evento: "usou:entregar-zap",
          se: [com("caixa-zap")],
          faz: [
            { soltar: true },
            { marca: "zap.entregue" },
            { se: [no("deposito-kits", "vazio")], entao: [{ lugar: ["deposito-kits", "abastecido"] }] },
            {
              dialogo: [
                "Abri a caixa na frente de todos. Lápis de cor, cola e uma cartilha. É só isso.",
                "Só que o zap já espalhou que isto é um “kit” de propaganda. E agora tem fila de gente querendo ver o tal kit.",
                "O que fazemos com os kits? A decisão é sua, presidente. Use o mural do depósito.",
              ],
              quem: "Diretora Clarice",
            },
            nota("zap-romaneio", "A caixa B tinha lápis de cor, cola e cartilha. O zap inventou o resto."),
            { avancar: true },
          ],
        },
      ],
    },
    {
      id: "distribuir",
      objetivo: "Decida o destino dos kits no mural do Depósito de Kits.",
      alvo: { predio: "edu-deposito", label: "Mural do Depósito de Kits" },
      regras: [
        {
          evento: "usou:decidir-zap",
          faz: [
            {
              escolha: {
                titulo: "O zap diz uma coisa e o romaneio diz outra. O que fazer com os kits?",
                quem: "Diretora Clarice",
                opcoes: [
                  {
                    id: "lacrado",
                    rotulo: "Distribuir lacrados, como o áudio manda (ninguém abre)",
                    faz: [decide("zap", "lacrado"), { se: [no("deposito-kits", "abastecido")], entao: [{ lugar: ["deposito-kits", "vazio"] }] }, { ler: "Kits lacrados saíram para as escolas. Ninguém sabe o que tem dentro, e o governo gosta assim." }, nota("zap-fim", "Distribuí os kits lacrados, como o áudio mandou."), { concluir: true }],
                  },
                  {
                    id: "desmentiu",
                    rotulo: "Abrir a caixa e afixar o romaneio na parede",
                    faz: [decide("zap", "desmentiu"), { se: [no("deposito-kits", "abastecido")], entao: [{ lugar: ["deposito-kits", "vazio"] }] }, { ler: "O romaneio está na parede, em letras grandes: lápis, cola e cartilha. O zap perdeu a graça." }, nota("zap-fim", "Afixei o romaneio na parede e desmenti o zap."), { concluir: true }],
                  },
                  {
                    id: "boato",
                    rotulo: "Deixar o zap correr: rotular a caixa com o nome que inventaram",
                    faz: [decide("zap", "boato"), { ler: "A caixa agora tem uma etiqueta enorme com o nome que o zap inventou. A fila dobrou o quarteirão." }, nota("zap-fim", "Rotulei a caixa com o nome que o zap inventou, para ver o que acontecia."), { concluir: true }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "caixa-a", etapas: ["etiquetas"] },
    { id: "caixa-b", etapas: ["etiquetas"] },
    { id: "caixa-c", etapas: ["etiquetas"] },
    { id: "levar-a", etapas: ["etiquetas"], se: [nenhum] },
    { id: "levar-b", etapas: ["etiquetas"], se: [nenhum] },
    { id: "levar-c", etapas: ["etiquetas"], se: [nenhum] },
    { id: "entregar-zap", etapas: ["entregar"], se: [com("caixa-zap")] },
    { id: "decidir-zap", etapas: ["distribuir"] },
  ],
  conclusao: ["Kits resolvidos: a escola tem lápis de cor e o zap tem assunto novo.", "A Diretora carimbou o recibo. Em dobro, por garantia."],
  selo: { id: "entrega-do-zap", nome: "Entrega do Zap", cor: "#6746a0", icone: "📦" },
};

// ------------------------------------------------------------------ 4 · Campus Sem Freio

/** Alvará sonoro do DCE: o quadro da parede diz os níveis (0 a 2). */
const SOM = { grave: 2, medio: 0, agudo: 1 };
const CANAIS = ["grave", "medio", "agudo"] as const;
const ROTULO = { grave: "Grave", medio: "Médio", agudo: "Agudo" };

const ajuste = (nome: (typeof CANAIS)[number]): Regra => ({
  evento: `usou:som-${nome}`,
  faz: [{ cicla: `campus.${nome}`, max: 3 }, { som: `${nome}:{campus.${nome}}` }, { ler: `${ROTULO[nome]} no nível {campus.${nome}}.` }],
});

const CAMPUS: MissaoDef = {
  id: "campus",
  numero: 4,
  titulo: "Campus Sem Freio",
  local: "Cidade Universitária",
  inicio: {
    npc: "reitora",
    quem: "a Reitora Vera",
    alvo: { x: 3740, y: 655, label: "Reitora Vera" },
    dialogo: [
      "Reitora Vera: A assembleia virou festa, a festa virou assembleia, e nenhuma tem autorização.",
      "O alvará sonoro está pendurado no DCE. Se o som bater com o alvará, a vizinhança deixa a gente em paz.",
      "Depois, a decisão é sua: o que fazemos com o campus? A portaria da Reitoria espera.",
    ],
  },
  etapas: [
    {
      id: "reitora",
      objetivo: "Converse com a Reitora Vera.",
      alvo: { x: 3740, y: 655, label: "Reitora Vera" },
      regras: [{ evento: "falou:reitora", faz: [{ avancar: true }] }],
    },
    {
      id: "som",
      objetivo: "Regule o som do DCE para bater com o alvará da parede e faça o teste de som.",
      alvo: { predio: "edu-universidade", label: "DCE, na Universidade do Pânico" },
      painel: CANAIS.map((c) => ({ rotulo: ROTULO[c], flag: `campus.${c}`, max: 2 })),
      regras: [
        ...CANAIS.map(ajuste),
        {
          evento: "falou:estudante",
          faz: [
            { dialogo: ["O alvará sonoro está colado na parede do DCE, do lado das caixas.", "Mas cuidado: o médio estava ligado no talo, e a vizinha do 4º andar anota tudo."], quem: "Estudante do DCE" },
            nota("estudante-dce", "Estudante do DCE: o alvará sonoro está na parede do DCE; a vizinha do 4º andar anota tudo."),
          ],
        },
        {
          evento: "usou:ler-alvara",
          faz: [{ ler: "ALVARÁ SONORO: GRAVE 2 · MÉDIO 0 · AGUDO 1." }, nota("alvara", "Alvará sonoro do DCE: grave 2, médio 0, agudo 1.")],
        },
        {
          evento: "usou:testar-som",
          faz: [
            { flag: "campus.certas", valor: 0 },
            { se: [vale("campus.grave", SOM.grave)], entao: [{ soma: "campus.certas" }] },
            { se: [vale("campus.medio", SOM.medio)], entao: [{ soma: "campus.certas" }] },
            { se: [vale("campus.agudo", SOM.agudo)], entao: [{ soma: "campus.certas" }] },
            {
              se: [vale("campus.certas", 3)],
              entao: [{ som: "acerto" }, { marca: "campus.ok" }, { dialogo: ["Teste de som: tudo dentro do alvará. A vizinhança aplaude do alto do prédio.", "Falta só decidir o que fazer com o campus: a portaria da Reitoria espera."], quem: "Estudante do DCE" }, { avancar: true }],
              senao: [{ som: "erro" }, { dialogo: ["A vizinha do 4º andar reclama pela janela: “está fora do alvará!”", "{campus.certas} dos 3 canais batem com o alvará. Ajuste e teste de novo."], quem: "Vizinha" }],
            },
          ],
        },
      ],
    },
    {
      id: "homologar",
      objetivo: "Decida o que fazer com o campus na portaria da Reitoria.",
      alvo: { predio: "edu-universidade", label: "Reitoria" },
      exige: [tem("campus.ok")],
      volta: "som",
      regras: [
        {
          evento: "usou:homologar",
          faz: [
            {
              escolha: {
                titulo: "O som está dentro do alvará. E o campus?",
                quem: "Reitora Vera",
                opcoes: [
                  {
                    id: "autorizar",
                    rotulo: "Autorizar a festa: liberou geral",
                    faz: [decide("campus", "autorizou"), { se: [no("universidade", "normal")], entao: [{ lugar: ["universidade", "liberou-geral"] }] }, { ler: "Autorização homologada: a festa foi ativada pelo expediente." }, nota("campus-fim", "Autorizei a festa no campus."), { concluir: true }],
                  },
                  {
                    id: "negociar",
                    rotulo: "Negociar: assembleia primeiro, festa só até as 22h",
                    faz: [decide("campus", "negociou"), { se: [no("universidade", "normal")], entao: [{ lugar: ["universidade", "liberou-geral"] }] }, { ler: "Acordo fechado: assembleia às 18h, festa com hora para acabar." }, nota("campus-fim", "Negociei: assembleia primeiro, festa só até as 22h."), { concluir: true }],
                  },
                  {
                    id: "ignorar",
                    rotulo: "Ignorar a ordem: só assembleia, sem festa",
                    faz: [decide("campus", "ignorou"), { se: [no("universidade", "liberou-geral")], entao: [{ lugar: ["universidade", "normal"] }] }, { ler: "Sem festa e sem autorização: o campus segue em assembleia, de portas abertas." }, nota("campus-fim", "Ignorei a ordem: o campus ficou só com assembleia."), { concluir: true }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    ...CANAIS.map((c) => ({ id: `som-${c}`, etapas: ["som"] })),
    { id: "ler-alvara", etapas: ["som"] },
    { id: "testar-som", etapas: ["som"] },
    { id: "homologar", etapas: ["homologar"] },
  ],
  conclusao: ["Campus resolvido: o alvará está na parede e a decisão está no ar.", "Reitora Vera: “Pode soltar o som. Só não solte o orçamento.”"],
  selo: { id: "assembleia-da-festa", nome: "Assembleia da Festa", cor: "#7b4bd1", icone: "🎉" },
};

// ------------------------------------------------------------------ 5 · Coletivizou Até a Chave

const POSTOS = [
  {
    id: "elevador",
    lugar: "Conjunto 13",
    ferramenta: "martelo",
    ver: "Pedido nº 7: o elevador do Conjunto 13 emperrou entre o 3º e o 4º andar. O botão do 3º está colado e só um martelo resolve.",
    nota: "Elevador do Conjunto 13: botão do 3º andar colado. Precisa de martelo.",
    feito: "Elevador consertado: o martelo descolou o botão e a cabine voltou a subir (às vezes).",
    alvo: { predio: "res-conjunto-13", label: "Conjunto Habitacional Nº 13" },
  },
  {
    id: "muro",
    lugar: "Associação do Povo",
    ferramenta: "pincel",
    ver: "Pedido nº 9: o muro do mutirão está pichado com “coletivizado até o reboco”. A tinta e o pincel ficam por conta de quem passar.",
    nota: "Muro do mutirão: pichação nº 9. Precisa de pincel.",
    feito: "Muro pintado! A tinta ainda é do povo, e o vizinho já pediu a metade.",
    alvo: { predio: "res-associacao", label: "Muro, na Associação do Povo" },
  },
  {
    id: "prensa",
    lugar: "Fábrica Estatal Nº 1",
    ferramenta: "chave inglesa",
    ver: "Pedido nº 11: a prensa da fábrica travou com a produção do povo dentro. A porca da biela está solta e pede chave inglesa.",
    nota: "Prensa da fábrica: porca da biela solta. Precisa de chave inglesa.",
    feito: "Prensa destravada: a produção do povo voltou a sair, em ordem de chegada.",
    alvo: { predio: "ind-fabrica", label: "Fábrica Estatal Nº 1" },
  },
] as const;

const regrasFerramentas = (): Regra[] => {
  const out: Regra[] = [];
  for (const p of POSTOS) {
    out.push({
      evento: `usou:ver-${p.id}`,
      faz: [{ marca: `chave.i.${p.id}` }, nota(`ver-${p.id}`, p.nota), { ler: p.ver }],
    });
    out.push({
      evento: `usou:posto-${p.id}`,
      se: [tem(`chave.${p.id}`)],
      faz: [{ ler: "Esse pedido já foi atendido. Está funcionando." }],
    });
    out.push({
      evento: `usou:posto-${p.id}`,
      se: [com("caixa-ferramentas"), nao(tem(`chave.i.${p.id}`))],
      faz: [{ ler: "Antes de mexer, preciso olhar o pedido e entender o defeito." }],
    });
    out.push({
      evento: `usou:posto-${p.id}`,
      se: [com("caixa-ferramentas")],
      faz: [
        { marca: `chave.${p.id}`, conta: "chave.entregues" },
        { som: "conserto" },
        { dialogo: [`Tirei o ${p.ferramenta} da caixa e fui ao trabalho.`, p.feito], quem: p.lugar },
        nota(`feito-${p.id}`, p.feito),
        { se: [min("chave.entregues", 3)], entao: [{ soltar: true }, { avancar: true }] },
      ],
    });
    out.push({ evento: `usou:posto-${p.id}`, faz: [{ ler: "Preciso da caixa de ferramentas do armário da Associação." }] });
  }
  return out;
};

const CHAVE: MissaoDef = {
  id: "chave",
  numero: 5,
  titulo: "Coletivizou Até a Chave",
  local: "Vila do Mutirão e Polo Industrial",
  inicio: {
    npc: "didi",
    quem: "o Vô Didi",
    alvo: { x: 1150, y: 650, label: "Vô Didi" },
    dialogo: [
      "Vô Didi: Coletivizaram até a chave do armário de ferramentas!",
      "Ninguém sabe onde foi parar. Pergunta ao Tio Osvaldo e à Encarregada Rose. Um empurra para o outro.",
      "Com a chave, abre o armário na Associação do Povo. A caixa de ferramentas é uma só, e serve a todos os pedidos. A ordem de quem atender primeiro é sua.",
    ],
  },
  etapas: [
    {
      id: "didi",
      objetivo: "Converse com o Vô Didi.",
      alvo: { x: 1150, y: 650, label: "Vô Didi" },
      regras: [{ evento: "falou:didi", faz: [{ avancar: true }] }],
    },
    {
      id: "pistas",
      objetivo: "Descubra onde foi parar a chave: Tio Osvaldo e Encarregada Rose ({chave.n}/2). A chave está com o segundo que você encontrar.",
      alvo: { x: 1130, y: 2245, label: "Encarregada Rose" },
      alvos: [
        { se: [nao(tem("chave.osvaldo"))], alvo: { x: 290, y: 744, label: "Tio Osvaldo" } },
        { se: [nao(tem("chave.rose"))], alvo: { x: 1130, y: 2245, label: "Encarregada Rose, no Polo Industrial" } },
      ],
      lista: [
        { rotulo: "Tio Osvaldo, na Vila do Mutirão", feito: [tem("chave.osvaldo")] },
        { rotulo: "Encarregada Rose, no Polo Industrial", feito: [tem("chave.rose")] },
      ],
      regras: [
        {
          evento: "falou:osvaldo",
          se: [tem("chave.rose")],
          faz: [
            { marca: "chave.osvaldo", conta: "chave.n" },
            { dialogo: ["A Rose disse que deixou comigo? Ah, é verdade, estava no meu portão, entre os cadeados.", "Toma a chave. Leva pra Associação do Povo, antes que alguém coletivize de novo."], quem: "Tio Osvaldo" },
            nota("osvaldo", "Tio Osvaldo estava com a chave, esquecida no portão dele."),
            { pegar: "chave" },
            { ler: "Tio Osvaldo entregou a chave coletivizada." },
            { avancar: true },
          ],
        },
        {
          evento: "falou:osvaldo",
          faz: [
            { marca: "chave.osvaldo", conta: "chave.n" },
            { dialogo: ["A chave? Vi no crachá da Encarregada Rose, lá no Polo Industrial. Todo mundo usava.", "Se ela disser que deixou comigo, volta aqui que eu procuro no portão."], quem: "Tio Osvaldo" },
            nota("osvaldo", "Tio Osvaldo disse que viu a chave no crachá da Rose, no Polo Industrial."),
          ],
        },
        {
          evento: "falou:encarregada",
          se: [tem("chave.osvaldo")],
          faz: [
            { marca: "chave.rose", conta: "chave.n" },
            { dialogo: ["O Osvaldo disse que eu estava com ela? Estava, até emprestar para ele conferir. Ele nunca devolve!", "Peguei de volta no balcão. Toma, leva pro armário da Associação. Eu só peço o martelo de volta."], quem: "Encarregada Rose" },
            nota("rose", "A Encarregada Rose tinha a chave de volta e me entregou."),
            { pegar: "chave" },
            { ler: "Encarregada Rose entregou a chave coletivizada." },
            { avancar: true },
          ],
        },
        {
          evento: "falou:encarregada",
          faz: [
            { marca: "chave.rose", conta: "chave.n" },
            { dialogo: ["A chave? Estava no meu crachá, mas emprestei para o Tio Osvaldo conferir o portão.", "Fala com ele, na Vila do Mutirão. Se ele disser que não sabe, é porque sabe."], quem: "Encarregada Rose" },
            nota("rose", "A Encarregada Rose emprestou a chave ao Tio Osvaldo, na Vila do Mutirão."),
          ],
        },
      ],
    },
    {
      id: "armario",
      objetivo: "Abra o armário de ferramentas na Associação do Povo e pegue a caixa de ferramentas.",
      alvo: { predio: "res-associacao", label: "Associação do Povo" },
      exige: [{ ou: [com("chave"), tem("chave.aberto")] }],
      volta: "pistas",
      regras: [
        {
          evento: "usou:armario-ferramentas",
          se: [com("chave")],
          faz: [
            { soltar: true },
            { flag: "chave.aberto", valor: true },
            { pegar: "caixa-ferramentas" },
            { dialogo: ["O armário abriu! Martelo, pincel e chave inglesa, tudo numa caixa só.", "A caixa pesa, mas é uma só. Dá para ir direto de pedido em pedido."], quem: "Presidente da Associação" },
            nota("armario", "Abri o armário: caixa de ferramentas com martelo, pincel e chave inglesa."),
            { avancar: true },
          ],
        },
        {
          evento: "usou:armario-ferramentas",
          se: [tem("chave.aberto"), nenhum],
          faz: [{ pegar: "caixa-ferramentas" }, { ler: "O armário já estava aberto: peguei a caixa de ferramentas." }, { avancar: true }],
        },
      ],
    },
    {
      id: "ferramentas",
      objetivo: "Atenda os três pedidos na ordem que preferir: examine o defeito e use a caixa de ferramentas ({chave.entregues}/3).",
      alvo: POSTOS[0].alvo,
      alvos: POSTOS.map((p) => ({ se: [nao(tem(`chave.${p.id}`))], alvo: p.alvo })),
      lista: POSTOS.map((p) => ({ rotulo: `${p.lugar}: ${p.ferramenta}`, feito: [tem(`chave.${p.id}`)] })),
      exige: [com("caixa-ferramentas")],
      volta: "armario",
      regras: regrasFerramentas(),
    },
    {
      id: "devolver",
      objetivo: "Decida o destino da chave do armário, no gancho da Associação do Povo.",
      alvo: { predio: "res-associacao", label: "Gancho da chave, na Associação" },
      regras: [
        {
          evento: "usou:gancho-chave",
          faz: [
            {
              escolha: {
                titulo: "Os três pedidos foram atendidos. E a chave do armário?",
                opcoes: [
                  {
                    id: "coletivo",
                    rotulo: "Pendurar no gancho coletivo: todo mundo usa",
                    faz: [decide("chave", "coletivo"), { ler: "A chave voltou ao gancho, com fila de empréstimo e livro de assinaturas." }, nota("chave-fim", "Pendurei a chave no gancho coletivo."), { concluir: true }],
                  },
                  {
                    id: "devolver",
                    rotulo: "Devolver ao Vô Didi: de quem sempre foi",
                    faz: [decide("chave", "devolveu"), { ler: "A chave foi para o bolso do Vô Didi, com recibo de devolução." }, nota("chave-fim", "Devolvi a chave ao Vô Didi."), { concluir: true }],
                  },
                  {
                    id: "quebrar",
                    rotulo: "Quebrar a chave: armário sem tranca, ferramenta para quem precisar",
                    faz: [decide("chave", "quebrou"), { ler: "A chave quebrou no meio. O armário agora abre empurrando." }, nota("chave-fim", "Quebrei a chave: o armário ficou sem tranca."), { concluir: true }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "armario-ferramentas", etapas: ["armario"], se: [{ ou: [com("chave"), tem("chave.aberto")] }] },
    ...POSTOS.flatMap((p) => [
      { id: `ver-${p.id}`, etapas: ["ferramentas"] },
      { id: `posto-${p.id}`, etapas: ["ferramentas"], se: [com("caixa-ferramentas")] },
    ]),
    { id: "gancho-chave", etapas: ["devolver"] },
  ],
  conclusao: ["Os três pedidos foram atendidos e o armário tem destino definido.", "Vô Didi: “Patrimônio é coisa que a gente divide, e depois procura.”"],
  selo: { id: "patrimonio", nome: "Patrimônio de Todo Mundo", cor: "#2f7a52", icone: "🔧" },
};

// ------------------------------------------------------------------ 6 · Brasil, Destino China

const ETIQUETAS: { id: "peso" | "destino" | "conteudo"; opcoes: string[]; certa: number; nome: string }[] = [
  { id: "peso", nome: "Peso", opcoes: ["1 kg", "3 toneladas", "210 milhões de habitantes", "Sem peso (é conceito)"], certa: 2 },
  { id: "destino", nome: "Destino", opcoes: ["Paraguai", "Cabo Frio", "Sem destino (é viagem)", "China"], certa: 3 },
  { id: "conteudo", nome: "Conteúdo", opcoes: ["Café", "Cachaça", "O próprio Brasil", "Ar (de bolso)"], certa: 2 },
];

const etiqueta = (e: (typeof ETIQUETAS)[number]): Regra => ({
  evento: `usou:etq-${e.id}`,
  faz: [
    { cicla: `brasil.${e.id}`, max: e.opcoes.length },
    { flag: "brasil.certas", valor: 0 },
    ...ETIQUETAS.map((x): Efeito => ({ se: [vale(`brasil.${x.id}`, x.certa)], entao: [{ soma: "brasil.certas" }] })),
    {
      se: [vale("brasil.certas", 3)],
      entao: [{ som: "acerto" }, { ler: "As três etiquetas batem com o regulamento do frete. Pode levar a caixa ao Terminal." }, { avancar: true }],
      // uma resposta só (um balão, não um diálogo): a opção que ficou na etiqueta e quantas batem
      senao: e.opcoes.map((o, i): Efeito => ({ se: [vale(`brasil.${e.id}`, i)], entao: [{ ler: `${e.nome}: ${o}. {brasil.certas} de 3 batem.` }] })),
    },
  ],
});

const pistaFrete = (npc: string, flag: string, linhas: string[], quem: string, anota: string, avanca: boolean): Regra => ({
  evento: `falou:${npc}`,
  faz: [{ marca: flag, conta: "brasil.pistas" }, { dialogo: linhas, quem }, nota(`frete-${npc}`, anota), ...(avanca ? [{ se: [min("brasil.pistas", 2)], entao: [{ avancar: true } as Efeito] } as Efeito] : [])],
});

const PISTAS_FRETE = (avanca: boolean): Regra[] => [
  pistaFrete("operario", "brasil.pj", ["O peso do Brasil? Conta cada habitante como um quilo de saudade.", "Duzentos e dez milhões deles. A balança só aceita assim."], "Operária Jô", "Operária Jô: o peso do Brasil são 210 milhões de habitantes.", avanca),
  pistaFrete("estivador", "brasil.pe", ["Aqui só sai navio para um lugar. Eu já cansei de errar de porto.", "O destino é a China, sempre. O resto é conversa de capitão."], "Estivador Beto", "Estivador Beto: o navio só vai para a China.", avanca),
  pistaFrete("controlador", "brasil.pc", ["A alfândega só deixa passar se o conteúdo vier declarado como ele é.", "O conteúdo é o próprio Brasil, que é o que a ficha pede. Sem trocadilho."], "Controlador de despacho", "Controlador de despacho: o conteúdo declarado é o próprio Brasil.", avanca),
];

const BRASIL: MissaoDef = {
  id: "brasil",
  numero: 6,
  titulo: "Brasil, Destino China",
  local: "Polo Industrial e Terminal Brasil–China",
  inicio: {
    npc: "despachante",
    quem: "o Despachante do Impossível",
    alvo: { x: 3490, y: 2215, label: "Despachante do Impossível" },
    dialogo: [
      "Despachante do Impossível: Preciso despachar o Brasil, mas ele não cabe no formulário.",
      "O regulamento do frete está espalhado entre o povo do porto e da fábrica: peso, destino e conteúdo. Depois é etiquetar e levar ao Controle de Despacho.",
      "A ordem é despachar. Mas confira o painel do despacho antes de acionar qualquer coisa.",
    ],
  },
  etapas: [
    {
      id: "despachante",
      objetivo: "Converse com o Despachante do Impossível.",
      alvo: { x: 3490, y: 2215, label: "Despachante do Impossível" },
      regras: [{ evento: "falou:despachante", faz: [{ avancar: true }] }],
    },
    {
      id: "regulamento",
      objetivo: "Descubra o regulamento do frete: peso, destino e conteúdo ({brasil.pistas}/2 pistas para começar).",
      alvo: { x: 3300, y: 2686, label: "Estivador Beto" },
      alvos: [
        { se: [nao(tem("brasil.pe"))], alvo: { x: 3300, y: 2686, label: "Estivador Beto, no Terminal" } },
        { se: [nao(tem("brasil.pj"))], alvo: { x: 300, y: 2255, label: "Operária Jô, no Polo Industrial" } },
        { se: [nao(tem("brasil.pc"))], alvo: { predio: "ter-despacho", label: "Controlador, no Controle de Despacho" } },
      ],
      lista: [
        { rotulo: "Peso: Operária Jô, no Polo Industrial", feito: [tem("brasil.pj")] },
        { rotulo: "Destino: Estivador Beto, no Terminal", feito: [tem("brasil.pe")] },
        { rotulo: "Conteúdo: Controlador, no Controle de Despacho", feito: [tem("brasil.pc")] },
      ],
      regras: PISTAS_FRETE(true),
    },
    {
      id: "retirar",
      objetivo: "Retire a caixa do mapa do Brasil, no Depósito Central do Povo (Polo Industrial).",
      alvo: { predio: "ind-deposito", label: "Depósito Central do Povo" },
      regras: [...PISTAS_FRETE(false), { evento: "usou:retirar-brasil", se: [nenhum], faz: [{ pegar: "caixa-brasil" }, { ler: "A caixa é do tamanho de uma encomenda. O Brasil ali dentro é de papelão." }, { avancar: true }] }],
    },
    {
      id: "etiquetas",
      objetivo: "Prepare as 3 etiquetas conforme o regulamento, no Almoxarifado do Carimbo ({brasil.certas}/3 batem).",
      alvo: { predio: "ind-almoxarifado", label: "Almoxarifado do Carimbo" },
      painel: [{ rotulo: "Etiquetas que batem", flag: "brasil.certas", max: 3 }],
      exige: [com("caixa-brasil")],
      volta: "retirar",
      regras: [...PISTAS_FRETE(false), ...ETIQUETAS.map(etiqueta)],
    },
    {
      id: "levar",
      objetivo: "Leve a caixa ao Controle de Despacho, no Terminal Brasil–China.",
      alvo: { predio: "ter-despacho", label: "Controle de Despacho" },
      exige: [com("caixa-brasil")],
      volta: "retirar",
      regras: [{ evento: "usou:colocar-carga", se: [com("caixa-brasil")], faz: [{ soltar: true }, { marca: "brasil.carga" }, { ler: "Caixa posta na esteira de despacho." }, { avancar: true }] }, ...PISTAS_FRETE(false)],
    },
    {
      id: "esteira",
      objetivo: "Confira o manifesto no painel e decida o destino do Brasil na esteira (o terminal precisa estar em operação).",
      alvo: { predio: "ter-despacho", label: "Controle de Despacho" },
      lista: [
        { rotulo: "Conferir o manifesto no painel", feito: [tem("brasil.conf")] },
        { rotulo: "Terminal em operação (alavanca)", feito: [no("terminal-china", "em-operacao")] },
      ],
      regras: [
        ...PISTAS_FRETE(false),
        {
          evento: "usou:conferir-despacho",
          faz: [
            { marca: "brasil.conf" },
            { dialogo: ["MANIFESTO: 1 volume, conteúdo “o próprio Brasil”, destino China, frete pago em 400 anos úteis.", "Observação na margem: “carga pode ser trocada por outra do mesmo peso. Procedimento permite pausa na esteira.”"], quem: "Painel do despacho" },
            nota("manifesto", "Manifesto: carga pode ser trocada por outra do mesmo peso, e o procedimento permite pausar a esteira."),
          ],
        },
        { evento: "usou:acionar-esteira", se: [no("terminal-china", "parado")], faz: [{ som: "erro" }, { ler: "Terminal parado! Religue pela alavanca do controle." }] },
        { evento: "usou:acionar-esteira", se: [nao(tem("brasil.conf"))], faz: [{ ler: "Confira o manifesto no painel antes de acionar a esteira: a margem tem observações." }] },
        {
          evento: "usou:acionar-esteira",
          faz: [
            {
              escolha: {
                titulo: "A esteira está pronta. O que fazer com a ordem de despachar o Brasil?",
                quem: "Controlador de despacho",
                opcoes: [
                  {
                    id: "despachar",
                    rotulo: "Obedecer: despachar o Brasil para a China",
                    faz: [decide("brasil", "despachou"), { som: "acerto" }, { ler: "Esteira acionada: o Brasil seguiu para o cais, embalado e etiquetado." }, nota("brasil-fim", "Despachei o Brasil para a China."), { concluir: true }],
                  },
                  {
                    id: "trocar",
                    rotulo: "Trocar a carga por uma caixa de cachaça do mesmo peso",
                    faz: [decide("brasil", "trocou"), { som: "acerto" }, { ler: "A esteira levou a cachaça. O Brasil ficou na área de espera, com etiqueta de “retido”." }, nota("brasil-fim", "Troquei a carga: embarcou cachaça, e o Brasil ficou no porto."), { concluir: true }],
                  },
                  {
                    id: "sabotar",
                    rotulo: "Sabotar: pausar a esteira com a carga em cima",
                    faz: [decide("brasil", "sabotou"), { lugar: ["terminal-china", "parado"] }, { som: "erro" }, { ler: "A esteira parou no meio do caminho. O Brasil ficou preso, e o frete, cancelado." }, nota("brasil-fim", "Pausei a esteira: o Brasil não embarcou."), { concluir: true }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "retirar-brasil", etapas: ["retirar"], se: [nenhum] },
    { id: "etq-peso", etapas: ["etiquetas"] },
    { id: "etq-destino", etapas: ["etiquetas"] },
    { id: "etq-conteudo", etapas: ["etiquetas"] },
    { id: "colocar-carga", etapas: ["levar"], se: [com("caixa-brasil")] },
    { id: "conferir-despacho", etapas: ["esteira"] },
    { id: "acionar-esteira", etapas: ["esteira"] },
  ],
  conclusao: ["Brasil resolvido: o rastreio vai contar o que aconteceu, de um jeito ou de outro.", "Passaporte do Absurdo completo: os seis selos são seus. Seu Repassa quer falar com você na praça."],
  selo: { id: "brasil-china", nome: "Brasil, Destino China", cor: "#c62835", icone: "🚢" },
};

// ------------------------------------------------------------------ Epílogo: Ditadura do Carimbo

const DITADURA: MissaoDef = {
  id: "ditadura",
  numero: 7,
  titulo: "Ditadura do Carimbo",
  local: "Centro Cívico",
  inicio: {
    npc: "boato",
    quem: "Seu Repassa, na praça",
    alvo: { x: 2330, y: 1060, label: "Seu Repassa" },
    dialogo: [
      "Seu Repassa: Presidente, o Passaporte do Absurdo está completo. Os seis selos estão no papel.",
      "O Ministério leu os selos como autorização para uma coisa maior. Uma coisa que eu prefiro não dizer em voz alta.",
      "Suba ao palanque, no Monumento ao Áudio. A praça já está se reunindo.",
    ],
  },
  etapas: [
    {
      id: "convite",
      objetivo: "Fale com Seu Repassa, na praça.",
      alvo: { x: 2330, y: 1060, label: "Seu Repassa" },
      regras: [{ evento: "falou:boato", faz: [{ avancar: true }] }],
    },
    {
      id: "palanque",
      objetivo: "A cerimônia vai começar: suba ao palanque, no Monumento ao Áudio, na praça.",
      alvo: { x: 2400, y: 1000, label: "Palanque, no Monumento ao Áudio" },
      regras: [
        { evento: "usou:palanque", faz: [{ cerimonia: true }] },
        { evento: "cerimonia:fim", faz: [{ concluir: true }] },
      ],
    },
  ],
  pontos: [{ id: "palanque", etapas: ["palanque"], fora: { x: 2400, y: 1000, label: "Subir ao palanque" } }],
  conclusao: ["A Ditadura do Carimbo está carimbada. Em papel, em tinta e em eco.", "A cidade segue explorável: veja como cada canto recebeu o decreto."],
  selo: { id: "ditadura-do-carimbo", nome: "Ditadura do Carimbo", cor: "#1e1424", icone: "👑" },
};

// ------------------------------------------------------------------ falas por estado

const f = (npc: string, quando: Cond[], linhas: string[]): FalaPorEstado => ({ npc, quando, linhas });
const fez = (id: string): Cond => ({ concluida: id });
const d = (m: string, v: string): Cond => vale(`d.${m}`, v);
const tom = (v: string): Cond => vale("final.tom", v);

const FALAS: FalaPorEstado[] = [
  // depois da cerimônia (a cidade reage ao tom)
  f("boato", [tom("obediencia")], ["Aplaudi em fila, por ordem alfabética. O Ministério já marcou presença nos meus aplausos.", "Para discordar agora precisa de formulário. Tem em estoque, mas só vale em 30 de fevereiro."]),
  f("boato", [tom("ignorado")], ["Decreto? Que decreto? Eu estava ocupado fingindo que não ouvi.", "O povo está tão atento ao decreto quanto ao horóscopo do mês passado."]),
  f("boato", [tom("misto")], ["Metade aplaudiu, metade riu e todo mundo pediu carimbo. O decreto funciona às terças.", "Dizem que na quarta ele perde a validade. Mas ninguém sabe qual quarta."]),
  f("pastor", [tom("obediencia"), d("cadeado", "cumpriu")], ["A porta da frente está lacrada, a lateral tem fila e senha. O decreto funciona até demais.", "Agora a fé tem protocolo. E o protocolo, fé."]),
  f("pastor", [tom("ignorado"), d("cadeado", "sabotou")], ["O cadeado de papelão virou lenda. Ninguém obedece ao decreto, e o decreto nem sabe."]),
  f("reitora", [tom("obediencia")], ["O campus está tão obediente que pede autorização para respirar. Já protocolei o pedido.", "Se o decreto durar, até o recreio vira audiência pública."]),
  f("reitora", [tom("ignorado")], ["Cumprir o decreto? Só se ele vier no alvará sonoro. E ele não veio."]),
  f("kiko", [tom("obediencia")], ["Preço de tudo agora é “sujeito a carimbo”. Ficou caro, mas ficou carimbado."]),
  f("kiko", [tom("ignorado")], ["O decreto proibia o fiado. O fiado respondeu com mais fiado."]),
  f("despachante", [tom("obediencia")], ["O terminal funciona por decreto. O navio parte quando o formulário assina, e ele assina às quintas."]),
  f("despachante", [tom("ignorado")], ["Despachei o decreto também. Está em alto-mar junto com o resto."]),
  // decisões da campanha
  f("boato", [fez("brasil"), d("brasil", "despachou")], ["O Brasil embarcou! Frete pago, saudade cobrada à parte.", "Agora só falta alguém assumir que isso não era trocadilho."]),
  f("boato", [fez("brasil"), d("brasil", "trocou")], ["Embarcou cachaça no lugar do Brasil e ninguém reclamou. Na China, vai ser uma bela degustação.", "Eu disse que o áudio dava certo, só não disse com qual conteúdo."]),
  f("boato", [fez("brasil"), d("brasil", "sabotou")], ["A esteira parou no meio e o Brasil ficou no cais, com etiqueta de retido.", "Dizem que foi o primeiro frete cancelado por falta de coragem do frete."]),
  f("boato", [fez("cadeado"), d("cadeado", "sabotou")], ["O cadeado de papelão pintado de dourado é a melhor coisa que a Igreja já ganhou desde o decreto.", "Mas fica entre nós: se o Ministério perguntar, foi tudo obra do vento."]),
  f("boato", [fez("cadeado"), d("cadeado", "brecha")], ["Cadeado na frente e lateral regulamentada: respeitamos o decreto e a porta ao mesmo tempo.", "Isso é política de alto nível: a gente se obedece desobedecendo."]),
  f("boato", [fez("cadeado"), d("cadeado", "cumpriu")], ["Cadeado presidencial instalado. A igreja agora tem comprovante, e eu tenho orgulho.", "Quando tudo é carimbado, até o áudio fica oficial."]),
  f("boato", [fez("protocolo"), d("protocolo", "recurso")], ["Credencial por recurso! Você ganhou um papel sem precisar do carimbo.", "A Repartição ficou tão sem graça que pendurou um aviso pedindo desculpas."]),
  f("boato", [fez("protocolo")], ["Credencial reconhecida! Já sou presidente dos meus próprios áudios.", "A Repartição até pendurou um aviso com o meu nome."]),
  f("atendente", [d("protocolo", "recurso")], ["Recurso deferido! Foi o primeiro em vinte anos e ninguém sabia o que fazer com ele.", "Guardei o recurso na pasta de “casos que a lei não previu”. A pasta está cheia."]),
  f("atendente", [d("protocolo", "carimbo")], ["Amarelo, cor de gema, carimbado. Está tudo em dia, com cópia em duas vias.", "Se precisar de uma terceira via, tem mais papel."]),
  f("pastor", [fez("cadeado"), d("cadeado", "sabotou"), no("igreja-matriz", "aberta")], ["O cadeado de papelão ficou lindo na porta. A igreja segue aberta, e o decreto, ocupado demais para reparar.", "Nem o vento teve coragem de conferir."]),
  f("pastor", [fez("cadeado"), d("cadeado", "brecha")], ["Cadeado na frente, fé na lateral. Todo mundo entra e ninguém desobedece, pelo menos por escrito."]),
  f("pastor", [fez("cadeado"), no("igreja-matriz", "aberta")], ["A porta foi reaberta depois do cadeado. O cadeado ainda tem comprovante, mas a porta tem opinião.", "Se o Ministério perguntar, o comprovante está arquivado, e a porta, arrombada pela fé."]),
  f("pastor", [fez("cadeado"), d("cadeado", "cumpriu")], ["Nova trava na porta: agora é o Cadeado Presidencial, com comprovante.", "A fé continua. Só mudou o protocolo."]),
  f("tiao", [fez("cadeado"), d("cadeado", "sabotou")], ["Fica entre nós: o cadeado que saiu daqui voltou diferente. Pintado de ouro, ou de papelão?", "Aqui, só fiado e cachaça presidencial."]),
  f("tiao", [fez("cadeado")], ["Aquele cadeado voltou pra igreja. Aqui, só fiado e cachaça presidencial.", "Se precisar de outro cadeado, o balcão tem."]),
  f("fregues", [d("cadeado", "brecha")], ["Eu disse que a lateral nunca foi numerada. Agora ela tem placa e tudo.", "Entrei hoje pela lateral e saí abençoado, com número de protocolo."]),
  f("kiko", [fez("zap"), d("zap", "boato")], ["Rotulou a caixa com o nome que o zap inventou? A fila deu duas voltas na praça e todo mundo saiu com lápis de cor.", "Agora o nome do zap é marca registrada. Tem até ambulante vendendo o tal kit, de lápis."]),
  f("kiko", [fez("zap"), d("zap", "desmentiu")], ["O romaneio na parede acabou com o áudio em duas horas. Ele ainda circula, mas já ninguém acredita.", "Agora o estoque é da escola, e a etiqueta é do povo."]),
  f("kiko", [fez("zap")], ["As caixas foram para o lugar certo. O zap ficou desmentido por 5 minutos.", "Agora o estoque é da escola, e a etiqueta é do povo."]),
  f("diretora", [fez("zap"), d("zap", "lacrado")], ["Os kits foram lacrados e ninguém sabe o que tem dentro. Os alunos estão aprendendo a ter curiosidade.", "O lacre diz “não abra”. A aula de hoje é sobre isso."]),
  f("diretora", [fez("zap"), d("zap", "desmentiu")], ["O romaneio está na parede e os alunos já sabem de cor. Lápis, cola e cartilha: a melhor aula da semana.", "O áudio do zap virou exercício de português."]),
  f("diretora", [fez("zap"), d("zap", "boato")], ["Deixou o zap correr! Agora o kit mais popular da escola é o que ninguém sabe o que é.", "Os pais querem ver, os alunos querem desenhar. Todo mundo feliz e todo mundo errado."]),
  f("diretora", [fez("zap")], ["Recebi a caixa e carimbei o recibo. É lápis de cor, e só.", "A placa de recebimento já está na parede do depósito."]),
  f("estudante", [fez("campus"), d("campus", "ignorou")], ["Sem festa? A assembleia ficou longa, mas ninguém foi embora. Dizem que é um bom sinal.", "Pelo menos o alvará sonoro não ficou com a vizinha."]),
  f("estudante", [fez("campus"), d("campus", "negociou")], ["Assembleia às 18h e festa até as 22h: a vizinha do 4º andar aplaudiu de pé, pela primeira vez.", "Foi o primeiro acordo que todo mundo cumpriu."]),
  f("reitora", [fez("campus"), d("campus", "ignorou")], ["Ignorou a autorização e manteve só a assembleia. Os alunos ficaram sem festa, mas não sem opinião.", "A Reitoria agora é um debate com som baixo."]),
  f("reitora", [fez("campus"), d("campus", "negociou")], ["Assembleia primeiro, festa até as 22h. É a primeira vez que o campus tem horário.", "Autorização de verdade: com hora para acabar e hora para começar."]),
  f("reitora", [fez("campus")], ["Autorizada! O alvará sonoro está na parede, e o som, no último volume permitido.", "A assembleia virou festa com papel passado."]),
  f("didi", [fez("chave"), d("chave", "devolveu")], ["A chave voltou para o meu bolso! Agora todo mundo pede emprestada, com recibo.", "Patrimônio é bom quando tem dono, e o dono tem bolso."]),
  f("didi", [fez("chave"), d("chave", "quebrou")], ["Quebrou a chave? O armário abre empurrando, e todo mundo empresta ferramenta sem pedir.", "Antigamente tinha fechadura. Agora tem confiança e um empurrãozinho."]),
  f("didi", [fez("chave")], ["O armário está aberto e a chave, no gancho. Hein? Já estava no meu bolso!", "Agora todo mundo pede ferramenta emprestada, em ordem alfabética."]),
  f("osvaldo", [fez("chave")], ["O elevador voltou a subir. Meu portão continua patrimônio, mas pelo menos tem martelo.", "Cada ferramenta no seu posto. Que absurdo organizado!"]),
  f("encarregada", [fez("chave")], ["A prensa destravou. A chave inglesa voltou ao crachá, mas agora tem fila de empréstimo.", "Patrimônio de todo mundo, com assinatura."]),
  f("juca", [fez("chave")], ["O elevador está subindo de novo! Assino o livro de visitas por todo mundo.", "Conserto coletivo: até o martelo deixou recibo."]),
  f("despachante", [fez("brasil"), d("brasil", "trocou")], ["O navio levou cachaça com etiqueta de Brasil. Na China, a alfândega ficou meio alegre.", "O Brasil ficou retido no cais. Dizem que é a melhor vista do porto."]),
  f("despachante", [fez("brasil"), d("brasil", "sabotou")], ["O Brasil ficou preso na esteira, com a etiqueta de frete cancelado. Não é a primeira vez que isso acontece.", "Pelo menos o navio vai de vazio, e a China, de ressaca."]),
  f("despachante", [fez("brasil")], ["O rastreio do Brasil diz: em alto-mar. Previsão de chegada: 400 anos úteis.", "Frete grátis, saudade cobrada à parte."]),
  f("controlador", [fez("brasil"), d("brasil", "sabotou")], ["A esteira parou com a carga em cima e a planilha pegou fogo de vergonha.", "Eu avisei que o procedimento permitia a pausa. Ninguém lê margem."]),
  f("controlador", [fez("brasil"), d("brasil", "trocou")], ["Cachaça no lugar do Brasil? A planilha aceitou, e o auditor não sabe de nada."]),
];

export const ITENS: Record<string, string> = {
  cadeado: "Cadeado presidencial",
  "caixa-zap": "Caixa do Zap",
  chave: "Chave coletivizada",
  "caixa-ferramentas": "Caixa de ferramentas",
  "caixa-brasil": "Caixa do Brasil",
};

/** Etapas de cada missão como eram quando o save só guardava o índice (migração de saves antigos). */
const LEGADO: Record<string, string[]> = {
  protocolo: ["falar", "avisos", "carimbar"],
  cadeado: ["inspecionar", "retirar", "instalar"],
  zap: ["etiquetas", "carregar", "entregar", "distribuir"],
  campus: ["reitora", "som", "homologar"],
  chave: ["didi", "pistas", "armario", "ferramentas"],
  brasil: ["despachante", "retirar", "etiquetas", "levar", "esteira"],
};

export const CAMPANHA: Campanha = {
  missoes: [PROTOCOLO, CADEADO, ZAP, CAMPUS, CHAVE, BRASIL],
  epilogo: DITADURA,
  falas: FALAS,
  itens: ITENS,
  legado: LEGADO,
};

/** Os seis selos do Passaporte, na ordem da campanha (o da cerimônia final é um extra). */
export const SELOS = CAMPANHA.missoes.map((m) => m.selo);
export const SELO_FINAL = DITADURA.selo;

/** Alvará sonoro, usado pelo quadro do DCE. */
export const QUADROS = {
  alvara: `ALVARÁ SONORO: GRAVE ${SOM.grave} · MÉDIO ${SOM.medio} · AGUDO ${SOM.agudo}`,
};

export { SOM as ALVARA_SOM, ETIQUETAS as ETIQUETAS_FRETE, POSTOS };

/** Quem decidiu o quê: o texto curto que o diário e a cerimônia final usam. */
export const DECISOES: Record<string, Record<string, { lado: "obediente" | "rebelde" | "meio"; texto: string }>> = {
  protocolo: {
    carimbo: { lado: "obediente", texto: "carimbou o formulário amarelo" },
    recurso: { lado: "meio", texto: "contestou os avisos em vez de carimbar" },
  },
  cadeado: {
    cumpriu: { lado: "obediente", texto: "cadeou a igreja como o áudio mandou" },
    sabotou: { lado: "rebelde", texto: "trocou o cadeado por um de papelão" },
    brecha: { lado: "meio", texto: "cadeou a frente e liberou a lateral" },
  },
  zap: {
    lacrado: { lado: "obediente", texto: "distribuiu os kits lacrados" },
    desmentiu: { lado: "rebelde", texto: "afixou o romaneio e desmentiu o zap" },
    boato: { lado: "meio", texto: "deixou o nome do zap na etiqueta" },
  },
  campus: {
    autorizou: { lado: "obediente", texto: "autorizou a festa" },
    negociou: { lado: "meio", texto: "negociou horário para a festa" },
    ignorou: { lado: "rebelde", texto: "ignorou a ordem e só deixou a assembleia" },
  },
  chave: {
    coletivo: { lado: "obediente", texto: "pendurou a chave no gancho coletivo" },
    devolveu: { lado: "meio", texto: "devolveu a chave ao Vô Didi" },
    quebrou: { lado: "rebelde", texto: "quebrou a chave do armário" },
  },
  brasil: {
    despachou: { lado: "obediente", texto: "despachou o Brasil para a China" },
    trocou: { lado: "meio", texto: "trocou a carga por cachaça" },
    sabotou: { lado: "rebelde", texto: "pausou a esteira com a carga em cima" },
  },
};
