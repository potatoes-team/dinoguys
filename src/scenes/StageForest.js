import StageScene from './StageScene';

export default class StageForest extends StageScene {
  constructor() {
    super('StageForest');
    this.assetName = 'forest';
    this.obstacles = {
      fire: false,
      saw: false,
      spike: true,
      chain: false,
      spikedball: false,
    };
    this.musicNum = 3;
    this.bgSettings = {
      layerNum: 11,
      imgHeight: 793,
      scale: 1.3,
      tileWidth: [2, 4, 7, 7, 12, 12, 12, 12, 12, 12, 12],
      scrollFactors: [0, 0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    };
    this.createMap = this.createMap.bind(this);
  }

  createMap() {
    // load tilemap & tilesets
    const map = this.add.tilemap(`${this.assetName}_tilemap`);
    const forest_tiles = map.addTilesetImage('swamp_tile', 'forest_tiles');
    const forest_decor = map.addTilesetImage('forest-decor', 'forest_decor');
    // const flag = map.addTilesetImage('flag');

    // create layers from bottom to top
    map.createLayer('Background', forest_decor, 0, 0);
    // this.flag = map.createLayer('Tile Layer 3', flag, 0, 0);
    this.platform = map.createLayer('Platform', forest_tiles, 0, 0);
    this.platform.setCollisionBetween(1, map.width * map.height);

    // create start & end points
    const { objects: points } = map.getObjectLayer('Start_End');
    this.startPoint = points.find((point) => point.name === 'Start');
    this.endPoint = points.find((point) => point.name === 'End');
    console.log('start point:', this.startPoint);
    console.log('end point:', this.endPoint);

    //creating checkpoints
    const { objects: checkpoints } = map.getObjectLayer('Checkpoints');
    this.checkpoints = checkpoints
    for (let i = 0; i < checkpoints.length; ++i) {
      this[`checkpoint${i+1}`] = checkpoints.find((checkpoint) => checkpoint.name === `Checkpoint${i+1}`)
    }
  }
}
