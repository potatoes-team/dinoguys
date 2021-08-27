export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }
  preload() {}
  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'Main Menu Scene', { fontSize: '32px' })
      .setOrigin(0.5, 0.5);

    this.add
      .text(width / 3, (height / 3) * 2, 'Single Player', { fontSize: '24px' })
      .setOrigin(0.5, 0.5);
    this.add
      .text((width / 3) * 2, (height / 3) * 2, 'Single Player', {
        fontSize: '24px',
      })
      .setOrigin(0.5, 0.5);
  }
}
