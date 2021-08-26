import StageScene from './StageScene';

export default class StageDungeon extends StageScene {
  constructor() {
    super('StageDungeon');
    this.assetName = 'dungeon';
    this.obstacles = {
      fire: true,
      saw: true,
      spikes: false,
    };
    this.bgSettings = {
      layerNum: 6,
      imgHeight: 384,
      scale: 2,
      tileWidth: [2, 4, 7, 12, 12, 12],
      scrollFactors: [0, 0.2, 0.4, 0.6, 0.8, 1],
    };
    this.createMap = this.createMap.bind(this);
  }

  createMap() {
    const map = this.add.tilemap('tilemap');
    const dungeon_tiles = map.addTilesetImage(
      'Dungeon_TileSet',
      'dungeon_tiles'
    );
    const dungeon_bg = map.addTilesetImage(
      'Decorative_TileSet',
      'dungeon_decor'
    );
    const fire = map.addTilesetImage('Fire', 'fire');
    const saw = map.addTilesetImage('Saw', 'saw');

    // load layers that are at the bottom first
    this.bg3 = map.createLayer('Background3', dungeon_tiles, 0, 0);
    this.bg2 = map.createLayer('BackGround2', dungeon_tiles, 0, 0);
    this.bg = map.createLayer('BackGround', dungeon_bg, 0, 0);
    this.saw = map.createLayer('Saw_Trap', saw, 0, 0);
    this.fire = map.createLayer('Fire_Trap', fire, 0, 0);
    this.spikes = map.createLayer('Spike_Trap', dungeon_bg, 0, 0);
    this.platform = map.createLayer('Platform_Layer', dungeon_tiles, 0, 0);
    this.platform.setCollisionBetween(1, map.width * map.height); // enable collision by tile index in a range

    // get start & end points
    const { objects: points } = map.getObjectLayer('Start_End_Point');
    this.startPoint = points.find((point) => point.name === 'Start_Point');
    this.endPoint = points.find((point) => point.name === 'End_Point');
    console.log('start point:', this.startPoint);
    console.log('end point:', this.endPoint);
  }
}
