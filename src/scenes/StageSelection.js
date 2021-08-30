import 'phaser';

export default class StageSelection extends Phaser.Scene {
  constructor() {
    super('StageSelection');
  }

  init(data) {
    this.charSpriteKey = data.charSpriteKey
  }

  create() {
    const height = this.scale.height;
    const width = this.scale.width;
    const stageNames = ['StageForest', 'StageDungeon', 'StageSnow'];
    const stageImages = ['forest-name', 'castle-name', 'snow-name'];

    this.backgroundMusic = this.sound.add('selection-music');
    this.backgroundMusic.setLoop(true);
    this.backgroundMusic.volume = 0.05;
    this.backgroundMusic.play();

    for (let i = 0; i < 3; ++i) {
      const displayedNames = this.add.image(
        width * ((i + 1) / 4),
        height * 0.2,
        stageImages[i]
      );

      displayedNames.setInteractive();
      displayedNames.on('pointerup', () => {
        this.sound.stopAll();
        this.scene.stop('StageSelection');
        this.scene.start(stageNames[i], { isMultiplayer: false, charSpriteKey: this.charSpriteKey });
      });
    }
    this.createUI()
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
      this.sound.stopAll();
      this.scene.stop('StageSelection');
      this.scene.start(
        'CharSelection'
      );
    });
  }
}
