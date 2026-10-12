import type { RouteDef } from "../types";

/**
 * Rota A — Brasil hipotético em que Lula venceu.
 * O Presidente é uma versão caricata e hipotética: ele não tem falas inventadas.
 * Tudo o que se "diz" vem de assessores, teleprompters, cortes e grupos fictícios.
 */
export const lula: RouteDef = {
  id: "lula",
  name: "Brasil: Governo Lula",
  rumor: "O governo vai estatizar o churrasco de domingo.",
  tagline: "O boato da vez: o churrasco de domingo vai ser estatizado. Não vai. Tente explicar isso.",
  ministry: "Ministério da Tranquilidade Pública",
  intro: [
    "Brasil hipotético. Lula venceu. O país acordou dividido em dois grupos de WhatsApp.",
    "Você é estagiário(a) do Ministério da Tranquilidade Pública. É o seu primeiro dia.",
    "Sua missão: manter o país calmo.",
    "O país não foi avisado.",
  ],
  cast: [
    { name: "Otávio Brisa", role: "Ministro da Tranquilidade Pública. Não dorme desde a posse." },
    { name: "Jéssica Ventania", role: "Assessora de Narrativas Urgentes. Sua chefe." },
    { name: "Wellington Ponto", role: "Assessor de Desmentidos Preventivos." },
    { name: "Coach Rubens Muralha", role: "Influenciador de oposição. Vende proteção contra tudo." },
    { name: "@CompanheiraVibes", role: "Influenciadora governista. Vende calma em kits." },
    { name: "Família Reunida 🇧🇷❤️", role: "237 membros. Ninguém sabe quem criou." },
  ],
  rounds: [
    {
      id: "boato",
      kind: "chat",
      channel: "Família Reunida 🇧🇷❤️",
      meta: "237 membros · Tia Nilza está digitando…",
      time: "06:12",
      lines: [
        { tone: "system", text: "Hoje" },
        {
          tone: "forward",
          from: "Tia Nilza",
          text: "URGENTE!!! O governo vai ESTATIZAR o churrasco de domingo. Picanha só com senha. Linguiça por ordem alfabética. REPASSEM ANTES QUE APAGUEM",
        },
        { tone: "fiction", text: "Boato inventado para este jogo. No grupo, ninguém leu este aviso." },
        { from: "Tio Osvaldo", text: "eu sabia. ontem o açougueiro me olhou diferente" },
        { from: "Prima Kelly", text: "fonte?" },
        { from: "Tia Nilza", text: "a fonte é que estão escondendo a fonte" },
        { tone: "dm", from: "Jéssica Ventania", text: "Você tá nesse grupo? Ótimo. Descobre de onde veio isso. Você tem 4 minutos." },
      ],
      choices: [
        {
          id: "audio",
          label: "Mandar um áudio de 7 minutos explicando tudo",
          effects: { panico: 10, popularidade: -5, caos: 10 },
          result: [
            "Ninguém ouviu o áudio.",
            "Tio Osvaldo ouviu em 2x e entendeu “estatizar a picanha em dobro”.",
            "Agora existem duas versões do boato.",
          ],
        },
        {
          id: "figurinha",
          label: "Responder com uma figurinha piscando “FAKE”",
          effects: { panico: 5, popularidade: 5, caos: 5 },
          result: [
            "A figurinha foi encaminhada 4.000 vezes.",
            "Em outro grupo chegou só a palavra “FAKE” em cima de uma foto de picanha.",
            "Conclusão nacional: a picanha é falsa. Fila no açougue.",
          ],
        },
        {
          id: "silenciar",
          label: "Silenciar o grupo por 8 horas",
          effects: { panico: -5, caos: 5 },
          ignore: true,
          result: ["Silêncio.", "Por 11 segundos."],
          aftershock: { from: "Tia Nilza", text: "Vi que você silenciou o grupo. Tá escondendo o quê?" },
        },
      ],
    },
    {
      id: "pronunciamento",
      kind: "speech",
      channel: "Rede Nacional",
      meta: "Pronunciamento oficial · ao vivo",
      time: "21:00",
      lines: [
        { tone: "aside", text: "O Presidente (versão caricata e hipotética) se posiciona. O teleprompter trava antes da primeira palavra." },
        { tone: "msg", from: "Teleprompter", text: "“…e quero deixar claro: o governo NÃO vai estatizar o churrasco…”" },
        { from: "Wellington Ponto", text: "Quem escreveu esse texto?" },
        { from: "Jéssica Ventania", text: "Você." },
        { tone: "system", text: "Um corte de 4 segundos já circula: “o governo vai estatizar o churrasco”." },
        { tone: "headline", from: "Portal Alerta Total", text: "ADMITIU." },
      ],
      variants: [
        {
          meter: "panico",
          min: 35,
          lines: [{ tone: "aside", text: "Você jura que o teleprompter piscou para você." }],
        },
      ],
      choices: [
        {
          id: "nota",
          label: "Soltar uma nota oficial explicando o corte",
          effects: { panico: 5, popularidade: -5, caos: 5 },
          result: [
            "A nota tem 14 parágrafos.",
            "O “NÃO” aparece no parágrafo 13.",
            "Ninguém chega ao parágrafo 13.",
          ],
        },
        {
          id: "inteiro",
          label: "Postar o vídeo inteiro, sem cortes (48 minutos)",
          effects: { panico: -5, popularidade: -10, caos: 5 },
          result: [
            "Visualizações do vídeo inteiro: 212.",
            "Visualizações do corte: 19 milhões.",
            "Comentário mais curtido do vídeo inteiro: “resume aí”.",
          ],
        },
        {
          id: "ironia",
          label: "Dizer que foi ironia",
          effects: { panico: 10, popularidade: 5, caos: 15 },
          result: [
            "Metade do país entendeu como piada.",
            "A outra metade entendeu como ameaça.",
            "A base defendeu a ironia, a não-ironia e a pergunta “que ironia?” ao mesmo tempo.",
          ],
        },
      ],
    },
    {
      id: "influencer",
      kind: "live",
      channel: "🔴 AO VIVO · Coach Rubens Muralha",
      meta: "38 mil assistindo · 2,1 mi corações",
      time: "22:40",
      lines: [
        { from: "Rubens Muralha", text: "Eles vão vir pela sua grelha. Primeiro a grelha. Depois o carvão. Depois o domingo." },
        {
          from: "Rubens Muralha",
          text: "Por isso eu criei a GRELHA BLINDADA ANTI-ESTATIZAÇÃO. 12x de R$ 49,70. Os 100 primeiros ganham avental com cadeado.",
        },
        { tone: "comment", from: "@zecarlos_raiz", text: "comprei duas, uma é grelha reserva" },
        { tone: "comment", from: "@marcia.alerta", text: "o cadeado é pra quê?" },
        { tone: "comment", from: "@rubensmuralha", text: "pra quando eles vierem, Márcia" },
        {
          tone: "msg",
          from: "@CompanheiraVibes (story)",
          text: "Gente, contra o pânico: KIT CALMA POPULAR 🌿 chá, incenso e adesivo “NÃO É VERDADE”. Cupom TRANQUILIDADE10",
        },
        { tone: "dm", from: "Jéssica Ventania", text: "Os dois estão lucrando com o mesmo boato. Faz alguma coisa." },
      ],
      variants: [
        {
          meter: "caos",
          min: 45,
          lines: [{ tone: "system", text: "Estoque da grelha blindada: esgotado. Estoque do Kit Calma: esgotado. Estoque de calma: —" }],
        },
      ],
      choices: [
        {
          id: "denunciar",
          label: "Denunciar a grelha blindada",
          effects: { panico: 10, caos: 10 },
          result: [
            "A denúncia viralizou.",
            "As vendas subiram 900%.",
            "Rubens agradeceu “ao governo pela divulgação” e lançou a versão Pro.",
          ],
        },
        {
          id: "contratar",
          label: "Contratar a @CompanheiraVibes para a campanha oficial",
          effects: { panico: -5, popularidade: 5, caos: 10 },
          result: [
            "O kit agora tem selo do ministério.",
            "Rubens grava: “O governo está vendendo calma. Desconfie de quem vende calma.”",
            "Ele vende desconfiança a R$ 97.",
          ],
        },
        {
          id: "comprar",
          label: "Comprar uma grelha. Só por precaução.",
          effects: { panico: 15, popularidade: -5, caos: 5 },
          result: [
            "Chegou em 2 dias, com um bilhete: “Você fez a coisa certa.”",
            "Você já não sabe de que lado está.",
            "A grelha também não.",
          ],
        },
      ],
    },
    {
      id: "coletiva",
      kind: "press",
      channel: "Coletiva de Imprensa",
      meta: "Ministério da Tranquilidade Pública",
      time: "10:05",
      lines: [
        { tone: "aside", text: "O ministro Otávio Brisa sobe ao púlpito. Atrás dele, dois assessores cochicham alto demais." },
        { from: "Otávio Brisa", text: "Viemos aqui para negar, de forma categórica…" },
        { from: "Wellington Ponto", text: "(cochicho) …a versão da picanha" },
        { from: "Jéssica Ventania", text: "(cochicho) não, a da linguiça. A da picanha a gente negou ontem" },
        { from: "Wellington Ponto", text: "(cochicho) negar duas vezes é admitir" },
        { from: "Jéssica Ventania", text: "(cochicho) não negar é admitir" },
        { from: "Repórter · Jornal da Véspera", text: "Ministro, o senhor nega o quê, exatamente?" },
        { tone: "aside", text: "O ministro olha para você." },
      ],
      choices: [
        {
          id: "nega-tudo",
          label: "Sussurrar: “nega as duas”",
          effects: { panico: 5, popularidade: 5, caos: 10 },
          result: [
            "“Negamos a picanha e a linguiça.”",
            "Manchete: MINISTRO CITA LINGUIÇA EM REDE NACIONAL.",
            "A linguiça, que era assunto de grupo, agora é pauta de Estado.",
          ],
        },
        {
          id: "economia",
          label: "Sussurrar: “não nega nada, fala de economia”",
          effects: { panico: 10, popularidade: -5, caos: 5 },
          result: [
            "O ministro fala 9 minutos sobre inflação.",
            "Corte viral: “ministro foge da pergunta sobre picanha”.",
            "O preço da picanha sobe por puro suspense.",
          ],
        },
        {
          id: "porta",
          label: "Puxar o ministro pela porta lateral",
          effects: { panico: 10, popularidade: -10, caos: 15 },
          result: [
            "A porta lateral dava para outra coletiva: a do Partido da Ordem Absoluta, que negava ter espalhado o boato.",
            "O ministro e a oposição negaram juntos, no mesmo púlpito.",
            "Foi o momento mais unido do ano. Ninguém soube o que fazer com isso.",
          ],
        },
      ],
    },
    {
      id: "silencio",
      kind: "home",
      channel: "Sala de estar",
      meta: "Celular virado para baixo",
      time: "23:47",
      lines: [
        { tone: "aside", text: "Você chega em casa. Silencia tudo. Vira o celular para baixo." },
        { tone: "aside", text: "A casa fica quieta. A geladeira zune. É bom." },
        { tone: "aside", text: "Então a TV liga. Ou você ligou e esqueceu. Você não lembra." },
        { tone: "headline", from: "Jornal da Véspera", text: "Governo nega que vá estatizar o churrasco" },
        { tone: "headline", from: "Jornal da Véspera", text: "Governo nega que vá estatizar o churrasco" },
        { tone: "headline", from: "Jornal da Véspera", text: "Governo nega que vá estatizar o churrasco" },
        { tone: "aside", text: "A cada repetição, a palavra “nega” parece mais baixa." },
      ],
      variants: [
        {
          meter: "panico",
          min: 50,
          lines: [
            { tone: "headline", from: "Jornal da Véspera", text: "Governo        vá estatizar o churrasco" },
            { tone: "aside", text: "Dessa vez não teve “nega”. Ou teve?" },
          ],
        },
      ],
      choices: [
        {
          id: "desligar-tv",
          label: "Desligar a TV",
          effects: { panico: 5 },
          ignore: true,
          result: [
            "A TV desliga.",
            "O celular, virado para baixo, ilumina a mesa.",
            "47 notificações. Todas com a mesma prévia: “Você viu isso?”",
          ],
        },
        {
          id: "volume",
          label: "Aumentar o volume para ouvir direito",
          effects: { panico: 15, caos: 5 },
          result: [
            "No volume máximo, você ouve o “nega”.",
            "O vizinho, do outro lado da parede, ouve só “estatizar”.",
            "Ele já mandou no grupo do prédio. Com o áudio da sua TV como prova.",
          ],
        },
        {
          id: "imovel",
          label: "Ficar imóvel até a TV parar sozinha",
          effects: { panico: 10 },
          ignore: true,
          result: [
            "Ela não para.",
            "Às 3h12, entra a previsão do tempo.",
            "Previsão: 80% de chance de boato, com pancadas de desmentido.",
          ],
        },
      ],
    },
    {
      id: "meme",
      kind: "feed",
      channel: "Em alta agora",
      meta: "As duas coisas ao mesmo tempo",
      time: "08:30",
      lines: [
        {
          tone: "headline",
          from: "Comunicado oficial · Ministério da Tranquilidade Pública",
          text: "O churrasco segue 100% livre, privado e domingueiro.",
        },
        { tone: "meme", from: "@memesdoapocalipse", text: "Uma picanha com crachá do governo: “eu trabalho aqui agora”." },
        { tone: "system", text: "Os dois viralizaram juntos. 41% acreditam nos dois. 12% acham que o meme é o comunicado." },
        { from: "Jéssica Ventania", text: "O Presidente quer saber qual dos dois a gente defende." },
        { from: "Otávio Brisa", text: "Ele quer saber qual está ganhando." },
      ],
      variants: [
        {
          meter: "popularidade",
          max: 40,
          lines: [{ tone: "dm", from: "Wellington Ponto", text: "Pesquisa nova: o povo confia mais na Tia Nilza do que no ministério." }],
        },
      ],
      choices: [
        {
          id: "oficial",
          label: "Defender o comunicado oficial",
          effects: { panico: 5, popularidade: -5, caos: 5 },
          result: [
            "O comunicado oficial vira meme.",
            "Agora são dois memes.",
            "O meme original solta nota negando ser comunicado.",
          ],
        },
        {
          id: "abracar",
          label: "Abraçar o meme: o perfil oficial posta a picanha de crachá",
          effects: { panico: -5, popularidade: 15, caos: 15 },
          result: [
            "Engajamento recorde.",
            "Metade dos comentários: “kkkkkk”. A outra metade: “ELES ADMITIRAM”.",
            "Os dois lados curtiram o mesmo post.",
          ],
        },
        {
          id: "terceiro",
          label: "Criar um terceiro meme explicando os dois",
          effects: { panico: 10, caos: 20 },
          result: [
            "O meme explicativo tem legenda, seta e nota de rodapé.",
            "Viraliza como prova de que tem algo escondido.",
            "Comentário fixado: “por que tanta explicação?”",
          ],
        },
      ],
    },
    {
      id: "ligacao",
      kind: "call",
      channel: "Chamada recebida",
      meta: "Celular",
      time: "03:33",
      lines: [
        { tone: "aside", text: "O celular toca. O número na tela é o seu." },
        { tone: "system", text: "Chamada de: VOCÊ" },
      ],
      variants: [
        {
          meter: "panico",
          min: 45,
          lines: [{ tone: "aside", text: "Por baixo do toque, baixinho: “você viu isso? você viu isso?”" }],
        },
      ],
      choices: [
        {
          id: "atender",
          label: "Atender",
          effects: { panico: 10, caos: 5 },
          result: [
            "Uma voz igual à sua lê, sem pausa, todas as mensagens que você ignorou hoje.",
            "No final, pergunta: “Encaminhar para todos?”",
            "Você não lembra de ter respondido. O celular lembra.",
          ],
        },
        {
          id: "recusar",
          label: "Recusar",
          effects: { panico: 5 },
          ignore: true,
          result: [
            "A chamada vira mensagem de voz.",
            "A mensagem de voz vira áudio no grupo da família.",
            "Tia Nilza: “áudio estranho, vou repassar”.",
          ],
        },
        {
          id: "desligar",
          label: "Desligar o celular de vez",
          effects: { panico: -10, caos: 5 },
          ignore: true,
          result: [
            "Tela preta.",
            "Pela primeira vez no dia, silêncio de verdade.",
            "No reflexo da tela preta, uma notificação continua acesa.",
          ],
        },
      ],
    },
  ],
  notifications: [
    { app: "Família Reunida 🇧🇷❤️", text: "Tio Osvaldo: olha isso aqui" },
    { app: "Jéssica Ventania", text: "CADÊ VOCÊ" },
    { app: "Portal Alerta Total", text: "AO VIVO: grelhas somem dos mercados" },
    { app: "Rubens Muralha", text: "está ao vivo: “eles vêm pela grelha”" },
    { app: "@CompanheiraVibes", text: "últimas unidades do Kit Calma 🌿" },
    { app: "Família Reunida 🇧🇷❤️", text: "Tia Nilza encaminhou uma mensagem (47x)" },
    { app: "Grupo do Prédio", text: "alguém sabe se o churrasco do salão vai ser estatizado?" },
    { app: "Jornal da Véspera", text: "Governo nega. Oposição nega que governo negue." },
    { app: "Wellington Ponto", text: "negar de novo ou não negar?" },
    { app: "Número desconhecido", text: "Você viu isso?" },
  ],
  ticker: [
    "Jornal da Véspera: Governo nega boato do churrasco",
    "Portal Alerta Total: Governo não nega o suficiente",
    "Rádio Fim de Tarde: Picanha sobe 3% por ansiedade",
    "Portal Alerta Total: Picanha some das prateleiras; prateleiras negam",
    "Jornal da Véspera: Especialistas pedem calma; calma esgota",
    "Instituto Termômetro: 50% têm medo; os outros 50% têm medo dos 50%",
  ],
  endings: {
    calma: {
      title: "Calma Oficial",
      lines: [
        "Decreto publicado: o país está oficialmente calmo.",
        "Instituto Termômetro: 87% dos brasileiros se dizem calmos. 91% dizem que os outros não estão.",
        "O churrasco de domingo acontece normalmente.",
        "Ninguém come. Todo mundo fotografa a picanha, para provar.",
      ],
      kicker: "Notificações não lidas: subindo.",
    },
    comissao: {
      title: "A Comissão da Comissão",
      lines: [
        "O governo vence a crise.",
        "Para que nunca se repita, cria a Comissão Especial de Investigação do Boato do Churrasco.",
        "Na primeira sessão, a oposição pede uma comissão para investigar quem criou a comissão.",
        "Aprovada por unanimidade. Primeira vez no ano que todos concordam.",
      ],
      kicker: "Próxima reunião: indefinidamente.",
    },
    transmite: {
      title: "Tudo Transmite",
      lines: [
        "Você desliga o celular.",
        "A TV liga sozinha: “Você viu isso?”",
        "O rádio do vizinho: “Você viu isso?”",
        "O micro-ondas apita três vezes. No visor: VIU?",
        "O relógio da cozinha marca 3:33 há três dias.",
      ],
      kicker: "Desligar não é uma opção. É um conteúdo.",
    },
    silencio: {
      title: "Saiu do Grupo",
      lines: [
        "Você sai do grupo “Família Reunida 🇧🇷❤️”.",
        "Tia Nilza cria “Família Reunida 2 🇧🇷❤️ (sem traidores)”.",
        "Você é adicionado(a) automaticamente.",
        "Descrição do grupo: “aqui a gente fala a verdade que escondem de você”.",
      ],
      kicker: "Você agora está em 238 grupos.",
    },
    outro: {
      title: "O Outro Brasil",
      lines: [
        "Exausto(a), você abre um portal do outro Brasil, aquele em que o outro lado venceu.",
        "Lá, o boato é sobre pão francês.",
        "O grupo da família é o mesmo. A tia é a mesma. O medo é o mesmo.",
        "Só muda a cor do alerta.",
      ],
      kicker: "Outra rota disponível. O medo agradece a visita.",
    },
  },
};
