import 'phaser';

export default class StageSelection extends Phaser.Scene {
  constructor() {
    super('StageSelection');
  }

  preload() {
    this.load.image('castle-name', 'assets/StageFont/Castle.png');
    this.load.image('forest-name', 'assets/StageFont/Forest.png');
    this.load.image('snow-name', 'assets/StageFont/Snow.png');
    this.load.audio('selection-music', 'assets/audio/8-Epic.mp3');
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
        this.scene.start(stageNames[i], { isMultiplayer: false });
      });
    }
  }
}
