export default class FgScene extends Phaser.Scene {
  constructor() {
    super('FgScene');
  }

  preload() {
    // Preload Tilemap
    this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/dinoguystest3.json');
    this.load.image('base_tiles', 'assets/tilemap/dinoguystest1.png');
  }

  create() {
    // Create platform
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('terrain_tiles', 'base_tiles'); // arguments: tileset name used in tilemap file, tileset's image key used when preloaded above
    map.createLayer('Ground', tileset);
  }

  // time: total time elapsed (ms)
  // delta: time elapsed (ms) since last update() call. 16.666 ms @ 60fps
  update(time, delta) {
    // << DO UPDATE LOGIC HERE >>
  }
}
