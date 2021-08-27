import 'phaser';
import StageForest from './StageForest';
import StageDungeon from './StageDungeon';
import StageSnow from './StageSnow';

export default class StageSelection extends Phaser.Scene {
  constructor() {
    super('StageSelection');
  }

  // init(data) {
  //   this.previousStage = data.previousStage;
  // }

  create() {
    console.log(this);
    // if (this.previousStage) {
    //   console.log('removing previous stage:', this.previousStage);
    //   const keys = {
    //     StageForest: StageForest,
    //     StageDungeon: StageDungeon,
    //     StageSnow: StageSnow,
    //   };
    //   this.scene.remove(this.previousStage);
    //   this.game.scene.add(this.previousStage, keys[this.previousStage]);
    // }

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
