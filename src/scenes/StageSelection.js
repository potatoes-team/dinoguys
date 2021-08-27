import 'phaser';

export default class StageSelection extends Phaser.Scene {
  constructor() {
    super('StageSelection');
  }

  create() {
    const height = this.scale.height;
    const width = this.scale.width;
    const stageNames = ['StageForest', 'StageDungeon', 'StageSnow'];
    for (let i = 0; i < 3; ++i) {
      const displayedNames = this.add.text(
        width * 0.3,
        height * (i / 8),
        stageNames[i],
        {
          fontSize: '30px',
          fill: '#fff',
        }
      );
      displayedNames.setInteractive();
      displayedNames.on('pointerup', () => {
        this.scene.stop('StageSelection');
        this.scene.start(stageNames[i], { isMultiplayer: false });
      });
    }
  }
}
