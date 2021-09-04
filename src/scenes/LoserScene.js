import 'phaser';

export default class LoserScene extends Phaser.Scene {
  constructor() {
    super('LoserScene');
  }

  create() {
    const { width, height } = this.game.config;
    this.add.image(0, 0, 'main-menu-background').setOrigin(0);
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // display message
    this.add
      .text(width / 2, height * 0.15, 'YOU LOST', {
        fontFamily: 'customFont',
        fontSize: '44px',
        fill: '#fff',
      })
      .setOrigin(0.5, 0.5);

    // crying dino sprites
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

    // button for going back to lobby
    this.createUI();
  }

  createUI() {
    const { width, height } = this.scale;
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

    this.backButton = this.add
      .text(width / 2, (height / 4) * 3, 'BACK TO LOBBY', {
        fontFamily: 'customFont',
        fontSize: '30px',
        fill: '#fff',
      })
      .setOrigin(0.5, 0.5);

    this.backButton.setInteractive();
    this.backButton.on('pointerover', () => {
      this.cursorOver.play();
    });

    this.backButton.on('pointerout', () => {
      this.cursorOver.stop();
    });
    this.backButton.on('pointerdown', () => {
      this.clickSound.play();
    })
    this.backButton.on('pointerup', () => {
      this.scene.stop('WinnerScene');
      this.scene.start('LobbyScene');
    });
  }
}
