import { makeEndings, makeFinale } from "../finale";
import { enter, exit, hold, move, nar, pause, phone, react, say, set, sfx } from "../script";
import type { Beat, RouteDef } from "../types";

/**
 * Universo A — Lula venceu um segundo turno fictício e os boatos ganharam vida.
 * Lula aparece como caricatura explicitamente fictícia. As falas são invenções
 * da obra, não citações. A piada mira o autoritarismo imaginado, a burocracia
 * e a trapalhada dos personagens, nunca fiéis, religiões ou nacionalidades.
 */

const KIT = {
  edition: "Kit Sobrevivência Edição Igreja Fechada",
  contents: "cadeado de bolso, senha infinita e um pão de queijo de emergência",
  otherEdition: "Kit Edição Brasil Exportado",
  delivery: "às 6h12, pelo grupo da família",
  gift: "um cadeado que não cabe em nada",
  otherFear: "o Brasil ir embora numa caixa",
};

/* ------------------------------------------------------------------ */
/* Episódio A — Operação Amém                                          */
/* ------------------------------------------------------------------ */

const fimDaIgreja: Beat[] = [
  say("voce", "Tia, vamos? Ainda tenho que tomar café.", "fala"),
  say("nilza", "Vamos. Mas antes vou mandar no grupo. COM FOTO.", "comemora"),
  phone("Família Reunida 🇧🇷❤️", "Tia Nilza: VEJAM!!! ELE VEIO MESMO 😱 (foto tremida de um cadeado)"),
];

const operacaoAmem: RouteDef["episodes"][number] = {
  id: "amem",
  title: "Episódio 1 — Operação Amém",
  objective: "Levar a Tia Nilza ao culto e voltar para casa.",
  backdrop: "igreja",
  scene: { porta: "fechada" },
  beats: [
    nar("Universo fictício: Lula venceu. Aqui, os boatos ganharam vida."),
    enter("voce", 10, { mood: "neutro" }),
    enter("nilza", 26, { mood: "neutro", scale: 0.95 }),
    enter("fiel", 41, { mood: "neutro", scale: 0.85 }),
    enter("pastor", 58, { mood: "fala" }),
    say("pastor", "Senhor, abençoa este culto, que hoje vai ser curtinho porque tem jogo às onze.", "fala"),
    say("nilza", "Amém. Vai ser curtinho mesmo. Deu no grupo que hoje fecham as igrejas.", "preocupado"),
    say("voce", "Tia, isso é boato.", "deboche"),
    sfx("porta"),
    set("porta", "aberta"),
    react({ voce: "susto", nilza: "susto", fiel: "susto", pastor: "susto" }),
    enter("lula", 80, { from: "right", mood: "carrega", holding: "cadeado", scale: 1.05 }),
    enter("fiscal", 94, { from: "right", mood: "neutro", holding: "formulario", scale: 0.85 }),
    pause(700),
    nar("Silêncio. Alguém derruba um hinário. Ninguém pega."),
    say("lula", "Bom dia, minha gente! Vim fechar a igreja. É rapidinho, coisa de cinco minutos.", "fala"),
    {
      t: "choice",
      prompt: "O presidente acabou de entrar com um cadeado gigante. Reação rápida:",
      options: [
        { label: "Esconder a Tia Nilza atrás do hinário", beats: [say("nilza", "Não precisa. Eu QUERO ver.", "comemora")] },
        { label: "Perguntar se ele pegou senha", beats: [say("lula", "Senha? Eu sou o presidente.", "deboche"), say("pastor", "Aqui todo mundo pega senha. Até o Espírito Santo.", "deboche")] },
        { label: "Filmar para o grupo da família", beats: [phone("Família Reunida 🇧🇷❤️", "Você: (vídeo de 3 segundos, tremido, de um cadeado)")] },
      ],
    },
    say("nilza", "EU SABIA! Pela primeira vez o grupo acertou. Estou assustada E orgulhosa.", "desespero"),
    say("pastor", "Presidente, com todo respeito: o senhor tem hora marcada?", "deboche"),
    say("fiscal", "Fiscal Odair Carimbo, Ministério do Amém. Viemos aplicar o cadeado oficial.", "fala"),
    move("lula", 84),
    set("cadeado", "porta"),
    hold("lula", null),
    nar("O cadeado é maior que a porta."),
    say("lula", "Quem comprou esse cadeado? Era pra fechar uma igreja, não o Maracanã.", "aponta"),
    say("fiscal", "Licitação, presidente. Ganhou o maior.", "preocupado"),
    say("pastor", "Para fechar, precisa pegar senha.", "deboche"),
    say("fiscal", "Quem entrega a senha?", "preocupado"),
    say("pastor", "A igreja que o senhor acabou de fechar.", "deboche"),
    react({ lula: "susto", fiscal: "desespero", fiel: "deboche" }),
    say("fiscal", "Então precisamos do carimbo FECHA-SE. Fica no Departamento de Fechamentos.", "fala"),
    say("pastor", "No subsolo. Desta igreja. Abre depois do louvor.", "comemora"),
    set("placa", "DEPTO. DE FECHAMENTOS ↓ (DENTRO DA IGREJA)"),
    say("lula", "Você aí, de camisa azul. Me ajuda a achar esse carimbo?", "aponta"),
    say("voce", "Eu só vim trazer a minha tia.", "susto"),
    nar("A mesa do departamento está soterrada. E continua chegando papel."),
    {
      t: "task",
      task: {
        kind: "find",
        objective: "Ache um carimbo na mesa antes que ela desabe. Tem mais de um: o que você escolher vai ser usado.",
        timer: 45,
        every: 2300,
        need: 1,
        collapseAt: 18,
        start: [
          { id: "c1", prop: "carimbo-fecha", label: "Carimbo FECHA-SE", target: "fecha" },
          { id: "c2", prop: "carimbo-abre", label: "Carimbo ABRE-SE", target: "abre" },
          { id: "c3", prop: "carimbo-amem", label: "Carimbo AMÉM", target: "amem" },
          { id: "j1", prop: "boleto", label: "Conta de luz", quip: "Vence hoje. A igreja não pode fechar antes de pagar a luz." },
          { id: "j2", prop: "hinario", label: "Hinário", quip: "Página 42. O fiscal anotou o número, por precaução." },
          { id: "j3", prop: "formulario", label: "Formulário 27-B", quip: "Para abrir o 27-B, preencha o 27-A. Que está dentro do 27-B." },
          { id: "j4", prop: "senha", label: "Senha nº ∞", quip: "Senha chamada: 3. Faltam infinitas." },
          { id: "j5", prop: "vela", label: "Vela", quip: "Acesa desde 1987. Ninguém sabe quem acendeu." },
          { id: "j6", prop: "papel", label: "Ata da reunião sobre a ata", quip: "Conclusão da ata: marcar outra reunião para discutir a ata." },
          { id: "j7", prop: "caneca", label: "Caneca do fiscal", quip: "“Melhor Fiscal do Mês”. O mês não foi informado." },
        ],
        incoming: [
          { id: "i1", prop: "formulario", label: "Requerimento de requerimento", quip: "Requer que se requeira. Deferido em parte." },
          { id: "i2", prop: "boleto", label: "Taxa de fechamento", quip: "Para fechar, pague. Para pagar, abra." },
          { id: "i3", prop: "papel", label: "Abaixo-assinado contra o abaixo-assinado", quip: "Assinado pelas mesmas 40 pessoas." },
          { id: "i4", prop: "senha", label: "Outra senha", quip: "Senha nº ∞ + 1." },
          { id: "i5", prop: "hinario", label: "Hinário de bolso", quip: "Edição de bolso. O bolso é de gigante." },
          { id: "i6", prop: "caneca", label: "Café do louvor", quip: "Frio. O louvor está demorando." },
        ],
      },
      branches: {
        fecha: [
          hold("lula", "carimbo-fecha"),
          sfx("carimbo"),
          set("placa", "DEPTO. DE FECHAMENTOS: FECHADO"),
          set("carimbo", "FECHA-SE"),
          nar("O presidente carimba. O carimbo fecha… o Departamento de Fechamentos."),
          say("fiscal", "Fechamos o departamento que fecha. Agora nada mais pode ser fechado.", "desespero"),
          say("lula", "Nem a igreja?", "susto"),
          say("fiscal", "Principalmente a igreja.", "desespero"),
          set("cadeado", null),
          set("porta", "aberta"),
          say("pastor", "Glória! Culto liberado até segunda ordem. E a ordem está fechada.", "comemora"),
          react({ nilza: "comemora", fiel: "comemora", voce: "comemora" }),
          { t: "outcome", result: "vitoria", reward: { prop: "carimbo-fecha", name: "Carimbo FECHA-SE", blurb: "Fechou o único departamento capaz de fechar alguma coisa." } },
          ...fimDaIgreja,
        ],
        abre: [
          hold("lula", "carimbo-abre"),
          sfx("carimbo"),
          set("carimbo", "ABRE-SE"),
          set("cadeado", null),
          nar("O presidente carimba o ABRE-SE. A igreja, que já estava aberta, fica aberta em dobro."),
          say("pastor", "Dois cultos ao mesmo tempo, um em cada metade. Deus me deu um segundo microfone.", "comemora"),
          say("nilza", "Vou nos dois.", "comemora"),
          say("fiscal", "O governo vai precisar criar o Ministério do Amém 2.", "desespero"),
          say("lula", "Inaugura amanhã. Sem cadeado.", "deboche"),
          { t: "outcome", result: "vitoria", reward: { prop: "carimbo-abre", name: "Carimbo ABRE-SE", blurb: "Abre o que já está aberto. Muito procurado em repartições." } },
          ...fimDaIgreja,
        ],
        amem: [
          hold("lula", "carimbo-amem"),
          sfx("carimbo"),
          set("carimbo", "AMÉM"),
          nar("O carimbo bate na mesa: AMÉM. A igreja inteira responde por reflexo."),
          say("lula", "…Amém.", "susto"),
          say("fiscal", "O presidente disse amém. Juridicamente, isso é uma bênção. Não posso fechar uma bênção.", "preocupado"),
          say("pastor", "Então fica para depois do louvor. O louvor tem três horas.", "deboche"),
          say("lula", "Três horas? Eu espero. Mas sentado.", "preocupado"),
          { t: "outcome", result: "meio", reward: { prop: "carimbo-amem", name: "Carimbo AMÉM", blurb: "Nenhum documento resiste a ele." } },
          ...fimDaIgreja,
        ],
        desabou: [
          sfx("falha"),
          nar("A mesa desaba. Uma chuva de formulários cobre o cadeado, o fiscal e parte do presidente."),
          react({ lula: "desespero", fiscal: "desespero", pastor: "susto", nilza: "susto" }),
          say("fiscal", "Igreja fechada para balanço… do papel.", "desespero"),
          say("pastor", "Pode ser. Mas o papel é nosso. O senhor pegou senha?", "deboche"),
          say("lula", "Me vê uma senha, então.", "preocupado"),
          { t: "outcome", result: "desastre", reward: { prop: "formulario", name: "Formulário 27-B", blurb: "Ainda não se sabe para que serve. Nem ele." } },
          ...fimDaIgreja,
        ],
        tempo: [
          nar("Deu onze horas. O culto acaba e começa o jogo."),
          say("lula", "Fechar fica para depois. Alguém sabe o placar?", "preocupado"),
          say("pastor", "Um a zero pra nós.", "comemora"),
          say("fiscal", "Anotado: igreja fechada por motivo de futebol.", "preocupado"),
          { t: "outcome", result: "desastre", reward: { prop: "senha", name: "Senha nº ∞", blurb: "Será chamada um dia. Talvez." } },
          ...fimDaIgreja,
        ],
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Episódio B — O Último Pão de Queijo                                 */
/* ------------------------------------------------------------------ */

const fimDoCafe: Beat[] = [
  set("pao", "fatia"),
  nar("Enquanto isso, o último pão de queijo esfriou. Ninguém comeu. Ninguém nunca come o último."),
  phone("Família Reunida 🇧🇷❤️", "Tia Nilza: alguém sabe se pão de queijo dividido engorda?"),
];

const paoDeQueijo: RouteDef["episodes"][number] = {
  id: "pao",
  title: "Episódio 2 — O Último Pão de Queijo",
  objective: "Tomar café da manhã. Só isso.",
  backdrop: "cozinha",
  beats: [
    enter("voce", 14, { from: "left", mood: "neutro" }),
    enter("didi", 36, { mood: "neutro", scale: 0.95 }),
    say("didi", "Bom dia. Sobrou um pão de queijo. O último.", "preocupado"),
    say("voce", "O último da casa?", "fala"),
    say("didi", "Do país. Deu no rádio.", "susto"),
    sfx("buzina"),
    enter("fiscal", 70, { from: "right", mood: "fala", holding: "calculadora" }),
    say("fiscal", "Bom dia! Odair Carimbo, agora no Departamento de Divisões Iguais.", "fala"),
    say("fiscal", "Este é o último pão de queijo do Brasil. Será dividido igualmente entre 214 milhões de pessoas.", "aponta"),
    {
      t: "choice",
      prompt: "O fiscal saca a calculadora. Reação rápida:",
      options: [
        { label: "Esconder o pão de queijo no bolso", beats: [say("fiscal", "Bolso detectado. O bolso também será dividido.", "aponta")] },
        { label: "Pedir a sua parte já", beats: [say("fiscal", "Claro. Sua parte é esta.", "fala"), nar("Ele entrega um farelo invisível. Você agradece, por educação.")] },
        { label: "Oferecer café ao fiscal", beats: [say("fiscal", "Aceito. Mas o café é de todos, então vou tomar o de todos.", "comemora")] },
      ],
    },
    say("didi", "Eu fico com a parte de cima.", "deboche"),
    set("maquina", "on"),
    say("fiscal", "Apresento a Nacionalizadora 3000. Ela carimba tudo que estiver sem dono.", "comemora"),
    sfx("carimbo"),
    set("geladeira", "DO POVO"),
    react({ voce: "susto", didi: "susto" }),
    nar("A geladeira agora é do povo. O povo não sabe abrir a geladeira."),
    enter("lula", 88, { from: "right", mood: "comemora", scale: 0.95 }),
    say("lula", "Vim inaugurar o primeiro pedacinho! Cadê a fita?", "comemora"),
    say("fiscal", "A fita foi nacionalizada, presidente.", "preocupado"),
    say("lula", "Então eu inauguro de boca. Inaugurado!", "fala"),
    say("voce", "Eu só queria um café.", "desespero"),
    {
      t: "task",
      task: {
        kind: "assign",
        objective: "Monte seu café antes que a máquina carimbe tudo: pó, filtro e água na cafeteira; o resto na sua mesa.",
        timer: 45,
        spoil: { every: 6500, label: "Nacionalizadora 3000" },
        slots: [
          { id: "cafeteira", label: "Cafeteira" },
          { id: "mesa", label: "Sua mesa" },
        ],
        items: [
          { id: "po", prop: "po-cafe", label: "Pó de café", goal: "cafeteira", wrong: "Pó de café no prato? Isso é um ritual, não um café." },
          { id: "agua", prop: "agua", label: "Água", goal: "cafeteira", wrong: "Água no pires. O Vô Didi bebeu achando que era chá." },
          { id: "filtro", prop: "papel", label: "Filtro de papel", goal: "cafeteira", wrong: "Filtro na mesa. O fiscal achou que era um formulário e protocolou." },
          { id: "xicara", prop: "cafe", label: "Xícara", goal: "mesa", wrong: "Uma xícara dentro da cafeteira. A cafeteira ficou com ciúme." },
          { id: "pao", prop: "pao-queijo", label: "Pão de queijo", goal: "mesa", wrong: "Pão de queijo na cafeteira virou sopa. O fiscal anotou a receita." },
          { id: "manteiga", prop: "manteiga", label: "Manteiga", goal: "mesa", wrong: "Manteiga na cafeteira: “café cremoso”, dizem os gourmets. Só eles." },
        ],
      },
      branches: {
        otimo: [
          nar("O café fica pronto. Você toma o primeiro gole livre do dia."),
          react({ voce: "comemora", didi: "comemora" }),
          say("fiscal", "Terminei a conta! Cada brasileiro tem direito a 0,0000000047 pão de queijo.", "comemora"),
          say("didi", "E quem fica com o resto?", "deboche"),
          say("fiscal", "O resto é zero vírgula… nada. Por isso fica comigo. Para fins de auditoria.", "deboche"),
          hold("fiscal", "pao-queijo"),
          sfx("carimbo"),
          nar("A Nacionalizadora 3000 carimba a si mesma e abre uma reclamação contra si mesma."),
          say("lula", "Isso é que é eficiência.", "comemora"),
          { t: "outcome", result: "vitoria", reward: { prop: "cafe", name: "Xícara de café livre", blurb: "Ainda quente. Por pouco." } },
          ...fimDoCafe,
        ],
        medio: [
          nar("Você salva metade do café. O resto agora pertence à União, inclusive o açúcar."),
          say("didi", "Meu pires foi tombado como patrimônio histórico.", "desespero"),
          say("lula", "Belo pires. Vai pro museu.", "comemora"),
          say("fiscal", "Visitação de terça a domingo. O pires não pode ser usado.", "fala"),
          { t: "outcome", result: "meio", reward: { prop: "cafeteira", name: "Cafeteira do Povo", blurb: "Faz café para 214 milhões. Uma xícara por vez." } },
          ...fimDoCafe,
        ],
        ruim: [
          sfx("carimbo"),
          nar("A máquina carimba tudo. Inclusive você."),
          react({ voce: "desespero", didi: "susto" }),
          say("fiscal", "Cidadão, a partir de agora o senhor é do povo.", "fala"),
          say("voce", "Eu já era do povo.", "desespero"),
          say("fiscal", "Agora com carimbo. Fica mais oficial.", "deboche"),
          { t: "outcome", result: "desastre", reward: { prop: "carimbo-estado", name: "Carimbo DO POVO (na testa)", blurb: "Sai com água e sabão. Em 2030." } },
          ...fimDoCafe,
        ],
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Episódio C — Brasil em Entrega                                      */
/* ------------------------------------------------------------------ */

const fimDaEntrega: Beat[] = [
  say("sueli", "Senha 47!", "fala"),
  say("voce", "Sou eu! Vim buscar minha encomenda.", "comemora"),
  say("sueli", "Ah. Foi enviada para a China por engano. Junto com uma tentativa de país.", "deboche"),
];

const brasilEmEntrega: RouteDef["episodes"][number] = {
  id: "entrega",
  title: "Episódio 3 — Brasil em Entrega",
  objective: "Buscar sua encomenda nos Correios Universais. Senha 47.",
  backdrop: "correios",
  scene: { mapa: "dentro" },
  beats: [
    enter("voce", 8, { from: "left", mood: "neutro", scale: 0.9 }),
    enter("sueli", 84, { mood: "neutro" }),
    say("sueli", "Senha 47? Hoje só tem um atendimento na frente. Um grandão.", "deboche"),
    enter("jessica", 40, { from: "right", mood: "preocupado", holding: "etiqueta" }),
    enter("lula", 62, { from: "right", mood: "aponta" }),
    say("lula", "Moça, quero mandar isso para a China. Com cuidado, que é frágil. Principalmente o Congresso.", "aponta"),
    {
      t: "choice",
      prompt: "Tem um país inteiro na sua frente na fila. Reação rápida:",
      options: [
        { label: "“Vai demorar?”", beats: [say("sueli", "Depende. Quantos estados ele tem?", "deboche"), say("jessica", "Vinte e seis. E um distrito.", "preocupado")] },
        { label: "Oferecer fita adesiva", beats: [say("lula", "Fita é bom! Gruda o Sul, que ele vive querendo sair.", "comemora")] },
        { label: "Tirar uma selfie com o mapa", beats: [phone("Família Reunida 🇧🇷❤️", "Você: (selfie com o Brasil numa caixa) eu tô bem, gente")] },
      ],
    },
    say("sueli", "Conteúdo?", "neutro"),
    say("jessica", "Declaramos como acessório de cozinha.", "fala"),
    say("sueli", "Um continente?", "deboche"),
    say("jessica", "Um subcontinente. Vem com tampa.", "preocupado"),
    say("sueli", "Endereço?", "neutro"),
    say("lula", "China. Do lado da… China.", "fala"),
    set("etiqueta", "FALTA: rua, número, CEP e bom senso"),
    sfx("pop"),
    set("mapa", "fugindo"),
    nar("Nesse momento, os estados começam a escapar da caixa."),
    react({ lula: "susto", jessica: "desespero", sueli: "susto", voce: "susto" }),
    say("jessica", "O Sul saiu primeiro! Disse que já tinha avisado.", "desespero"),
    say("lula", "Segura o Nordeste! O Nordeste é meu CEP preferido!", "desespero"),
    say("sueli", "Sem o mapa inteiro, eu não consigo nem recusar direito.", "preocupado"),
    say("lula", "Companheiro da senha 47, dá uma mão?", "aponta"),
    {
      t: "task",
      task: {
        kind: "assign",
        layout: "mapa",
        objective: "Devolva cada região ao seu lugar na caixa. Toque na peça e depois no espaço certo (ou arraste).",
        timer: 50,
        forgive: 1,
        slots: [
          { id: "norte", label: "Norte", at: { x: 30, y: 28 } },
          { id: "nordeste", label: "Nordeste", at: { x: 76, y: 36 } },
          { id: "centro-oeste", label: "Centro-Oeste", at: { x: 50, y: 52 } },
          { id: "sudeste", label: "Sudeste", at: { x: 70, y: 63 } },
          { id: "sul", label: "Sul", at: { x: 54, y: 82 } },
        ],
        items: [
          { id: "norte", prop: "norte", label: "Norte", goal: "norte", wrong: "O Norte não cabe aí. O Norte quase não cabe em lugar nenhum." },
          { id: "nordeste", prop: "nordeste", label: "Nordeste", goal: "nordeste", wrong: "O Nordeste recusou o encaixe e pediu vista para o mar." },
          { id: "centro-oeste", prop: "centro-oeste", label: "Centro-Oeste", goal: "centro-oeste", wrong: "O Centro-Oeste fica no centro. Está no nome." },
          { id: "sudeste", prop: "sudeste", label: "Sudeste", goal: "sudeste", wrong: "O Sudeste achou que aí era o centro de tudo. Não era." },
          { id: "sul", prop: "sul", label: "Sul", goal: "sul", wrong: "O Sul diz que aí faz calor demais." },
        ],
      },
      branches: {
        otimo: [
          set("mapa", "dentro"),
          set("etiqueta", "CONTEÚDO: acessório de cozinha"),
          nar("O Brasil volta inteiro para a caixa. Ainda sobra espaço."),
          say("sueli", "Encomenda recusada.", "neutro"),
          say("lula", "Por quê?!", "susto"),
          say("sueli", "O remetente declarou um continente como acessório de cozinha. Isso é fraude de categoria.", "deboche"),
          say("jessica", "E se a gente declarar como utensílio?", "preocupado"),
          say("sueli", "Aí tem que caber na gaveta. Cabe?", "deboche"),
          sfx("carimbo"),
          set("carimbo", "DEVOLVER AO REMETENTE"),
          say("lula", "E quem é o remetente?", "preocupado"),
          say("sueli", "O Brasil.", "comemora"),
          react({ lula: "susto", jessica: "desespero", voce: "comemora" }),
          { t: "outcome", result: "vitoria", reward: { prop: "etiqueta", name: "Etiqueta “Devolver ao remetente”", blurb: "Remetente e destinatário são o mesmo país. Ninguém sabe quem paga o frete." } },
          ...fimDaEntrega,
        ],
        medio: [
          set("mapa", "dentro"),
          nar("O mapa volta meio torto: o Sudeste ficou de lado e o Norte de ponta-cabeça."),
          say("sueli", "Assim não passa no raio-X. Parece mapa desenhado de memória.", "preocupado"),
          say("lula", "Mas é o Brasil!", "fala"),
          say("sueli", "É exatamente o que um contrabandista diria.", "deboche"),
          sfx("carimbo"),
          set("carimbo", "RECUSADO"),
          { t: "outcome", result: "meio", reward: { prop: "mapa-brasil", name: "Mapa do Brasil (montado torto)", blurb: "O Sudeste continua de lado. Ninguém notou." } },
          ...fimDaEntrega,
        ],
        ruim: [
          set("mapa", null),
          nar("O tempo acaba. Os estados saem pela porta dos Correios e pegam um ônibus de volta para casa."),
          say("jessica", "O Brasil voltou sozinho para o lugar dele.", "susto"),
          say("lula", "Então não precisa mandar.", "deboche"),
          say("sueli", "Precisa pagar a taxa de tentativa de envio de país.", "deboche"),
          sfx("carimbo"),
          set("carimbo", "TAXA: 1 BRASIL"),
          exit("lula", "right"),
          exit("jessica", "right"),
          { t: "outcome", result: "desastre", reward: { prop: "caixa", name: "Caixa vazia (tamanho Brasil)", blurb: "Serve de casa. Ou de país." } },
          ...fimDaEntrega,
        ],
      },
    },
  ],
};

export const lula: RouteDef = {
  id: "lula",
  name: "Brasil: Governo Lula",
  tagline: "O Lula caricato fecha uma igreja, divide o último pão de queijo e tenta despachar o Brasil para a China.",
  errands: ["Levar a Tia Nilza ao culto", "Tomar café da manhã", "Buscar uma encomenda"],
  president: "lula",
  episodes: [operacaoAmem, paoDeQueijo, brasilEmEntrega],
  finale: makeFinale(KIT),
  endings: makeEndings(KIT),
};
