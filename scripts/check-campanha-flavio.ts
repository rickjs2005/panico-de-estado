// Checa a campanha do Brasil do Flávio sem abrir o navegador: as seis missões com cada decisão, as
// escolhas condicionadas, o relógio de ponto, a catraca e o terminal, a recuperação de saves, a
// Eleição no Cofre nos três tons e o gerente que a cena usa (com a cidade do Flávio ativa).
// Uso: pnpm check:campanha-flavio
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { CAMPANHA_FLAVIO as C, DECISOES_FLAVIO, ITENS_FLAVIO, RELOGIO_CERTO, RELOGIO_RH, SELO_FINAL_FLAVIO } from "../src/world/cidade/flavio/campanha";
import { ANUNCIO, apuraFlavio, marcasDaPracaFlavio, roteiroFlavio } from "../src/world/cidade/flavio/final";
import { PLACES_FLAVIO } from "../src/world/cidade/flavio/places";
import { tomDe } from "../src/world/cidade/missoes/final";
import { completa, disponivel, escolher, estadoVazio, evento, iniciar, pontosVisiveis, sanear, situacao, todasMissoes, type Efeito, type Estado, type Saida, type Valor } from "../src/world/cidade/missoes/motor";
import { estadosIniciais } from "../src/world/cidade/places";

const data = new Map<string, string>();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { localStorage: { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => data.set(k, v), removeItem: (k: string) => data.delete(k) } },
});

// a cena usa a cidade ativa: o gerente e o salvamento precisam do Flávio ligado
import { ativaCidade } from "../src/world/cidade/ativa";
import { CAMPANHA, CIDADE, SELOS } from "../src/world/cidade";
import { Missoes, type Anfitriao } from "../src/world/game/city/Missoes";
import { clearCity, readCity } from "../src/world/cidade/progress";
ativaCidade("flavio");
assert.equal(CIDADE.id, "flavio");
assert.equal(CAMPANHA, C, "a campanha ativa é a do Flávio");

const initialPlaces = () => estadosIniciais(PLACES_FLAVIO);
type Escolha = Extract<Saida, { tipo: "escolha" }>;
const mundo = { e: estadoVazio(), lugares: { ...initialPlaces() } as Record<string, string>, saidas: [] as Saida[], escolha: null as Escolha | null };
const reset = () => {
  mundo.e = estadoVazio();
  mundo.lugares = { ...initialPlaces() } as Record<string, string>;
  mundo.saidas = [];
  mundo.escolha = null;
};
const recarga = (onde: string) => assert.deepEqual(sanear(JSON.parse(JSON.stringify(mundo.e)), C), mundo.e, `recarga fiel em ${onde}`);
const absorve = (saidas: Saida[], fila: string[]) => {
  for (const s of saidas) {
    mundo.saidas.push(s);
    if (s.tipo === "lugar") {
      mundo.lugares[s.place] = s.estado;
      fila.push(`lugar:${s.place}:${s.estado}`);
    } else if (s.tipo === "escolha") mundo.escolha = s;
  }
};
const emite = (ev: string) => {
  const fila = [ev];
  while (fila.length) {
    const ev1 = fila.shift()!;
    const r = evento(C, mundo.e, ev1, mundo.lugares);
    mundo.e = r.estado;
    absorve(r.saidas, fila);
    recarga(ev1);
  }
};
const escolhe = (id: string) => {
  const esc = mundo.escolha;
  assert.ok(esc, `há uma escolha aberta para escolher ${id}`);
  const op = esc.opcoes.find((o) => o.id === id);
  assert.ok(op, `a opção ${id} existe entre ${esc.opcoes.map((o) => o.id).join(", ")}`);
  mundo.escolha = null;
  const fila: string[] = [];
  const r = escolher(C, mundo.e, esc.missao, esc.etapaId, op, mundo.lugares);
  mundo.e = r.estado;
  absorve(r.saidas, fila);
  while (fila.length) {
    const r2 = evento(C, mundo.e, fila.shift()!, mundo.lugares);
    mundo.e = r2.estado;
    absorve(r2.saidas, fila);
  }
  recarga(`escolha ${id}`);
};
const passos = (...ps: string[]) => {
  for (const p of ps) (p.startsWith("?") ? escolhe(p.slice(1)) : emite(p));
};
const comeca = (id: string) => {
  const r = iniciar(C, mundo.e, id, mundo.lugares);
  mundo.e = r.estado;
  absorve(r.saidas, []);
  assert.equal(mundo.e.ativa, id, `missão ${id} começou`);
};
const etapa = () => todasMissoes(C).find((m) => m.id === mundo.e.ativa)?.etapas[mundo.e.etapa].id ?? null;
const opcoesAbertas = () => mundo.escolha?.opcoes.map((o) => o.id) ?? [];
const decisao = (m: string) => mundo.e.flags[`d.${m}`];

/** O relógio de ponto começa na primeira posição: girar até a certa. */
const GIRA = Array.from({ length: RELOGIO_CERTO }, () => "usou:girar-relogio");
const DEZ = ["falou:fl-rosangela", "usou:ler-calendario", ...GIRA, "usou:bater-ponto-rh", "usou:decidir-dezembro"];
const EUA = ["usou:retirar-eua", "usou:declarar-eua", "usou:manifesto-eua", "usou:esteira-eua"];

/** Caminhos mais curtos de cada missão, por decisão. */
const CAMINHO: Record<string, Record<string, string[]>> = {
  chicote: {
    entregou: ["falou:fl-durval", "usou:quadro-metas", "usou:pegar-chicote", "usou:entregar-chicote", "?entregar"],
    vale: ["usou:quadro-metas", "falou:fl-durval", "usou:pegar-chicote", "usou:entregar-chicote", "?vale"],
    alcacuz: ["falou:fl-durval", "usou:quadro-metas", "falou:fl-zeca", "usou:pegar-chicote", "usou:entregar-chicote", "?alcacuz"],
  },
  dezembro: {
    aceitou: [...DEZ, "?aceitar"],
    devolveu: [...DEZ, "?devolver"],
    parcelou: [...DEZ, "?parcelar"],
  },
  catraca: {
    cobrou: ["falou:int-fl-com-posto-recepcionista", "usou:ler-regulamento", "usou:decidir-catraca", "?cobrar"],
    liberou: ["usou:ler-regulamento", "falou:int-fl-com-posto-recepcionista", "usou:decidir-catraca", "?liberar"],
    artigo: ["falou:int-fl-com-posto-recepcionista", "usou:ler-regulamento", "usou:decidir-catraca", "?artigo"],
  },
  leilao: {
    vendeu: ["usou:conferir-lote", "usou:planilha-leilao", "usou:decidir-leilao", "?vender"],
    cancelou: ["usou:conferir-lote", "falou:fl-leiloeiro", "usou:decidir-leilao", "?cancelar"],
    "sem-lance": ["usou:planilha-leilao", "falou:fl-leiloeiro", "usou:decidir-leilao", "?sem-lance"],
  },
  urna: {
    autorizou: ["falou:int-fl-civ-cartorio-atendente", "falou:fl-mesario", "usou:decidir-urna", "?autorizar"],
    rasgou: ["falou:fl-mesario", "falou:int-fl-civ-cartorio-atendente", "usou:decidir-urna", "?rasgar"],
    titulo: ["falou:int-fl-civ-cartorio-atendente", "falou:fl-mesario", "usou:decidir-urna", "?titulo"],
  },
  eua: {
    embarcou: [...EUA, "?embarcar"],
    devolveu: [...EUA, "?devolver"],
    "caixa-vazia": [...EUA, "?vazia"],
  },
};
const joga = (id: string, decisaoId: string) => {
  comeca(id);
  const evs = CAMINHO[id][decisaoId];
  for (const [i, p] of evs.entries()) {
    passos(p);
    if (i < evs.length - 1) assert.equal(mundo.e.ativa, id, `${id}/${decisaoId} ainda não terminou em ${p}`);
  }
  assert.ok(mundo.e.concluidas.includes(id), `${id}/${decisaoId} concluída`);
  assert.equal(mundo.e.ativa, null);
  assert.equal(mundo.e.carregando, null, `${id} não deixa item perdido`);
  assert.equal(decisao(id), decisaoId, `${id}: a decisão ficou registrada`);
};
const ate = (id: string, decisoes: Record<string, string> = {}) => {
  for (const m of C.missoes) {
    if (m.id === id) return;
    joga(m.id, decisoes[m.id] ?? Object.keys(CAMINHO[m.id])[0]);
  }
};

// ---------- 1) cada missão com cada decisão, em ordem ----------
assert.deepEqual(
  C.missoes.map((m) => m.id),
  ["chicote", "dezembro", "catraca", "leilao", "urna", "eua"],
);
for (const m of C.missoes) {
  for (const dec of Object.keys(CAMINHO[m.id])) {
    reset();
    ate(m.id);
    comeca(m.id);
    const outra = C.missoes.find((x) => x.id !== m.id && !mundo.e.concluidas.includes(x.id));
    if (outra) assert.equal(iniciar(C, mundo.e, outra.id, mundo.lugares).estado, mundo.e, "só uma missão ativa por vez");
    joga(m.id, dec);
    assert.ok(mundo.e.selos.includes(m.selo.id), `selo de ${m.id}/${dec}`);
    const antes = JSON.stringify(mundo.e);
    for (const p of CAMINHO[m.id][dec]) if (!p.startsWith("?")) emite(p);
    assert.equal(JSON.stringify(mundo.e), antes, `${m.id}/${dec}: repetir eventos depois de concluída não muda nada`);
  }
}
reset();
for (const m of C.missoes) {
  assert.equal(disponivel(C, mundo.e)?.id, m.id, `a próxima é ${m.id}`);
  joga(m.id, Object.keys(CAMINHO[m.id])[0]);
}
assert.equal(mundo.e.selos.length, 6);
assert.ok(completa(C, mundo.e));
assert.equal(disponivel(C, mundo.e)?.id, "eleicao", "depois da sexta, a Eleição no Cofre");
assert.equal(mundo.saidas.filter((s) => s.tipo === "concluiu" && s.completa).length, 1, "o passaporte completo é anunciado uma vez");

// ---------- 2) investigação: uma pista só não basta ----------
reset();
comeca("chicote");
assert.equal(etapa(), "fabrica", "falar com @PatriotaRaiz (o início) já conta como a primeira etapa");
passos("falou:fl-durval");
assert.equal(etapa(), "fabrica", "uma pista só não basta");
passos("falou:fl-durval");
assert.equal(mundo.e.flags["chicote.n"], 1, "repetir a conversa não conta duas vezes");
passos("usou:quadro-metas");
assert.equal(etapa(), "selaria");
// a brecha do alcaçuz só aparece depois de ouvir o Zeca
passos("usou:pegar-chicote", "usou:entregar-chicote");
assert.deepEqual(opcoesAbertas(), ["entregar", "vale"], "sem a conversa com o Zeca, não há o alcaçuz");
mundo.escolha = null;
passos("falou:fl-zeca", "usou:entregar-chicote");
assert.deepEqual(opcoesAbertas(), ["entregar", "vale", "alcacuz"], "a conversa com o Zeca libera o alcaçuz");
passos("usou:pegar-chicote");
assert.equal(mundo.e.carregando, "chicote", "com a mão ocupada, pegar de novo não duplica");
// leilão: a terceira saída só existe com a regra do patrimônio (planilha ou leiloeiro)
reset();
ate("leilao");
comeca("leilao");
passos("usou:conferir-lote");
assert.equal(etapa(), "conferir", "o lote sozinho não basta");
passos("usou:conferir-lote");
assert.equal(mundo.e.flags["leilao.n"], 1);
passos("falou:fl-leiloeiro", "usou:decidir-leilao");
assert.deepEqual(opcoesAbertas(), ["vender", "cancelar", "sem-lance"]);
assert.ok(mundo.saidas.some((s) => s.tipo === "dialogo" && s.quem === "Leiloeiro Dr. Martelo"), "o leiloeiro tem fala própria");

// ---------- 3) relógio de ponto do RH ----------
reset();
ate("dezembro");
comeca("dezembro");
passos("falou:fl-rosangela", "usou:ler-calendario");
assert.equal(etapa(), "relogio");
passos("usou:bater-ponto-rh");
assert.equal(etapa(), "relogio", "na hora errada, o ponto não abre o guichê");
assert.equal(mundo.e.flags["dezembro.erros"], 1);
const antesGiro = mundo.saidas.length;
passos("usou:girar-relogio");
const giro = mundo.saidas.slice(antesGiro).filter((s) => s.tipo === "ler");
assert.equal(giro.length, 1, "cada giro responde com um balão só");
assert.ok(giro[0].tipo === "ler" && giro[0].texto.includes(RELOGIO_RH[1]), "o balão diz a posição nova");
// TERÇA, 15H é a pegadinha: a placa diz 3h
const quinze = RELOGIO_RH.indexOf("TERÇA, 15H");
while (mundo.e.flags["dezembro.hora"] !== quinze) passos("usou:girar-relogio");
passos("usou:bater-ponto-rh");
assert.equal(etapa(), "relogio", "terça às 15h não é terça às 3h");
for (let i = 0; i < RELOGIO_RH.length; i++) passos("usou:girar-relogio");
assert.equal(mundo.e.flags["dezembro.hora"], quinze, "o relógio dá a volta");
passos("usou:girar-relogio", "usou:bater-ponto-rh");
assert.equal(etapa(), "decidir", "terça, 3h abre o guichê");
// save no guichê sem o ponto batido volta ao relógio
assert.equal(sanear({ ...estadoVazio(), ativa: "dezembro", etapaId: "decidir", flags: {} }, C).etapaId, "relogio");

// ---------- 4) catraca do posto e terminal do porto ----------
for (const [dec, antes, depois] of [
  ["cobrou", "liberada", "cobrando"],
  ["cobrou", "cobrando", "cobrando"],
  ["liberou", "cobrando", "liberada"],
  ["liberou", "liberada", "liberada"],
  ["artigo", "cobrando", "cobrando"],
] as const) {
  reset();
  ate("catraca");
  mundo.lugares["fl-catraca-posto"] = antes;
  joga("catraca", dec);
  assert.equal(mundo.lugares["fl-catraca-posto"], depois, `catraca ${antes} + ${dec} → ${depois}`);
}
reset();
ate("eua");
comeca("eua");
passos("usou:retirar-eua", "usou:declarar-eua", "usou:manifesto-eua");
assert.equal(etapa(), "esteira");
mundo.lugares["fl-terminal-eua"] = "parado";
passos("usou:esteira-eua");
assert.equal(mundo.escolha, null, "terminal parado não abre a escolha");
assert.ok(mundo.saidas.some((s) => s.tipo === "som" && s.id === "erro"));
mundo.lugares["fl-terminal-eua"] = "em-operacao";
passos("usou:esteira-eua");
assert.deepEqual(opcoesAbertas(), ["embarcar", "devolver", "vazia"]);
assert.deepEqual(situacao(C, mundo.e, mundo.lugares)!.lista.map((i) => i.feito), [true], "a checklist mostra o terminal em operação");

// ---------- 5) itens e recuperação de saves ----------
const casos: [Partial<Estado>, string, string][] = [
  [{ ativa: "chicote", etapaId: "entregar", flags: {} }, "selaria", "entregar sem o chicote volta à selaria"],
  [{ ativa: "eua", etapaId: "declarar", flags: {} }, "retirar", "declarar sem a caixa volta ao armazém"],
  [{ ativa: "eua", etapaId: "manifesto", flags: {} }, "retirar", "manifesto sem a caixa volta ao armazém"],
  [{ ativa: "eua", etapaId: "esteira", flags: {} }, "retirar", "esteira sem a caixa volta ao armazém"],
];
for (const [parcial, esperado, texto] of casos) assert.equal(sanear({ ...estadoVazio(), ...parcial }, C).etapaId, esperado, texto);
const comItem = sanear({ ...estadoVazio(), ativa: "eua", etapaId: "esteira", carregando: "caixa-eua", concluidas: ["chicote"], selos: ["chicote-expresso"], flags: { "d.chicote": "vale" } }, C);
assert.equal(comItem.etapaId, "esteira", "com a caixa, o save fica na esteira");
assert.equal(comItem.flags["d.chicote"], "vale", "as decisões já tomadas ficam");
assert.equal(sanear({ ...estadoVazio(), carregando: "cadeado" }, C).carregando, null, "item da outra cidade não existe aqui");

// ---------- 6) decisões: a tabela casa com as escolhas ----------
const efeitosDecide = new Set<string>();
const varre = (fs: Efeito[]) => {
  for (const f of fs) {
    if ("flag" in f && typeof f.flag === "string" && f.flag.startsWith("d.") && "valor" in f) efeitosDecide.add(`${f.flag.slice(2)}:${String(f.valor)}`);
    else if ("se" in f) {
      varre(f.entao);
      varre(f.senao ?? []);
    } else if ("escolha" in f) for (const o of f.escolha.opcoes) varre(o.faz);
  }
};
for (const m of C.missoes) for (const et of m.etapas) for (const r of et.regras) varre(r.faz);
const tabela = new Set(Object.entries(DECISOES_FLAVIO).flatMap(([m, vs]) => Object.keys(vs).map((v) => `${m}:${v}`)));
assert.deepEqual([...efeitosDecide].sort(), [...tabela].sort(), "toda decisão registrada tem texto e lado, e nenhuma é esquecida");
for (const [m, vs] of Object.entries(DECISOES_FLAVIO)) {
  const lados = new Set(Object.values(vs).map((v) => v.lado));
  assert.deepEqual([...lados].sort(), ["meio", "obediente", "rebelde"], `${m}: uma saída de cada lado`);
}

// ---------- 7) Eleição no Cofre: tom, roteiro e persistência ----------
const flagsDe = (lados: Record<string, string>): Record<string, Valor> => Object.fromEntries(Object.entries(lados).map(([m, v]) => [`d.${m}`, v]));
const obediente = flagsDe({ chicote: "entregou", dezembro: "aceitou", catraca: "cobrou", leilao: "vendeu", urna: "autorizou", eua: "embarcou" });
const rebelde = flagsDe({ chicote: "vale", dezembro: "devolveu", catraca: "liberou", leilao: "cancelou", urna: "rasgou", eua: "devolveu" });
const misto = flagsDe({ chicote: "alcacuz", dezembro: "parcelou", catraca: "artigo", leilao: "sem-lance", urna: "titulo", eua: "caixa-vazia" });
assert.equal(tomDe(apuraFlavio(obediente)), "obediencia");
assert.equal(tomDe(apuraFlavio(rebelde)), "ignorado");
assert.equal(tomDe(apuraFlavio(misto)), "misto");
assert.equal(tomDe(apuraFlavio({})), "misto", "save sem decisões cai no meio-termo");
for (const [nome, f] of [["obediente", obediente], ["rebelde", rebelde], ["misto", misto], ["vazio", {}]] as const) {
  const r = roteiroFlavio(f);
  assert.ok(r.passos.some((p) => p.tipo === "fala" && p.linhas.some((l) => l.includes(ANUNCIO))), `${nome}: o anúncio é sempre o mesmo`);
  assert.equal(r.passos.filter((p) => p.tipo === "escolha").length, 2, `${nome}: duas ações curtas do jogador`);
  assert.ok(r.passos.some((p) => p.tipo === "carimbos") && r.passos.some((p) => p.tipo === "aplauso"), `${nome}: tem espetáculo, não só caixa de texto`);
  assert.ok(r.passos.filter((p) => p.tipo === "fala").every((p) => p.tipo === "fala" && p.linhas.length >= 1 && p.linhas.every((l) => l.length < 260)), `${nome}: falas curtas`);
  assert.equal(r.passos[0].tipo, "montar", `${nome}: a praça é montada antes de tudo`);
}
assert.equal(new Set([obediente, rebelde, misto].map((f) => JSON.stringify(roteiroFlavio(f).passos))).size, 3, "as decisões mudam a cerimônia");
const relatorio = (f: Record<string, Valor>) => roteiroFlavio(f).passos.filter((p) => p.tipo === "fala" && p.quem === "Relatório da cidade").flatMap((p) => (p.tipo === "fala" ? p.linhas : []));
assert.equal(relatorio(misto).length, 6, "cada decisão vira uma consequência no relatório");
assert.ok(relatorio(misto).some((l) => /alcaçuz/i.test(l)) && relatorio(rebelde).some((l) => /vale-refeição/i.test(l)));
assert.ok(roteiroFlavio(obediente).passos.some((p) => p.tipo === "escolha" && p.escolha.opcoes.some((o) => o.id === "tiro")), "o tiro pro alto é uma das formas de anunciar");
assert.equal(marcasDaPracaFlavio({}), null, "sem cerimônia não há marcas na praça");
assert.ok(marcasDaPracaFlavio({ "final.tom": "misto", "final.proc": "tiro" })?.decreto.includes("TIRO PRO ALTO"));
assert.ok(marcasDaPracaFlavio({ "final.tom": "obediencia", "final.proc": "leu" })?.decreto.includes("HINO"));
assert.ok(marcasDaPracaFlavio({ "final.tom": "misto", "final.proc": "" })?.decreto.includes("AO VIVO"), "no meio da cerimônia o decreto ainda não diz como foi anunciado");
// a cerimônia pelo motor
reset();
for (const m of C.missoes) joga(m.id, Object.keys(CAMINHO[m.id])[0]);
comeca("eleicao");
assert.equal(etapa(), "tribunal", "o convite de @PatriotaRaiz já avança");
assert.ok(pontosVisiveis(C, mundo.e, mundo.lugares).has("conferir-cofre"));
passos("usou:palanque");
assert.equal(etapa(), "tribunal", "o palanque só vale depois do Tribunal");
passos("usou:conferir-cofre");
assert.equal(etapa(), "palanque");
passos("usou:palanque");
assert.ok(mundo.saidas.some((s) => s.tipo === "cerimonia"), "o palanque pede a cerimônia à cena");
assert.equal(mundo.e.ativa, "eleicao", "a missão só conclui quando a cena avisa que acabou");
mundo.e = { ...mundo.e, flags: { ...mundo.e.flags, "final.tom": "obediencia" } };
passos("cerimonia:fim");
assert.ok(mundo.e.concluidas.includes("eleicao"));
assert.ok(mundo.e.selos.includes(SELO_FINAL_FLAVIO.id));
assert.equal(SELOS.length, 6, "o Passaporte da Ordem continua com seis selos");
assert.ok(!SELOS.some((s) => s.id === SELO_FINAL_FLAVIO.id));
const antesRever = JSON.stringify(mundo.e);
passos("cerimonia:fim", "usou:palanque", "falou:fl-patriota");
assert.equal(JSON.stringify(mundo.e), antesRever, "rever a cerimônia não duplica recompensa nem muda o estado");
assert.equal(disponivel(C, mundo.e), null);

// ---------- 8) o gerente da cena, com o Flávio ativo ----------
{
  clearCity();
  const registro: string[] = [];
  const lugares = { ...initialPlaces() } as Record<string, string>;
  const ref = { escolhe: null as ((id: string | null) => void) | null, fimCerimonia: null as ((m?: Record<string, Valor>) => void) | null };
  const dialogos: { linhas: string[]; fim: () => void }[] = [];
  const host: Anfitriao = {
    lugares: () => lugares,
    aplicaLugar: (p, s) => {
      lugares[p] = s;
      registro.push(`lugar:${p}:${s}`);
      gerente.emite(`lugar:${p}:${s}`);
    },
    ler: (t) => registro.push(`ler:${t.slice(0, 24)}`),
    dialogo: (linhas, _q, fim) => {
      registro.push(`dialogo:${linhas[0].slice(0, 24)}`);
      dialogos.push({ linhas, fim });
    },
    escolha: (_t, _q, opcoes, fim) => {
      registro.push(`escolha:${opcoes.map((o) => o.id).join("/")}`);
      ref.escolhe = fim;
    },
    toast: () => undefined,
    som: (id) => registro.push(`som:${id}`),
    celebrar: (selo, n, comp) => registro.push(`selo:${selo.id}:${n}:${comp}`),
    cerimonia: (_e, fim) => {
      registro.push("cerimonia");
      ref.fimCerimonia = fim;
    },
    mudou: () => registro.push("mudou"),
  };
  const gerente = new Missoes(host, estadoVazio());
  const fecha = () => {
    while (dialogos.length) dialogos.shift()!.fim();
  };
  assert.ok(gerente.relevante("fl-patriota"), "quem dá a primeira missão tem prioridade na conversa");
  assert.ok(gerente.iniciaSe("fl-patriota"));
  fecha();
  assert.equal(gerente.estado.ativa, "chicote");
  gerente.emite("falou:fl-durval");
  gerente.emite("usou:quadro-metas");
  fecha();
  gerente.emite("usou:pegar-chicote");
  assert.equal(gerente.hud().missao?.carregando, ITENS_FLAVIO.chicote, "o HUD mostra o item pelo nome");
  assert.ok(gerente.pontosFora().some((p) => p.id === "entregar-chicote"), "o ponto de entrega aparece na rua");
  gerente.emite("usou:entregar-chicote");
  ref.escolhe!(null);
  assert.equal(gerente.estado.ativa, "chicote", "desistir não decide nada");
  gerente.emite("usou:entregar-chicote");
  ref.escolhe!("vale");
  fecha();
  assert.ok(gerente.estado.concluidas.includes("chicote"));
  assert.ok(registro.some((r) => r.startsWith("selo:chicote-expresso:1:false")), "o selo é celebrado depois das falas");
  assert.equal(readCity().campanha.concluidas[0], "chicote", "o gerente salva na chave da cidade do Flávio");
  assert.ok(data.has(CIDADE.chaveSave) && CIDADE.chaveSave.includes("flavio"));
  assert.equal(gerente.hud().decisoes[0].texto, DECISOES_FLAVIO.chicote.vale.texto);
  assert.equal(gerente.hud().proxima?.quem, "Tonhão, na fila do RH");
  // a cerimônia pelo gerente: as marcas voltam e concluem a missão; depois dá para rever no palanque
  const g3 = new Missoes(host, { ...estadoVazio(), concluidas: C.missoes.map((m) => m.id), selos: C.missoes.map((m) => m.selo.id), flags: misto });
  assert.equal(g3.hud().proxima?.numero, 7);
  g3.iniciaSe("fl-patriota");
  fecha();
  g3.emite("usou:conferir-cofre");
  fecha();
  g3.emite("usou:palanque");
  assert.ok(registro.includes("cerimonia"));
  ref.fimCerimonia!({ "final.tom": "misto", "final.proc": "tiro", "final.voto": "senha" });
  fecha();
  assert.ok(g3.estado.concluidas.includes("eleicao"));
  assert.equal(g3.estado.flags["final.proc"], "tiro", "o que a cerimônia gravou entra no estado");
  assert.equal(g3.hud().selos.length, 6, "o selo final não conta como sétimo selo");
  assert.equal(g3.hud().final, true);
  const rever = g3.pontosFora().find((p) => p.id === "rever-cerimonia");
  assert.ok(rever && Math.hypot(rever.x - 1760, rever.y - 1800) < 1, "rever a cerimônia fica no palanque da Praça do Desfile");
  assert.ok(registro.filter((r) => r.startsWith("selo:eleicao-no-cofre")).length === 1, "o selo final é celebrado uma vez");
  assert.ok(CIDADE.final.falaGeral(g3.estado.flags, 1), "depois da cerimônia os moradores comentam");
  clearCity();
}

// ---------- 9) dados: textos curtos, destinos, selos únicos, nada de travessão nem "boato" ----------
for (const m of todasMissoes(C)) {
  assert.ok(m.etapas.length >= 2, `${m.id}: pelo menos 2 etapas`);
  assert.ok(m.inicio.dialogo.length <= 3, `${m.id}: apresentação curta`);
  for (const et of m.etapas) {
    assert.ok(et.regras.length > 0, `${m.id}/${et.id}: sem regras`);
    assert.ok(et.objetivo.length <= 150, `${m.id}/${et.id}: objetivo longo demais`);
    assert.ok(et.alvo, `${m.id}/${et.id}: sem destino no mapa`);
  }
}
assert.equal(new Set(todasMissoes(C).map((m) => m.selo.id)).size, 7, "seis selos do passaporte e um da cerimônia, todos distintos");
for (const arq of ["src/world/cidade/flavio/campanha.ts", "src/world/cidade/flavio/final.ts", "src/world/cidade/flavio/interiores.ts", "src/world/game/city/flavio/Adornos.ts"]) {
  const txt = readFileSync(arq, "utf8");
  assert.ok(!txt.includes("—"), `${arq}: sem travessão nos textos`);
  assert.ok(!/boato/i.test(txt), `${arq}: sem a palavra boato`);
}

console.log("Campanha do Flávio OK: 6 missões com todas as decisões, relógio de ponto, catraca e terminal, recuperação de saves, Eleição no Cofre em três tons, gerente da cena.");
