import StageScene from './StageScene';

export default class StageForest extends StageScene {
  constructor() {
    super('StageForest');
    this.assetName = 'forest';
    this.obstacles = {
      fire: false,
      saw: false,
      spike: true,
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
    const map = this.add.tilemap('tilemap');
    const forest_tiles = map.addTilesetImage('swamp_tile', 'forest_tiles');
    // const flag = map.addTilesetImage('flag');
    // const spikes = map.addTilesetImage('spike');
    const forest_decor = map.addTilesetImage('forest-decor', 'forest_decor');

    // this.tests = map.createFromObjects('Object Layer 1', [
    //   {
    //     gid: 419,
    //     key: 'stone1',
    //   },
    //   { gid: 420, key: 'grass1' },
    // ]);
    // console.log(this.tests);
    // this.physics.world.enable(this.tests, 1);

    // this.testGroup = this.physics.add.staticGroup();
    // this.tests.forEach((object) => {
    //   console.log(object);
    //   // this.add.existing(object);
    //   const sprite = this.physics.add.sprite(object);
    //   console.log(sprite);
    //   // this.physics.add.collider(this.player, sprite);
    // this.testGroup.add(object);
    // });

    // load layers that are at the bottom first
    // this.spikes = map.createLayer('Tile Layer 4', spikes, 0, 0);
    // this.flag = map.createLayer('Tile Layer 3', flag, 0, 0);
    this.forest_decor = map.createLayer('Background', forest_decor, 0, 0);

    this.platform = map.createLayer('Platform', forest_tiles, 0, 0);
    this.platform.setCollisionBetween(1, map.width * map.height); // enable collision by tile index in a range

    // get start & end points
    this.startPoint = { x: 20, y: 400 };
  }
}
