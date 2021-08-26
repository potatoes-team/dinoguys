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
    this.map = this.add.tilemap('tilemap');
    this.snow_tiles = this.map.addTilesetImage('Platform1', 'snow_tiles');
    this.snow_decor = this.map.addTilesetImage('Platform2', 'snow_decor');
    // const fire = this.map.addTilesetImage('Fire', 'fire');
    // const saw = this.map.addTilesetImage('Saw', 'saw');

    // load layers that are at the bottom first
    this.bg3 = this.map.createLayer(
      'Background',
      [this.snow_tiles, this.snow_decor],
      0,
      0
    );
    this.bg2 = this.map.createLayer('Background1', this.snow_tiles, 0, 0);
    this.platform = this.map.createLayer(
      'Platform',
      [this.snow_tiles, this.snow_decor],
      0,
      0
    );
    this.platformTop = this.map.createLayer(
      'CastleGround',
      this.snow_tiles,
      0,
      0
    );
    // this.saw = this.map.createLayer('Saw_Trap', saw, 0, 0);
    // this.fire = this.map.createLayer('Fire_Trap', fire, 0, 0);
    // this.traps = this.map.createLayer('Traps', snow_decor, 0, 0);
    this.platform.setCollisionBetween(1, this.map.width * this.map.height); // enable collision by tile index in a range

    // get start & end points
    this.startPoint = { x: 100, y: 400 };
  }

  createMapFront() {
    this.snow = this.map.createLayer('Snow', this.snow_tiles, 0, 0);
    this.front = this.map.createLayer('Front', this.snow_tiles, 0, 0);
    this.traps = this.map.createLayer('Traps', this.snow_decor, 0, 0);
  }
}
