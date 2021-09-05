import 'phaser';

export default class LoserScene extends Phaser.Scene {
  constructor() {
    super('LoserScene');
  }

  create() {
    const { width, height } = this.game.config;
    const backGroundImage = this.add.image(0, 0, 'main-menu-background').setOrigin(0);
    backGroundImage.setTint('0x535353');
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.sadMusic = this.sound.add('loserMusic')
    this.rainSound = this.sound.add('rainSound')
    this.rainSound.volume = 0.07;
    this.rainSound.play();
    this.sadMusic.volume = 0.07;
    this.sadMusic.play();

    // display message
    this.add
      .text(width / 2, height * 0.15, 'YOU LOST', {
        fontFamily: 'customFont',
        fontSize: '44px',
        fill: '#000',
      })
      .setStroke('#fff', 2)
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
    // create rain effects on screen
    this.createRain();

    this.sadMusic.once('complete', () => {
      this.scene.stop('LoserScene');
      this.scene.start('LobbyScene');
    })
  }

  createUI() {
    const { width } = this.scale;
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

    this.backButton = this.add
    .image(width - 20, 20, 'forwardButton')
    .setScrollFactor(0)
    .setOrigin(1, 0)
    .setScale(4);

    this.backButton.setInteractive();
    this.backButton.on('pointerover', () => {
      this.cursorOver.play();
    });

    this.backButton.on('pointerout', () => {
      this.cursorOver.stop();
    });
    this.backButton.on('pointerdown', () => {
      this.clickSound.play();
      this.backButton.setTint(0xc2c2c2);
    })
    this.backButton.on('pointerup', () => {
      this.scene.stop('LoserScene');
      this.scene.start('LobbyScene');
    });
  }

  createRain() {
    let particles = this.add.particles('rain');

    particles.emitter = particles.createEmitter({
      x: {min: 0, max: 1280},
      y: 0,
      lifespan: 1200,
      speedY: 800,
      scaleY: 1.2,
      scaleX: .04,
      quantity: 10,
      blendMode: 'ADD'
    })


  }
}
