import StageScene from './StageScene';

export default class StageSnow extends StageScene {
  constructor() {
    super('StageSnow');
    this.assetName = 'snow';
    this.obstacles = {
      fire: true,
      saw: true,
      spikes: false,
    };
    this.bgSettings = {
      layerNum: 3,
      imgHeight: 640,
      scale: 1.3,
      tileWidth: [2, 4, 7],
      scrollFactors: [0, 0.4, 1],
    };
    this.createMap = this.createMap.bind(this);
    this.createMapFront = this.createMapFront.bind(this);
  }

  createMap() {
    // load tilemap & tilesets
    this.map = this.add.tilemap('tilemap');
    const snow_tiles = this.map.addTilesetImage('Platform1', 'snow_tiles');
    const snow_decor = this.map.addTilesetImage('Platform2', 'snow_decor');

    // const fire = this.map.addTilesetImage('Fire', 'fire');
    // const saw = this.map.addTilesetImage('Saw', 'saw');

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

    // create layers from bottom to top
    this.map.createLayer('Background', [snow_tiles, snow_decor], 0, 0);
    this.map.createLayer('Background1', snow_tiles, 0, 0);
    this.platform = this.map.createLayer(
      'Platform',
      [snow_tiles, snow_decor],
      0,
      0
    );
    this.platform.setCollisionBetween(1, this.map.width * this.map.height); // enable collision by tile index in a range
    this.map.createLayer('CastleGround', snow_tiles, 0, 0);

    // this.saw = this.map.createLayer('Saw_Trap', saw, 0, 0);
    // this.fire = this.map.createLayer('Fire_Trap', fire, 0, 0);
    // this.traps = this.map.createLayer('Traps', snow_decor, 0, 0);

    // create start & end points
    this.startPoint = { x: 100, y: 400 };
  }

  createMapFront() {
    this.map.createLayer('Snow', this.snow_tiles, 0, 0);
    this.map.createLayer('Front', this.snow_tiles, 0, 0);
    this.map.createLayer('Traps', this.snow_decor, 0, 0);
  }
}
