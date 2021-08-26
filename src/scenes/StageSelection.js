import 'phaser';
import StageDungeon from './StageDungeon';
import StageForest from './StageForest';
import StageSnow from './StageSnow';
import config from '../config/config'
import StageScene from './StageScene';


export default class StageSelection extends Phaser.Scene {
  constructor () {
    super('StageSelection');
  }

  create() {
    const height = this.scale.height;
    const width = this.scale.width;
    const stageNames = ["StageForest", "StageDungeon", "StageSnow"]
    // const stage = [StageForest, StageDungeon, StageSnow];
    for (let i = 0; i < 3; ++i) {
      const displayedNames = this.add.text(width * 0.3, height * (i / 8), stageNames[i], {
        fontSize: '30px',
        fill: '#fff'
      });
      displayedNames.setInteractive();
      displayedNames.on('pointerup', () => {
        this.scene.stop('StageSelection');
        this.scene.start(stageNames[i] /* , stage[i] */)
      })
    }
  }
}