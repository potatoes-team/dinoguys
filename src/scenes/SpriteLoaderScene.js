// loads the spritesheet and the flag + flagpole for use in loading scenes.

export default class SpriteLoaderScene extends Phaser.Scene {
  constructor() {
    super('SpriteLoaderScene');
  }
  init(data) {
    this.socket = data.socket;
  }
  preload() {
    this.load.spritesheet('dino', 'assets/spriteSheets/dino-blue.png', {
      frameWidth: 15,
      frameHeight: 18,
      spacing: 9,
    });
    this.load.spritesheet('dino_red', 'assets/spriteSheets/dino-red.png', {
      frameWidth: 15,
      frameHeight: 18,
      spacing: 9,
    });
    this.load.spritesheet(
      'dino_yellow',
      'assets/spriteSheets/dino-yellow.png',
      {
        frameWidth: 15,
        frameHeight: 18,
        spacing: 9,
      }
    );
    this.load.spritesheet('dino_green', 'assets/spriteSheets/dino-green.png', {
      frameWidth: 15,
      frameHeight: 18,
      spacing: 9,
    });

    this.load.spritesheet(
      'loadingflag',
      'assets/spriteSheets/flagspritesheet.png',
      {
        frameWidth: 898,
        frameHeight: 436,
        spacing: 1,
      }
    );
    this.load.image('dinoguystitle', 'assets/backgrounds/dinoguystitle.png');
    this.load.image('flagpole', 'assets/sprites/flagpole.png');
  }
  create() {
    this.scene.stop('SpriteLoaderScene');
    this.scene.start('LoadingScene', { socket: this.socket });
  }
}
