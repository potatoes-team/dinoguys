import 'phaser';

export default class BgScene extends Phaser.Scene {
  constructor() {
    super('BgScene');

  }

  preload() {
    // Preload Sprites
    // << LOAD SPRITE HERE >>
    this.load.image('layer1', 'assets/Island/Layers/L1.png');
    this.load.image('layer2', 'assets/Island/Layers/L2.png');
    this.load.image('layer3', 'assets/Island/Layers/L3.png');
    this.load.image('layer4', 'assets/Island/Layers/L4.png');
    this.load.image('layer5', 'assets/Island/Layers/L5.png');
  }

  create() {
    // Create Sprites
    // << CREATE SPRITE HERE >>
      const height = this.scale.height;
      const width = this.scale.width;
      // 0.5 puts us at the middle of the image
      const bg1 = this.add.tileSprite(0, height, width, height,'layer1');
      const bg2 = this.add.tileSprite(0, height, width * 4, height,'layer2');
      const bg3 = this.add.tileSprite(0, height, width * 7, height,'layer3');
      const bg4 = this.add.tileSprite(0, height, width * 13, height,'layer4');
      const bg5 = this.add.tileSprite(0, height, width * 12, height,'layer5');
      // x, y, width, height
      bg1.setOrigin(0, 1)
      bg2.setOrigin(0, 1)
      bg3.setOrigin(0, 1)
      bg4.setOrigin(0, 1)
      bg5.setOrigin(0, 1)

      const game_width = parseFloat(bg5.getBounds().width)
      // const width = game_width;
      const window_width = 1200;

      const bg1_width = bg1.getBounds().width
      const bg2_width = bg2.getBounds().width
      const bg3_width = bg3.getBounds().width
      const bg4_width = bg4.getBounds().width
      // const bg5_width = bg5.getBounds().width
      // // Set the scroll factor for bg1, bg2, and bg3 here!
      bg1.setScrollFactor(0);
      bg2.setScrollFactor(.3);
      bg3.setScrollFactor(.6);
      bg4.setScrollFactor(.9);
      bg5.setScrollFactor(1);
  }

  
}
