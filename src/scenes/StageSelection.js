import 'phaser';

export default class StageSelection extends Phaser.Scene {
  constructor () {
    super('StageSelection');
  }

  preload() {
    this.load.image('castle-name', "assets/StageFont/Castle.png")
    this.load.image('forest-name', "assets/StageFont/Forest.png")
    this.load.image('snow-name', "assets/StageFont/Snow.png")
  }

  create() {
    const height = this.scale.height;
    const width = this.scale.width;
    const stageNames = ["StageForest", "StageDungeon", "StageSnow"]
    const stageImages = ['forest-name', 'castle-name', 'snow-name']

    for (let i = 0; i < 3; ++i) {
      const displayedNames = this.add.image(width * ((i+1) / 4), height * 0.2, stageImages[i]/* , {
        fontSize: '30px',
        fill: '#fff'
      } */)/* .setOrigin(1, -5) */;
      
      displayedNames.setInteractive();
      displayedNames.on('pointerup', () => {
        this.scene.stop('StageSelection');
        this.scene.start(stageNames[i], { isMultiplayer: false})
      })
    }
  }
}