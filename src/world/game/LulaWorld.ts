import * as Phaser from "phaser";
import { CACHACA_STOPS } from "../map";
import { BRASIL_PARA_CHINA, CAMPUS_LIBERADO, KIT_DO_ZAP, OPERACAO_CADEADO } from "../mission";
import { RES } from "./bake";

const FONT = "system-ui, sans-serif";

/** Mudanças visuais exclusivas deste Brasil fictício, restauradas pelas missões salvas. */
export class LulaWorld {
  readonly flags = new Set<string>();

  constructor(private scene: Phaser.Scene) {
    for (const [x, y] of [[1080, 448], [1510, 420], [200, 500], [1600, 1155], [1960, 1170], [1470, 1780]]) this.flag(x, y);
    this.sign(1290, 410, "COMUNISMO ATIVADO", "#c83b47", "#fff4ce");
    this.sign(125, 405, "MINISTÉRIO DO BOATO", "#fff1cb", "#ab2c3a");
    this.sign(2015, 1190, "PROPRIEDADE COLETIVA", "#c83b47", "#fff4ce");
    for (const p of CACHACA_STOPS) {
      scene.add.image(p.x, p.y - 25, "cachaca").setScale(1 / RES.small).setDepth(p.y + 1);
      this.sign(p.x, p.y - 57, "CACHAÇA · ENERGIA", "#ffdf7d", "#592b36", 10);
    }
    this.sign(2210, 1025, "ASSINATURAS PRESIDENCIAIS", "#fff1cb", "#305c5a", 10);
  }

  private sign(x: number, y: number, text: string, backgroundColor: string, color: string, size = 13) {
    return this.scene.add.text(x, y, text, {
      fontFamily: FONT, fontSize: `${size}px`, fontStyle: "900", backgroundColor, color,
      padding: { x: 7, y: 4 }, resolution: 3,
    }).setOrigin(0.5).setDepth(y + 220);
  }

  private flag(x: number, y: number, china = false) {
    const g = this.scene.add.graphics().setDepth(y);
    g.lineStyle(3, 0x3b3243).lineBetween(x, y, x, y - 85);
    g.fillStyle(0xcf3547).fillTriangle(x, y - 85, x + 55, y - 75, x, y - 49);
    this.scene.add.text(x + 10, y - 83, china ? "★" : "☭", {
      fontFamily: FONT, fontSize: "23px", color: "#ffe181", resolution: 2,
    }).setDepth(y + 1);
  }

  apply(id: string, animated: boolean) {
    if (this.flags.has(id)) return;
    this.flags.add(id);
    const scene = this.scene;
    if (id === OPERACAO_CADEADO.id) {
      const chain = scene.add.graphics().setDepth(345);
      chain.lineStyle(6, 0x34303c).lineBetween(1245, 308, 1315, 339).lineBetween(1315, 308, 1245, 339);
      const lock = scene.add.image(1280, 326, "cadeado").setScale(1.2 / RES.small).setDepth(346);
      this.sign(1280, 264, "IGREJA FECHADA POR DECRETO", "#b62f3e", "#fff4ce", 11);
      this.sign(1530, 353, "DECRETO Nº 666", "#fff1cb", "#ab2c3a", 11);
      if (animated) scene.tweens.add({ targets: lock, y: { from: 190, to: 326 }, duration: 650, ease: "Bounce.easeOut" });
    } else if (id === KIT_DO_ZAP.id) {
      const colors = [0xea5366, 0xe9a64c, 0xf3de66, 0x5dbf82, 0x558ad2, 0x9966b7];
      const g = scene.add.graphics().setDepth(1720.5);
      colors.forEach((c, i) => g.fillStyle(c).fillRect(960 + i * 55, 1690, 55, 18));
      for (const [x, y] of [[1020, 1745], [1085, 1755], [1260, 1745]]) scene.add.image(x, y - 23, "kits").setScale(1 / RES.small).setDepth(y);
      this.sign(1125, 1630, "KITS DO ZAP · ENTREGA CONCLUÍDA", "#6746a0", "#fff4ce", 11);
    } else if (id === CAMPUS_LIBERADO.id) {
      this.sign(2210, 958, "DROGAS LIBERADAS", "#543c83", "#f6e192", 14);
      this.sign(2210, 1000, "DECRETO DO BRASIL IMPOSSÍVEL", "#fff1cb", "#6746a0", 10);
      for (const [x, y] of [[2130, 1050], [2290, 1040]]) {
        const leaf = scene.add.text(x, y - 34, "♧", { fontFamily: FONT, fontSize: "48px", color: "#5aaa76", stroke: "#233d38", strokeThickness: 3, resolution: 2 }).setOrigin(0.5).setDepth(y);
        scene.tweens.add({ targets: leaf, angle: 12, y: leaf.y - 6, duration: 800, yoyo: true, repeat: -1 });
      }
      // Nuvens cartunescas: apenas representação visual, sem mecânica de consumo.
      for (let i = 0; i < 6; i++) {
        const puff = scene.add.image(2140 + i * 27, 942 - i % 2 * 12, "puff").setTint(i % 2 ? 0xd0a4e6 : 0x97d4b2).setAlpha(0.6).setScale(1.5 / RES.small).setDepth(1011);
        scene.tweens.add({ targets: puff, y: puff.y - 20, alpha: 0.2, duration: 1100 + i * 160, yoyo: true, repeat: -1 });
      }
    } else if (id === BRASIL_PARA_CHINA.id) {
      this.flag(2330, 1690, true);
      const belt = scene.add.graphics().setDepth(1740);
      belt.fillStyle(0x544653).fillRoundedRect(2120, 1705, 180, 35, 7);
      belt.lineStyle(2, 0xb8a7a3);
      for (let x = 2130; x < 2300; x += 14) belt.lineBetween(x, 1708, x, 1736);
      const box = scene.add.image(2225, 1710, "brasil-caixa").setScale(2.1 / RES.small).setDepth(1741);
      this.sign(2210, 1565, "BRASIL ENVIADO À CHINA", "#b62f3e", "#fff4ce", 12);
      this.sign(2210, 1653, "DESTINO: CHINA · FRETE GRÁTIS", "#fff1cb", "#ab2c3a", 11);
      if (animated) scene.tweens.add({ targets: box, x: { from: 2140, to: 2225 }, duration: 1600, ease: "Sine.easeInOut" });
    }
  }

  linesFor(id: string): string[] | undefined {
    const ambient: Record<string, string[]> = {
      boato: ["Os boatos viraram plano de governo. E eu nem li o PDF!", "Aqui até a fofoca foi estatizada."],
      patrao: ["A churrasqueira virou propriedade coletiva!", "Picanha socializada. A conta também, presidente?"],
      func1: ["O crachá agora tem estrela!"], func2: ["Até a pausa pro café foi coletivizada!"],
      func3: ["Esse comunismo veio com churrasco de inauguração."], func4: ["Mandaram estatizar a impressora. Ela já não funcionava!"],
      nilza: ["Eu avisei no grupo! Agora tem um ministério só de boato!", "Meu áudio de três minutos virou decreto!"],
      osvaldo: ["Meu portão virou patrimônio da revolução!", "O coreto era comunista desde o começo!"],
      zeca: ["O cadeado já foi nacionalizado. A fivela é a próxima!"],
      feirante: ["Laranja por unidade ou por comitê?", "Até a banana ganhou plano quinquenal!"],
      didi: ["Hein? Estatizaram meu rádio também?"],
    };
    if (id === "pastor" && this.flags.has(OPERACAO_CADEADO.id)) return ["Fecharam mesmo. Agora o cadeado tem mais cargo que eu!", "Essa porta virou repartição pública."];
    if (id === "cida" && this.flags.has(OPERACAO_CADEADO.id)) return ["O presidente botou um cadeado na igreja. Só neste Brasil impossível!", "Quero ver quem vai achar a chave desse tamanho."];
    if (id === "diretora" && this.flags.has(KIT_DO_ZAP.id)) return ["As caixas chegaram. Até a prateleira ficou em arco-íris!", "O pânico agora vem com recibo de entrega."];
    if (id === "reitora" && this.flags.has(CAMPUS_LIBERADO.id)) return ["O campus virou aquele áudio de seis minutos.", "Decreto publicado. Boato convertido em expediente."];
    if (id === "despachante" && this.flags.has(BRASIL_PARA_CHINA.id)) return ["Brasil enviado. O código de rastreio não cabe no papel!", "O país coube na caixa. O frete ficou maior que a dívida."];
    return ambient[id];
  }
}
