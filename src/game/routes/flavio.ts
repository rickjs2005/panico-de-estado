import type { RouteDef } from "../types";

/**
 * Rota B — Brasil hipotético em que Flávio Bolsonaro venceu.
 * O Presidente é uma versão caricata e hipotética: ele não tem falas inventadas.
 * Tudo o que se "diz" vem de assessores, teleprompters, cortes e grupos fictícios.
 * Estrutura espelhada da rota A, para manter a simetria da sátira.
 */
export const flavio: RouteDef = {
  id: "flavio",
  name: "Brasil: Governo Flávio",
  rumor: "O governo vai proibir o pão francês.",
  tagline: "O boato da vez: o pão francês vai ser proibido por ser “estrangeiro”. Não vai. Tente explicar isso.",
  ministry: "Ministério da Ordem Comunicacional",
  intro: [
    "Brasil hipotético. Flávio venceu. O país acordou dividido em dois grupos de WhatsApp.",
    "Você é estagiário(a) do Ministério da Ordem Comunicacional. É o seu primeiro dia.",
    "Sua missão: manter o país calmo.",
    "O país não foi avisado.",
  ],
  cast: [
    { name: "Heitor Fortaleza", role: "Ministro da Ordem Comunicacional. Não pisca desde a posse." },
    { name: "Kaique Trincheira", role: "Assessor de Estratégia Digital. Seu chefe." },
    { name: "Wanderley Coturno", role: "Assessor de Desmentidos Táticos." },
    { name: "Professora Lívia Resistência", role: "Influenciadora de oposição. Vende cursos contra tudo." },
    { name: "@PatriotaRaiz.Oficial", role: "Influenciador governista. Vende pão com selo." },
    { name: "Família Reunida 🇧🇷❤️", role: "237 membros. Ninguém sabe quem criou." },
  ],
  rounds: [
    {
      id: "boato",
      kind: "chat",
      channel: "Família Reunida 🇧🇷❤️",
      meta: "237 membros · Tio Osvaldo está digitando…",
      time: "06:12",
      lines: [
        { tone: "system", text: "Hoje" },
        {
          tone: "forward",
          from: "Tio Osvaldo",
          text: "URGENTE!!! O governo vai PROIBIR O PÃO FRANCÊS por ser estrangeiro. Só pão de forma nacional, com hino na embalagem. PADARIAS FECHAM SEGUNDA. REPASSEM",
        },
        { tone: "fiction", text: "Boato inventado para este jogo. No grupo, ninguém leu este aviso." },
        { from: "Tia Nilza", text: "e o pão de queijo? é mineiro, tá liberado?" },
        { from: "Prima Kelly", text: "fonte?" },
        { from: "Tio Osvaldo", text: "a fonte é a padaria, que já tá olhando pros lados" },
        { tone: "dm", from: "Kaique Trincheira", text: "Você tá nesse grupo? Ótimo. Descobre quem começou. Você tem 4 minutos." },
      ],
      choices: [
        {
          id: "audio",
          label: "Mandar um áudio de 7 minutos explicando tudo",
          effects: { panico: 10, popularidade: -5, caos: 10 },
          result: [
            "Ninguém ouviu o áudio.",
            "Vô Didi ouviu no volume máximo, na fila da padaria.",
            "A fila virou estoque. O estoque virou manchete.",
          ],
        },
        {
          id: "figurinha",
          label: "Responder com uma figurinha piscando “FAKE”",
          effects: { panico: 5, popularidade: 5, caos: 5 },
          result: [
            "A figurinha foi encaminhada 4.000 vezes.",
            "Em outro grupo chegou só a palavra “FAKE” em cima de uma foto de baguete.",
            "Conclusão nacional: a baguete é falsa. Fila na padaria.",
          ],
        },
        {
          id: "silenciar",
          label: "Silenciar o grupo por 8 horas",
          effects: { panico: -5, caos: 5 },
          ignore: true,
          result: ["Silêncio.", "Por 11 segundos."],
          aftershock: { from: "Tio Osvaldo", text: "Silenciou o grupo, né? Quem cala consente." },
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
        { tone: "msg", from: "Teleprompter", text: "“…e quero deixar claro: ninguém vai PROIBIR o pão francês…”" },
        { from: "Wanderley Coturno", text: "Quem escreveu esse texto?" },
        { from: "Kaique Trincheira", text: "Você." },
        { tone: "system", text: "Um corte de 4 segundos já circula: “vai proibir o pão francês”." },
        { tone: "headline", from: "Portal Resistência Já", text: "CONFIRMOU." },
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
            "A nota tem 14 parágrafos e um brasão.",
            "O “NINGUÉM” aparece no parágrafo 13.",
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
            "Comentário mais curtido do vídeo inteiro: “resume aí, patriota”.",
          ],
        },
        {
          id: "ironia",
          label: "Dizer que foi brincadeira",
          effects: { panico: 10, popularidade: 5, caos: 15 },
          result: [
            "Metade do país entendeu como piada.",
            "A outra metade entendeu como ameaça.",
            "A base defendeu a piada, a ameaça e a pergunta “que piada?” ao mesmo tempo.",
          ],
        },
      ],
    },
    {
      id: "influencer",
      kind: "live",
      channel: "🔴 AO VIVO · Professora Lívia Resistência",
      meta: "38 mil assistindo · 2,1 mi corações",
      time: "22:40",
      lines: [
        { from: "Lívia Resistência", text: "Hoje é o pão francês. Amanhã, o croissant. Depois, a democracia folhada." },
        {
          from: "Lívia Resistência",
          text: "Por isso abri o curso PANIFICAÇÃO DE RESISTÊNCIA. 12x de R$ 49,70. Bônus: fermento clandestino.",
        },
        { tone: "comment", from: "@ana.consciente", text: "me inscrevi duas vezes, uma é matrícula reserva" },
        { tone: "comment", from: "@beto.critico", text: "o fermento é pra quê?" },
        { tone: "comment", from: "@liviaresistencia", text: "pra quando eles vierem, Beto" },
        {
          tone: "msg",
          from: "@PatriotaRaiz.Oficial (story)",
          text: "Contra a histeria: PÃO DE FORMA SOBERANO 🇧🇷 com selo verde-amarelo. Cupom ORDEM10",
        },
        { tone: "dm", from: "Kaique Trincheira", text: "Os dois estão lucrando com o mesmo boato. Faz alguma coisa." },
      ],
      variants: [
        {
          meter: "caos",
          min: 45,
          lines: [{ tone: "system", text: "Vagas do curso: esgotadas. Pão Soberano: esgotado. Estoque de calma: —" }],
        },
      ],
      choices: [
        {
          id: "denunciar",
          label: "Denunciar o curso clandestino",
          effects: { panico: 10, caos: 10 },
          result: [
            "A denúncia viralizou.",
            "As matrículas subiram 900%.",
            "Lívia agradeceu “ao regime pela divulgação” e abriu turma avançada.",
          ],
        },
        {
          id: "contratar",
          label: "Contratar o @PatriotaRaiz.Oficial para a campanha oficial",
          effects: { panico: -5, popularidade: 5, caos: 10 },
          result: [
            "O pão agora tem selo do ministério.",
            "Lívia grava: “O governo está vendendo pão. Desconfie de quem vende pão.”",
            "Ela vende desconfiança a R$ 97.",
          ],
        },
        {
          id: "comprar",
          label: "Fazer o curso. Só por precaução.",
          effects: { panico: 15, popularidade: -5, caos: 5 },
          result: [
            "Primeira aula: como esconder uma baguete dentro de um guarda-chuva.",
            "Você já não sabe de que lado está.",
            "A baguete também não.",
          ],
        },
      ],
    },
    {
      id: "coletiva",
      kind: "press",
      channel: "Coletiva de Imprensa",
      meta: "Ministério da Ordem Comunicacional",
      time: "10:05",
      lines: [
        { tone: "aside", text: "O ministro Heitor Fortaleza sobe ao púlpito. Atrás dele, dois assessores cochicham alto demais." },
        { from: "Heitor Fortaleza", text: "Estamos aqui para negar, com firmeza…" },
        { from: "Wanderley Coturno", text: "(cochicho) …a versão do pão francês" },
        { from: "Kaique Trincheira", text: "(cochicho) não, a do sonho de padaria. A do pão a gente negou ontem" },
        { from: "Wanderley Coturno", text: "(cochicho) negar duas vezes é admitir" },
        { from: "Kaique Trincheira", text: "(cochicho) não negar é admitir" },
        { from: "Repórter · Jornal da Véspera", text: "Ministro, o senhor nega o quê, exatamente?" },
        { tone: "aside", text: "O ministro olha para você." },
      ],
      choices: [
        {
          id: "nega-tudo",
          label: "Sussurrar: “nega os dois”",
          effects: { panico: 5, popularidade: 5, caos: 10 },
          result: [
            "“Negamos o pão francês e o sonho.”",
            "Manchete: GOVERNO NEGA O SONHO DOS BRASILEIROS.",
            "O sonho, que era doce de padaria, agora é pauta de Estado.",
          ],
        },
        {
          id: "economia",
          label: "Sussurrar: “não nega nada, fala de segurança”",
          effects: { panico: 10, popularidade: -5, caos: 5 },
          result: [
            "O ministro fala 9 minutos sobre fronteiras.",
            "Corte viral: “ministro admite fronteira com o pão”.",
            "O preço do pão sobe por puro suspense.",
          ],
        },
        {
          id: "porta",
          label: "Puxar o ministro pela porta lateral",
          effects: { panico: 10, popularidade: -10, caos: 15 },
          result: [
            "A porta lateral dava para outra coletiva: a do Movimento Progresso Talvez, que negava ter espalhado o boato.",
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
        { tone: "headline", from: "Jornal da Véspera", text: "Governo garante que não vai proibir o pão francês" },
        { tone: "headline", from: "Jornal da Véspera", text: "Governo garante que não vai proibir o pão francês" },
        { tone: "headline", from: "Jornal da Véspera", text: "Governo garante que não vai proibir o pão francês" },
        { tone: "aside", text: "A cada repetição, o “não” parece mais baixo." },
      ],
      variants: [
        {
          meter: "panico",
          min: 50,
          lines: [
            { tone: "headline", from: "Jornal da Véspera", text: "Governo garante que      vai proibir o pão francês" },
            { tone: "aside", text: "Dessa vez não teve “não”. Ou teve?" },
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
            "No volume máximo, você ouve o “não”.",
            "A vizinha, do outro lado da parede, ouve só “proibir”.",
            "Ela já mandou no grupo do condomínio. Com o áudio da sua TV como prova.",
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
            "Previsão: 80% de chance de boato, com rajadas de desmentido vindas do litoral.",
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
          from: "Comunicado oficial · Ministério da Ordem Comunicacional",
          text: "O pão francês segue livre, crocante e soberano.",
        },
        { tone: "meme", from: "@memesdoapocalipse", text: "Uma baguete de óculos escuros fugindo do país num barquinho: “fui”." },
        { tone: "system", text: "Os dois viralizaram juntos. 41% acreditam nos dois. 12% acham que o meme é o comunicado." },
        { from: "Kaique Trincheira", text: "O Presidente quer saber qual dos dois a gente defende." },
        { from: "Heitor Fortaleza", text: "Ele quer saber qual está ganhando." },
      ],
      variants: [
        {
          meter: "popularidade",
          max: 40,
          lines: [{ tone: "dm", from: "Wanderley Coturno", text: "Pesquisa nova: o povo confia mais no Tio Osvaldo do que no ministério." }],
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
          label: "Abraçar o meme: o perfil oficial posta a baguete no barquinho",
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
            "Tio Osvaldo: “áudio estranho, vou repassar”.",
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
    { app: "Família Reunida 🇧🇷❤️", text: "Tia Nilza: olha isso aqui" },
    { app: "Kaique Trincheira", text: "CADÊ VOCÊ" },
    { app: "Portal Resistência Já", text: "AO VIVO: baguetes somem das padarias" },
    { app: "Lívia Resistência", text: "está ao vivo: “eles vêm pelo croissant”" },
    { app: "@PatriotaRaiz.Oficial", text: "últimas unidades do Pão Soberano 🇧🇷" },
    { app: "Família Reunida 🇧🇷❤️", text: "Tio Osvaldo encaminhou uma mensagem (47x)" },
    { app: "Grupo do Condomínio", text: "alguém sabe se a padaria da esquina vai virar quartel?" },
    { app: "Jornal da Véspera", text: "Governo garante. Oposição garante que governo garante demais." },
    { app: "Wanderley Coturno", text: "negar de novo ou não negar?" },
    { app: "Número desconhecido", text: "Você viu isso?" },
  ],
  ticker: [
    "Jornal da Véspera: Governo garante o pão francês",
    "Portal Resistência Já: Governo garante demais",
    "Rádio Fim de Tarde: Padarias registram fila preventiva",
    "Portal Resistência Já: Baguete é vista cruzando a fronteira; Itamaraty não comenta",
    "Jornal da Véspera: Especialistas pedem calma; calma esgota",
    "Instituto Termômetro: 50% têm medo; os outros 50% têm medo dos 50%",
  ],
  endings: {
    calma: {
      title: "Calma Oficial",
      lines: [
        "Decreto publicado: o país está oficialmente calmo, em ordem e unido.",
        "Instituto Termômetro: 87% dos brasileiros se dizem calmos. 91% dizem que os outros não estão.",
        "As padarias abrem normalmente.",
        "Ninguém come o pão. Todo mundo fotografa, para provar.",
      ],
      kicker: "Notificações não lidas: subindo.",
    },
    comissao: {
      title: "A Comissão da Comissão",
      lines: [
        "O governo vence a crise.",
        "Para que nunca se repita, cria a Comissão Especial de Investigação do Boato do Pão.",
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
        "O rádio da vizinha: “Você viu isso?”",
        "A cafeteira goteja em código: V… I… U…",
        "O relógio da cozinha marca 3:33 há três dias.",
      ],
      kicker: "Desligar não é uma opção. É um conteúdo.",
    },
    silencio: {
      title: "Saiu do Grupo",
      lines: [
        "Você sai do grupo “Família Reunida 🇧🇷❤️”.",
        "Tio Osvaldo cria “Família Reunida 2 🇧🇷❤️ (só os de verdade)”.",
        "Você é adicionado(a) automaticamente.",
        "Descrição do grupo: “aqui a gente fala a verdade que escondem de você”.",
      ],
      kicker: "Você agora está em 238 grupos.",
    },
    outro: {
      title: "O Outro Brasil",
      lines: [
        "Exausto(a), você abre um portal do outro Brasil, aquele em que o outro lado venceu.",
        "Lá, o boato é sobre churrasco.",
        "O grupo da família é o mesmo. O tio é o mesmo. O medo é o mesmo.",
        "Só muda a cor do alerta.",
      ],
      kicker: "Outra rota disponível. O medo agradece a visita.",
    },
  },
};
