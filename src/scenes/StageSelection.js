import 'phaser';
import eventsCenter from '../utils/EventsCenter';

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

    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

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
        this.cursorOver.play();
      });
      backgroundImages.on('pointerout', () => {
        backgroundImages.setAlpha(0.5);
        displayedNames.setAlpha(0.5);
        this.cursorOver.stop();
      });

      displayedNames.on('pointerover', () => {
        backgroundImages.setAlpha(1);
        displayedNames.setAlpha(1);
        this.cursorOver.play();
      });
      displayedNames.on('pointerout', () => {
        displayedNames.setAlpha(0.5);
        backgroundImages.setAlpha(0.5);
        this.cursorOver.stop();
      });

      backgroundImages.on('pointerup', () => {
        this.startGame(stageNames[i]);
      });

      displayedNames.on('pointerup', () => {
        this.startGame(stageNames[i]);
      });
    });

    this.createUI();
  }

  createUI() {
    const backButton = this.add
      .text(this.scale.width - 20, 20, 'GO BACK', {
        fontFamily: 'customFont',
        fontSize: '15px',
        fill: '#fff',
      })
      .setScrollFactor(0)
      .setOrigin(1, 0);
    backButton.setInteractive();
    backButton.on('pointerover', () => {
      this.cursorOver.play();
    });
    backButton.on('pointerout', () => {
      this.cursorOver.stop();
    });
    backButton.on('pointerup', () => {
      this.scene.stop('StageSelection');
      this.scene.start('CharSelection');
    });
  }

  startGame(stageName) {
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.on('camerafadeoutcomplete', () => {
      eventsCenter.emit('startTransition');
    });

    this.time.delayedCall(2000, () => {
      this.game.menuMusic.stopAll();
      this.sound.stopAll();
      this.scene.stop('StageSelection');
      this.scene.start(stageName, {
        isMultiplayer: false,
        charSpriteKey: this.charSpriteKey,
      });
    });
  }
}
