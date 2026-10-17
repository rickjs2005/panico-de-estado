import * as Phaser from "phaser";
import type { WorldData } from "./WorldScene";
import { temCidade } from "../cidade/ativa";
import { bakeTextures } from "./bake";

/** Gera as texturas do bairro e depois abre o mundo. */
export class BootScene extends Phaser.Scene {
  private data_!: WorldData;

  constructor() {
    super("boot");
  }

  init(data: WorldData) {
    this.data_ = data;
  }

  create() {
    const onProgress = this.registry.get("onProgress") as ((p: number) => void) | undefined;
    // Protagonista com cidade abre a cidade dele; sem cidade, o bairro original.
    const target = temCidade(this.data_.hero) ? "city" : "world";
    bakeTextures(this, this.data_.hero, (done, total) => onProgress?.(done / total))
      .then(() => this.scene.start(target, this.data_))
      .catch((err: unknown) => {
        console.error(err);
        const onError = this.registry.get("onError") as ((msg: string) => void) | undefined;
        onError?.("Não foi possível desenhar o bairro neste navegador.");
      });
  }
}
