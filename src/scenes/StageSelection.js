import 'phaser';

export default class StageSelection extends Phaser.Scene {
  constructor() {
    super('StageSelection');
  }

  init(data) {
    this.charSpriteKey = data.charSpriteKey;
    this.menuMusic = data.menuMusic;
  }

  create() {
    const height = this.scale.height;
    const width = this.scale.width;

    const stageNames = ['StageForest', 'StageDungeon', 'StageSnow'];
    const stageImages = ['forest-name', 'castle-name', 'snow-name'];
    const backGroundImgs = [
      'forest-background',
      'castle-background',
      'snow-background',
    ];

    if (!this.menuMusic.isPlaying) {
      this.menuMusic.play();
    }
    // this.backgroundMusic = this.sound.add('selection-music');
    // this.backgroundMusic.setLoop(true);
    // this.backgroundMusic.volume = 0.05;
    // this.backgroundMusic.play();

    backGroundImgs.forEach((bgImg, i) => {
      const backgroundImages = this.add
        .image((width * (i + 1)) / 4, height / 2, bgImg)
        .setScale(0.75, 1)
        .setAlpha(0.5);

      const displayedNames = this.add
        .image(width * ((i + 1) / 4), height * 0.2, stageImages[i])
        .setAlpha(0.5);

      backgroundImages.setInteractive();
      displayedNames.setInteractive();

      backgroundImages.on('pointerover', () => {
        backgroundImages.setAlpha(1);
        displayedNames.setAlpha(1);
      });
      backgroundImages.on('pointerout', () => {
        backgroundImages.setAlpha(0.5);
        displayedNames.setAlpha(0.5);
      });

      displayedNames.on('pointerover', () => {
        backgroundImages.setAlpha(1);
        displayedNames.setAlpha(1);
      });
      displayedNames.on('pointerout', () => {
        displayedNames.setAlpha(0.5);
        backgroundImages.setAlpha(0.5);
      });

      backgroundImages.on('pointerup', () => {
        this.sound.stopAll();
        this.scene.stop('StageSelection');
        this.scene.start(stageNames[i], {
          isMultiplayer: false,
          charSpriteKey: this.charSpriteKey,
        });
      });

      displayedNames.on('pointerup', () => {
        this.sound.stopAll();
        this.scene.stop('StageSelection');
        this.scene.start(stageNames[i], {
          isMultiplayer: false,
          charSpriteKey: this.charSpriteKey,
        });
      });
    });

    this.createUI();
  }

  createUI() {
    const backButton = this.add
      .text(this.scale.width - 20, 20, 'Go Back', {
        fontSize: '30px',
        fill: '#fff',
      })
      .setScrollFactor(0)
      .setOrigin(1, 0);
    backButton.setInteractive();
    backButton.on('pointerup', () => {
      // this.sound.stopAll();
      this.scene.stop('StageSelection');
      // this.scene.start('CharSelection', {
      //   socket: this.socket,
      //   username: this.username,
      //   isMultiplayer: false,
      // });
      this.scene.start('CharSelection');
    });
  }
}
