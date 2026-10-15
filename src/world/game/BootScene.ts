import * as Phaser from "phaser";
import type { WorldData } from "./WorldScene";
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
    bakeTextures(this, (done, total) => onProgress?.(done / total))
      .then(() => this.scene.start("world", this.data_))
      .catch((err: unknown) => {
        console.error(err);
        const onError = this.registry.get("onError") as ((msg: string) => void) | undefined;
        onError?.("Não foi possível desenhar o bairro neste navegador.");
      });
  }
}
