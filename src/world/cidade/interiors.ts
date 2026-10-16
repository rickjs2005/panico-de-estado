import { INTERIOR_ZONE } from "./layout";
import type { InteriorDef } from "./types";

/**
 * Interiores: salas montadas numa faixa abaixo da cidade, fora da câmera da rua.
 * Cada interior aponta para o prédio de onde se entra; a porta de saída fica
 * no meio da parede de baixo. Para criar um interior novo basta acrescentar um item aqui
 * e marcar `interior` no prédio.
 */

const Y = INTERIOR_ZONE.y;

export const INTERIORS: InteriorDef[] = [
  {
    id: "bar",
    name: "Bar do Tião",
    building: "com-bar-tiao",
    room: { x: 300, y: Y, w: 640, h: 430 },
    wallH: 120,
    wall: "#e9b949",
    floor: "piso-bar",
    entry: { x: 620, y: Y + 370 },
    exit: { x: 620, y: Y + 405 },
    props: [
      { kind: "prateleira", x: 520, y: Y + 118 },
      { kind: "balcao", x: 520, y: Y + 186 },
      { kind: "banqueta", x: 430, y: Y + 214 },
      { kind: "banqueta", x: 500, y: Y + 214 },
      { kind: "banqueta", x: 570, y: Y + 214 },
      { kind: "jukebox", x: 860, y: Y + 160 },
      { kind: "mesaBar", x: 420, y: Y + 320 },
      { kind: "mesaBar", x: 800, y: Y + 300 },
      { kind: "mesaBar", x: 820, y: Y + 380 },
    ],
    npcs: [
      {
        id: "tiao",
        district: "comercial",
        name: "Tião do bar",
        look: "tiao",
        x: 540,
        y: Y + 150,
        facing: "front",
        lines: ["Cachaça presidencial: combustível exclusivo deste desenho!", "Fiado? Neste Brasil, fiado é política pública."],
      },
      { id: "fregues", district: "comercial", name: "Freguês fiel", look: "osvaldo", x: 790, y: Y + 335, facing: "side", flip: true, lines: ["Eu vim só pra um gole. Faz três decretos."] },
    ],
    posters: [
      { text: "CACHAÇA PRESIDENCIAL", x: 400, y: Y + 50, color: "#fff4ce", bg: "#c62835" },
      { text: "FIADO SÓ AMANHÃ", x: 800, y: Y + 50, color: "#1e1424", bg: "#fffaf0" },
    ],
    cachaca: { id: "cachaca-bar", name: "Balcão do Tião", district: "comercial", x: 640, y: Y + 232 },
  },
  {
    id: "reparticao",
    name: "Repartição de Carimbos",
    building: "civ-reparticao",
    room: { x: 1200, y: Y, w: 700, h: 440 },
    wallH: 120,
    wall: "#cfd8c8",
    floor: "piso-reparticao",
    entry: { x: 1550, y: Y + 380 },
    exit: { x: 1550, y: Y + 415 },
    props: [
      { kind: "painelSenha", x: 1550, y: Y + 70, text: "SENHA 0666" },
      { kind: "guiche", x: 1330, y: Y + 175, variant: "1" },
      { kind: "guiche", x: 1550, y: Y + 175, variant: "2" },
      { kind: "guiche", x: 1770, y: Y + 175, variant: "3" },
      { kind: "cadeiraFila", x: 1380, y: Y + 300 },
      { kind: "cadeiraFila", x: 1440, y: Y + 300 },
      { kind: "cadeiraFila", x: 1500, y: Y + 300 },
      { kind: "cadeiraFila", x: 1620, y: Y + 300 },
      { kind: "cadeiraFila", x: 1680, y: Y + 300 },
      { kind: "pilhaPapel", x: 1260, y: Y + 360 },
      { kind: "pilhaPapel", x: 1850, y: Y + 260 },
    ],
    npcs: [
      {
        id: "atendente",
        district: "civico",
        name: "Atendente Dona Protocolo",
        look: "atendente",
        x: 1550,
        y: Y + 140,
        facing: "front",
        lines: ["Seu boato foi protocolado. Prazo: trezentos anos úteis.", "Sem senha, sem carimbo. Sem carimbo, sem senha."],
      },
      { id: "na-fila-1", district: "civico", name: "Cidadão na fila", look: "didi", x: 1440, y: Y + 312, facing: "back", lines: ["Estou na fila desde o boato anterior."] },
      { id: "na-fila-2", district: "civico", name: "Cidadã na fila", look: "func2", x: 1620, y: Y + 312, facing: "back", lines: ["Vim pedir a segunda via do meu portão coletivizado."] },
    ],
    posters: [
      { text: "SEU BOATO FOI PROTOCOLADO", x: 1330, y: Y + 50, color: "#fffaf0", bg: "#3a6b5a" },
      { text: "AGUARDE: 300 ANOS ÚTEIS", x: 1780, y: Y + 50, color: "#1e1424", bg: "#ffd23f" },
    ],
  },
];

export function interiorById(id: string): InteriorDef | undefined {
  return INTERIORS.find((i) => i.id === id);
}
