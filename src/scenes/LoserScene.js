import 'phaser';

export default class LoserScene extends Phaser.Scene {
  constructor() {
    super('LoserScene');
  }

  create() {
    const width = this.game.config.width;
    const height = this.game.config.height;

    this.add
      .text(width / 2, height * 0.15, 'YOU LOST', {
        fontFamily: 'customFont',
        fontSize: '44px',
      })
      .setOrigin(0.5, 0.5);
    const charSpriteArr = ['dino_green', 'dino_yellow', 'dino_red', 'dino'];
    const xCoordinate = [
      width * 0.8 - 180 * (1 * 0.4),
      width * 0.8 - 180 * (1 * 1.41),
      width * 0.8 - 180 * (2 * 1.26),
      width * 0.8 - 180 * (3 * 1.3),
    ];
    charSpriteArr.forEach((key, i) => {
      const dino = this.add
        .sprite(xCoordinate[i], height / 2, key, 14)
        .setScale(13 + i * 2);
      dino.play(`lose_${key}`, true);
    });
  }
}
