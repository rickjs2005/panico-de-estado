import type { Campanha, Cond, Efeito, EtapaDef, FalaPorEstado, MissaoDef } from "./motor";

/**
 * Campanha curta da cidade do Lula: seis missões, em ordem, uma ativa por vez.
 * Tudo aqui é dado (textos, etapas, regras de evento, pontos de interação). Quem executa é o motor
 * (`motor.ts`) e a cena. Os ids de prédios, lugares e NPCs são os da cidade atual.
 *
 * Convenção dos eventos: "falou:<id do morador>", "usou:<id do ponto>" e "lugar:<lugar>:<estado>"
 * (quando uma ação muda o estado de um lugar). Flags de cada missão começam com o id dela.
 */

const nenhum: Cond = { item: "" };
const com = (item: string): Cond => ({ item });
const sem = (flag: string): Cond => ({ nao: { flag } });
const fim3 = (chave: string): Efeito => ({ se: [{ flag: chave, min: 3 }], entao: [{ concluir: true }] });

// ------------------------------------------------------------------ 1 · Protocolo do Boato

const aviso = (n: number, texto: string): EtapaDef["regras"][number] => ({
  evento: `usou:aviso-${n}`,
  faz: [
    { marca: `protocolo.a${n}`, conta: "protocolo.avisos" },
    { ler: `AVISO ${n}: ${texto}` },
    { se: [{ flag: "protocolo.avisos", min: 3 }], entao: [{ ler: "Já sei qual é: o amarelo. Hora de carimbar na Repartição." }, { avancar: true }] },
  ],
});

const PROTOCOLO: MissaoDef = {
  id: "protocolo",
  numero: 1,
  titulo: "Protocolo do Boato",
  local: "Centro Cívico",
  inicio: {
    npc: "boato",
    quem: "Seu Boato, na praça",
    alvo: { x: 2330, y: 1060, label: "Seu Boato" },
    dialogo: [
      "Seu Boato: Montaram um governo inteiro com áudios do grupo da família.",
      "Falta a credencial presidencial. Ela só sai com o formulário certo, carimbado.",
      "Os avisos da praça dizem qual é o vigente. Lê tudo antes de escolher!",
    ],
  },
  etapas: [
    {
      id: "falar",
      objetivo: "Fale com Seu Boato, na praça.",
      alvo: { x: 2330, y: 1060, label: "Seu Boato" },
      regras: [{ evento: "falou:boato", faz: [{ avancar: true }] }],
    },
    {
      id: "avisos",
      objetivo: "Examine os 3 avisos da praça ({protocolo.avisos}/3).",
      alvo: { x: 2400, y: 1070, label: "Avisos da praça" },
      regras: [
        aviso(1, "o protocolo vigente é o formulário da cor da gema do ovo."),
        aviso(2, "o formulário azul foi revogado ontem, mas ainda é distribuído."),
        aviso(3, "o formulário verde só vale em ano bissexto. Este ano não é."),
      ],
    },
    {
      id: "carimbar",
      objetivo: "Pegue o formulário certo e carimbe na Repartição de Carimbos (na mão: {protocolo.doc}).",
      alvo: { predio: "civ-reparticao", label: "Repartição de Carimbos" },
      regras: [
        { evento: "usou:form-amarelo", faz: [{ flag: "protocolo.doc", valor: "amarelo" }, { ler: "Peguei o formulário amarelo (cor de gema)." }] },
        { evento: "usou:form-azul", faz: [{ flag: "protocolo.doc", valor: "azul" }, { ler: "Peguei o formulário azul. O aviso disse que foi revogado..." }] },
        { evento: "usou:form-verde", faz: [{ flag: "protocolo.doc", valor: "verde" }, { ler: "Peguei o verde. Será que este ano é bissexto?" }] },
        { evento: "usou:carimbo-1", se: [{ flag: "protocolo.doc", igual: "amarelo" }], faz: [{ concluir: true }] },
        {
          evento: "usou:carimbo-1",
          se: [{ flag: "protocolo.doc" }],
          faz: [{ flag: "protocolo.doc", valor: "" }, { ler: "CARIMBO NEGADO: “formulário revogado, rasgado e arquivado”. Devolvi o papel; tente outro." }],
        },
        { evento: "usou:carimbo-1", faz: [{ ler: "O carimbo exige papel. Pegue um formulário na mesa ao lado." }] },
      ],
    },
  ],
  pontos: [
    { id: "aviso-1", etapas: ["avisos"], fora: { x: 2250, y: 1040, label: "Ler o aviso 1" } },
    { id: "aviso-2", etapas: ["avisos"], fora: { x: 2560, y: 1040, label: "Ler o aviso 2" } },
    { id: "aviso-3", etapas: ["avisos"], fora: { x: 2400, y: 1100, label: "Ler o aviso 3" } },
    { id: "form-amarelo", etapas: ["carimbar"] },
    { id: "form-azul", etapas: ["carimbar"] },
    { id: "form-verde", etapas: ["carimbar"] },
  ],
  conclusao: ["Credencial presidencial carimbada! O governo dos áudios agora tem papel passado.", "Seu Boato vai reconhecer o documento. Passe lá quando quiser."],
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
    quem: "Seu Boato, na praça",
    alvo: { x: 2330, y: 1060, label: "Seu Boato" },
    dialogo: [
      "Seu Boato: Chegou um áudio de 3 minutos mandando interditar a Igreja Matriz.",
      "O cadeado é maior que a porta. Confere a porta e fala com o pastor.",
      "Quem guarda o cadeado grande é o Tião, no bar do Largo da Feira.",
    ],
  },
  etapas: [
    {
      id: "inspecionar",
      objetivo: "Inspecione a porta da igreja e fale com o Pastor Josué ({cadeado.n}/2).",
      alvo: { x: 1840, y: 1150, label: "Porta da Igreja Matriz" },
      regras: [
        {
          evento: "usou:porta-igreja",
          faz: [
            { marca: "cadeado.porta", conta: "cadeado.n" },
            { ler: "A porta é pequena. O cadeado do decreto é do tamanho de um fusca." },
            { se: [{ flag: "cadeado.n", min: 2 }], entao: [{ avancar: true }] },
          ],
        },
        {
          evento: "falou:pastor",
          faz: [
            { marca: "cadeado.pastor", conta: "cadeado.n" },
            { dialogo: ["Interditar de novo? A porta já dorme de tanto cadeado.", "Se é pra cumprir o áudio, o Tião guarda o cadeado grande."], quem: "Pastor Josué" },
            { se: [{ flag: "cadeado.n", min: 2 }], entao: [{ avancar: true }] },
          ],
        },
      ],
    },
    {
      id: "retirar",
      objetivo: "Retire o cadeado grande com o Tião, no Bar do Largo da Feira.",
      alvo: { predio: "com-bar-tiao", label: "Bar do Tião" },
      regras: [
        {
          evento: "usou:cadeado-tiao",
          se: [nenhum],
          faz: [{ pegar: "cadeado" }, { dialogo: ["O cadeado é enorme, mas só pesa no papel.", "Leva pra igreja. De carro cabe no banco de trás."], quem: "Tião" }, { avancar: true }],
        },
      ],
    },
    {
      id: "instalar",
      objetivo: "Leve o cadeado à Igreja Matriz e confirme a operação (de carro cabe).",
      alvo: { predio: "civ-igreja-matriz", label: "Igreja Matriz" },
      regras: [
        {
          evento: "usou:instalar-cadeado",
          se: [com("cadeado")],
          faz: [
            {
              se: [{ lugar: "igreja-matriz", estado: "aberta" }],
              entao: [{ lugar: ["igreja-matriz", "interditada"] }, { flag: "cadeado.segunda", valor: false }, { ler: "Cadeado instalado: a igreja está interditada." }],
              senao: [{ flag: "cadeado.segunda", valor: true }, { ler: "A igreja já estava interditada: lavrei a segunda via do cadeado." }],
            },
            { soltar: true },
            { concluir: true },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "porta-igreja", etapas: ["inspecionar"], fora: { x: 1840, y: 1150, label: "Inspecionar a porta da igreja" } },
    { id: "cadeado-tiao", etapas: ["retirar"], se: [nenhum] },
    { id: "instalar-cadeado", etapas: ["instalar"], se: [com("cadeado")], fora: { x: 1840, y: 1150, label: "Instalar o cadeado na porta" } },
  ],
  conclusao: ["Operação cumprida (ou renovada): o cadeado ganhou comprovante de segunda via.", "Seu Boato: “Burocracia boa é burocracia em dobro.”"],
  selo: { id: "cadeado-presidencial", nome: "Cadeado Presidencial", cor: "#d9a520", icone: "🔒" },
};

// ------------------------------------------------------------------ 3 · Kit Gay do Zap: Carga Extraviada

const caixa = (l: "a" | "b" | "c", texto: string): EtapaDef["regras"][number] => ({
  evento: `usou:caixa-${l}`,
  faz: [
    { marca: `zap.${l}`, conta: "zap.n" },
    { ler: texto },
    { se: [{ flag: "zap.n", min: 3 }], entao: [{ ler: "Comparei as três etiquetas com os romaneios. Agora é escolher a caixa certa." }, { avancar: true }] },
  ],
});

const levar = (l: "a" | "b" | "c", certa: boolean): EtapaDef["regras"][number] => ({
  evento: `usou:levar-${l}`,
  faz: certa
    ? [{ pegar: "caixa-zap" }, { ler: "Essa é a da escola! Vou levar para o Depósito de Kits (dá para ir de carro)." }, { avancar: true }]
    : [{ ler: l === "a" ? "Quarenta câmaras de ar para bicicleta coletiva. Não é essa." : "Doze sacos de cimento para o muro do vizinho. Não é essa." }],
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
      "Seu Kiko: Chegou uma carga com as etiquetas trocadas. O zap já diz que é outra coisa.",
      "No estoque tem três caixas e uma é da escola: lápis de cor, cola e cartilha.",
      "Confere a etiqueta e o romaneio de cada uma. O romaneio não mente.",
    ],
  },
  etapas: [
    {
      id: "etiquetas",
      objetivo: "Leia etiqueta e romaneio das 3 caixas, no estoque do Mercadinho ({zap.n}/3).",
      alvo: { predio: "com-mercadinho", label: "Mercadinho Ki-Preço" },
      regras: [
        caixa("a", "CAIXA A. Etiqueta: “PARA: BORRACHARIA 24H”. Romaneio: 40 câmaras de ar para bicicleta coletiva."),
        caixa("b", "CAIXA B. Etiqueta: “PARA: ACADEMIA DO POVO (HALTERES FRÁGEIS)”. Romaneio: 300 lápis de cor, 120 colas, 1 cartilha."),
        caixa("c", "CAIXA C. Etiqueta: “PARA: ESCOLA ESTADUAL DO BOATO”. Romaneio: 12 sacos de cimento (para o muro do vizinho)."),
      ],
    },
    {
      id: "carregar",
      objetivo: "Carregue a caixa que é da escola: o romaneio manda, não a etiqueta (dá para levar de carro).",
      alvo: { predio: "com-mercadinho", label: "Estoque do Mercadinho" },
      regras: [levar("a", false), levar("b", true), levar("c", false)],
    },
    {
      id: "entregar",
      objetivo: "Entregue a caixa no Depósito de Kits, na Cidade Universitária.",
      alvo: { predio: "edu-deposito", label: "Depósito de Kits" },
      regras: [
        {
          evento: "usou:entregar-zap",
          se: [com("caixa-zap")],
          faz: [
            { soltar: true },
            { marca: "zap.entregue" },
            {
              se: [{ lugar: "deposito-kits", estado: "vazio" }],
              entao: [{ lugar: ["deposito-kits", "abastecido"] }, { ler: "O depósito estava vazio: a caixa repôs o estoque." }],
              senao: [{ ler: "Caixa entregue e conferida pela Diretora Clarice." }],
            },
            { avancar: true },
          ],
        },
      ],
    },
    {
      id: "distribuir",
      objetivo: "Puxe a alavanca do depósito para acionar a distribuição.",
      alvo: { predio: "edu-deposito", label: "Alavanca do Depósito" },
      regras: [{ evento: "lugar:deposito-kits:vazio", faz: [{ ler: "Distribuição acionada: os kits saíram para as escolas!" }, { concluir: true }] }],
    },
  ],
  pontos: [
    { id: "levar-a", etapas: ["carregar"], se: [nenhum] },
    { id: "levar-b", etapas: ["carregar"], se: [nenhum] },
    { id: "levar-c", etapas: ["carregar"], se: [nenhum] },
    { id: "entregar-zap", etapas: ["entregar"], se: [com("caixa-zap")] },
  ],
  conclusao: ["Entrega do Zap concluída: a caixa chegou a quem era de direito.", "Dessa vez o boato virou lápis de cor. A Diretora carimbou o recibo."],
  selo: { id: "entrega-do-zap", nome: "Entrega do Zap", cor: "#6746a0", icone: "📦" },
};

// ------------------------------------------------------------------ 4 · Campus Sem Freio

/** Alvará sonoro do DCE: o quadro da parede diz os níveis. */
const SOM = { grave: 2, medio: 0, agudo: 1 };

const ajuste = (nome: "grave" | "medio" | "agudo", rotulo: string): EtapaDef["regras"][number] => ({
  evento: `usou:som-${nome}`,
  faz: [
    { cicla: `campus.${nome}`, max: 3 },
    { ler: `${rotulo} no nível {campus.${nome}}.` },
    {
      se: [
        { flag: "campus.grave", igual: SOM.grave },
        { flag: "campus.medio", igual: SOM.medio },
        { flag: "campus.agudo", igual: SOM.agudo },
      ],
      entao: [{ ler: "Alvará sonoro respeitado! A vizinhança inteira vai ouvir a assembleia." }, { avancar: true }],
    },
  ],
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
      "O alvará sonoro está pendurado no DCE: lá diz como ajustar o som.",
      "Depois, homologue a autorização na portaria da Reitoria.",
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
      objetivo: "Ajuste grave, médio e agudo do som do DCE como manda o alvará da parede.",
      alvo: { predio: "edu-universidade", label: "DCE, na Universidade do Pânico" },
      regras: [ajuste("grave", "Grave"), ajuste("medio", "Médio"), ajuste("agudo", "Agudo")],
    },
    {
      id: "homologar",
      objetivo: "Homologue a autorização na portaria da Reitoria.",
      alvo: { predio: "edu-universidade", label: "Reitoria" },
      regras: [
        {
          evento: "usou:homologar",
          faz: [
            {
              se: [{ lugar: "universidade", estado: "normal" }],
              entao: [{ lugar: ["universidade", "liberou-geral"] }, { ler: "Autorização homologada: a festa foi ativada pelo expediente." }],
              senao: [{ ler: "A festa já rolava: agora está regularizada na portaria." }],
            },
            { concluir: true },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "som-grave", etapas: ["som"] },
    { id: "som-medio", etapas: ["som"] },
    { id: "som-agudo", etapas: ["som"] },
    { id: "homologar", etapas: ["homologar"] },
  ],
  conclusao: ["Assembleia da Festa autorizada! Alvará sonoro, portaria e rolê em dia.", "Reitora Vera: “Pode soltar o som. Só não solte o orçamento.”"],
  selo: { id: "assembleia-da-festa", nome: "Assembleia da Festa", cor: "#7b4bd1", icone: "🎉" },
};

// ------------------------------------------------------------------ 5 · Coletivizou Até a Chave

const FERRAMENTAS: { id: string; item: string; posto: string; tarefa: string; deu: string; errou: string }[] = [
  { id: "martelo", item: "martelo", posto: "elevador", tarefa: "Pedido nº 7: o elevador do Conjunto 13 emperrou. Falta um martelo.", deu: "Elevador consertado: voltou a subir (às vezes).", errou: "Isso não serve para o elevador. Ele quer um martelo." },
  { id: "pincel", item: "pincel", posto: "muro", tarefa: "Pedido nº 9: o muro do mutirão precisa de tinta e de um pincel.", deu: "Muro pintado! Agora é do povo, e do vizinho também.", errou: "O muro pediu um pincel, não isso." },
  { id: "chave-inglesa", item: "chave-inglesa", posto: "prensa", tarefa: "Pedido nº 11: a prensa da fábrica travou. Pede uma chave inglesa.", deu: "Prensa destravada: a produção do povo voltou.", errou: "A prensa só aceita chave inglesa." },
];

const regrasChave = (): EtapaDef["regras"] => {
  const out: EtapaDef["regras"] = [];
  for (const f of FERRAMENTAS) {
    out.push({ evento: `usou:pegar-${f.id}`, se: [nenhum], faz: [{ pegar: f.item }, { ler: `Peguei: ${f.id.replace("-", " ")}.` }] });
    out.push({
      evento: `usou:posto-${f.posto}`,
      se: [com(f.item)],
      faz: [{ soltar: true }, { marca: `chave.${f.posto}`, conta: "chave.entregues" }, { ler: f.deu }, fim3("chave.entregues")],
    });
    out.push({ evento: `usou:posto-${f.posto}`, se: [nenhum], faz: [{ ler: f.tarefa }] });
    out.push({ evento: `usou:posto-${f.posto}`, faz: [{ ler: f.errou }] });
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
      "Ninguém sabe onde foi parar. Pergunta ao Tio Osvaldo e à Encarregada Rose.",
      "Com a chave, abre o armário na Associação do Povo e leva as ferramentas a quem pediu.",
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
      objetivo: "Pergunte ao Tio Osvaldo e à Encarregada Rose onde foi a chave ({chave.n}/2).",
      alvo: { x: 1130, y: 2245, label: "Encarregada Rose, no Polo Industrial" },
      regras: [
        {
          evento: "falou:osvaldo",
          faz: [
            { marca: "chave.osvaldo", conta: "chave.n" },
            { dialogo: ["Eu vi a chave no bolso do Vô Didi. Ou era da Rose?", "Fala com a Encarregada, lá no Polo Industrial."], quem: "Tio Osvaldo" },
            { se: [{ flag: "chave.n", min: 2 }], entao: [{ pegar: "chave" }, { ler: "Rose me entregou a chave coletivizada." }, { avancar: true }] },
          ],
        },
        {
          evento: "falou:encarregada",
          faz: [
            { marca: "chave.rose", conta: "chave.n" },
            { dialogo: ["A chave? Estava pendurada no meu crachá. Todo mundo usava.", "Leva ela pro armário da Associação. Eu só peço o martelo de volta."], quem: "Encarregada Rose" },
            { se: [{ flag: "chave.n", min: 2 }], entao: [{ pegar: "chave" }, { ler: "Rose me entregou a chave coletivizada." }, { avancar: true }] },
          ],
        },
      ],
    },
    {
      id: "armario",
      objetivo: "Abra o armário de ferramentas, na Associação do Povo.",
      alvo: { predio: "res-associacao", label: "Associação do Povo" },
      regras: [{ evento: "usou:armario-ferramentas", se: [com("chave")], faz: [{ soltar: true }, { flag: "chave.aberto", valor: true }, { ler: "O armário abriu! Dentro: martelo, pincel e chave inglesa." }, { avancar: true }] }],
    },
    {
      id: "ferramentas",
      objetivo: "Leve cada ferramenta ao posto certo, uma por vez ({chave.entregues}/3).",
      alvo: { predio: "res-associacao", label: "Armário, na Associação do Povo" },
      regras: regrasChave(),
    },
  ],
  pontos: [
    { id: "armario-ferramentas", etapas: ["armario"], se: [com("chave")] },
    ...FERRAMENTAS.map((f) => ({ id: `pegar-${f.id}`, etapas: ["ferramentas"], se: [nenhum, sem(`chave.${f.posto}`)] })),
  ],
  conclusao: ["Patrimônio de todo mundo: as ferramentas chegaram a quem precisava.", "A chave ficou no gancho. De verdade, desta vez."],
  selo: { id: "patrimonio", nome: "Patrimônio de Todo Mundo", cor: "#2f7a52", icone: "🔧" },
};

// ------------------------------------------------------------------ 6 · Brasil, Destino China

const ETIQUETAS: { id: "peso" | "destino" | "conteudo"; opcoes: string[]; certa: number; nome: string }[] = [
  { id: "peso", nome: "Peso", opcoes: ["1 kg", "210 milhões de habitantes", "3 toneladas"], certa: 1 },
  { id: "destino", nome: "Destino", opcoes: ["Paraguai", "China", "Cabo Frio"], certa: 1 },
  { id: "conteudo", nome: "Conteúdo", opcoes: ["Café", "O próprio Brasil", "Cachaça"], certa: 1 },
];

const etiqueta = (e: (typeof ETIQUETAS)[number]): EtapaDef["regras"][number] => ({
  evento: `usou:etq-${e.id}`,
  faz: [
    { cicla: `brasil.${e.id}`, max: 3 },
    ...e.opcoes.map((o, i): Efeito => ({ se: [{ flag: `brasil.${e.id}`, igual: i }], entao: [{ ler: `Etiqueta de ${e.nome.toLowerCase()}: ${o}.` }] })),
    {
      se: ETIQUETAS.map((x) => ({ flag: `brasil.${x.id}`, igual: x.certa }) as Cond),
      entao: [{ ler: "As três etiquetas batem com o regulamento do frete. Pode levar a caixa ao Terminal." }, { avancar: true }],
    },
  ],
});

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
      "Retire a caixa no Depósito Central, etiquete conforme o regulamento do Almoxarifado e traga ao Controle de Despacho.",
      "Se o terminal estiver parado, religue pela alavanca antes de acionar a esteira.",
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
      id: "retirar",
      objetivo: "Retire a caixa do mapa do Brasil, no Depósito Central do Povo (Polo Industrial).",
      alvo: { predio: "ind-deposito", label: "Depósito Central do Povo" },
      regras: [{ evento: "usou:retirar-brasil", se: [nenhum], faz: [{ pegar: "caixa-brasil" }, { ler: "A caixa é do tamanho de uma encomenda. O Brasil ali dentro é de papelão." }, { avancar: true }] }],
    },
    {
      id: "etiquetas",
      objetivo: "Prepare as 3 etiquetas de transporte conforme o regulamento, no Almoxarifado do Boato.",
      alvo: { predio: "ind-almoxarifado", label: "Almoxarifado do Boato" },
      regras: ETIQUETAS.map(etiqueta),
    },
    {
      id: "levar",
      objetivo: "Leve a caixa ao Controle de Despacho, no Terminal Brasil–China.",
      alvo: { predio: "ter-despacho", label: "Controle de Despacho" },
      regras: [{ evento: "usou:colocar-carga", se: [com("caixa-brasil")], faz: [{ soltar: true }, { marca: "brasil.carga" }, { ler: "Caixa posta na esteira de despacho." }, { avancar: true }] }],
    },
    {
      id: "esteira",
      objetivo: "Confira o despacho e acione a esteira (o terminal precisa estar em operação).",
      alvo: { predio: "ter-despacho", label: "Controle de Despacho" },
      regras: [
        { evento: "usou:conferir-despacho", faz: [{ marca: "brasil.conf" }, { ler: "Painel: 1 caixa, destino China. Falta só acionar a esteira." }] },
        { evento: "usou:acionar-esteira", se: [{ lugar: "terminal-china", estado: "parado" }], faz: [{ ler: "Terminal parado! Religue pela alavanca do controle." }] },
        { evento: "usou:acionar-esteira", se: [{ flag: "brasil.conf" }], faz: [{ ler: "Esteira acionada: o Brasil seguiu para o cais!" }, { concluir: true }] },
        { evento: "usou:acionar-esteira", faz: [{ ler: "Confira o despacho no painel antes de acionar a esteira." }] },
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
  conclusao: ["Brasil despachado! O rastreio diz: em alto-mar, chegada em 400 anos úteis.", "Passaporte do Absurdo completo: os seis selos são seus."],
  selo: { id: "brasil-china", nome: "Brasil, Destino China", cor: "#c62835", icone: "🚢" },
};

// ------------------------------------------------------------------ falas por estado

const f = (npc: string, quando: Cond[], linhas: string[]): FalaPorEstado => ({ npc, quando, linhas });
const fez = (id: string): Cond => ({ concluida: id });

const FALAS: FalaPorEstado[] = [
  f("boato", [fez("brasil")], ["O Passaporte do Absurdo está completo! Já posso me aposentar do boato.", "Mandei um áudio de 3 minutos só para comemorar."]),
  f("boato", [fez("cadeado")], ["Cadeado presidencial instalado. A igreja agora tem comprovante, e eu tenho orgulho.", "Quando tudo é carimbado, até o boato fica oficial."]),
  f("boato", [fez("protocolo")], ["Credencial reconhecida! Já sou presidente dos meus próprios áudios.", "A Repartição até pendurou um aviso com o meu nome."]),
  f("pastor", [fez("cadeado")], ["Nova trava na porta: agora é o Cadeado Presidencial, com comprovante.", "A fé continua. Só mudou o protocolo."]),
  f("kiko", [fez("zap")], ["As caixas foram para o lugar certo. O zap ficou desmentido por 5 minutos.", "Agora o estoque é da escola, e a etiqueta é do povo."]),
  f("diretora", [fez("zap")], ["Recebi a caixa e carimbei o recibo. É lápis de cor, e só.", "A placa de recebimento já está na parede do depósito."]),
  f("reitora", [fez("campus")], ["Autorizada! O alvará sonoro está na parede, e o som, no último volume permitido.", "A assembleia virou festa com papel passado."]),
  f("didi", [fez("chave")], ["O armário está aberto e a chave, no gancho. Hein? Já estava no meu bolso!", "Agora todo mundo pede ferramenta emprestada, em ordem alfabética."]),
  f("osvaldo", [fez("chave")], ["O elevador voltou a subir. Meu portão continua patrimônio, mas pelo menos tem martelo.", "Cada ferramenta no seu posto. Que absurdo organizado!"]),
  f("encarregada", [fez("chave")], ["A prensa destravou. A chave inglesa voltou ao crachá, mas agora tem fila de empréstimo.", "Patrimônio de todo mundo, com assinatura."]),
  f("juca", [fez("chave")], ["O elevador está subindo de novo! Assino o livro de visitas por todo mundo.", "Conserto coletivo: até o martelo deixou recibo."]),
  f("despachante", [fez("brasil")], ["O rastreio do Brasil diz: em alto-mar. Previsão de chegada: 400 anos úteis.", "Frete grátis, saudade cobrada à parte."]),
  f("tiao", [fez("cadeado")], ["Aquele cadeado voltou pra igreja. Aqui, só fiado e cachaça presidencial.", "Se precisar de outro cadeado, o balcão tem."]),
];

export const ITENS: Record<string, string> = {
  cadeado: "Cadeado presidencial",
  "caixa-zap": "Caixa do Zap",
  chave: "Chave coletivizada",
  martelo: "Martelo",
  pincel: "Pincel",
  "chave-inglesa": "Chave inglesa",
  "caixa-brasil": "Caixa do Brasil",
};

export const CAMPANHA: Campanha = {
  missoes: [PROTOCOLO, CADEADO, ZAP, CAMPUS, CHAVE, BRASIL],
  falas: FALAS,
  itens: ITENS,
};

/** Todos os selos, na ordem da campanha. */
export const SELOS = CAMPANHA.missoes.map((m) => m.selo);

/** Alvará sonoro e regulamento do frete, usados pelos quadros dos prédios. */
export const QUADROS = {
  alvara: `ALVARÁ SONORO: GRAVE ${SOM.grave} · MÉDIO ${SOM.medio} · AGUDO ${SOM.agudo}`,
  frete: ETIQUETAS.map((e) => `${e.nome.toUpperCase()}: ${e.opcoes[e.certa].toUpperCase()}`).join(" · "),
};
