import player from '../entity/Player';

export default class FgScene extends Phaser.Scene {
  constructor() {
    super('FgScene');
  }

  preload() {
    // Preload tilemap for platform
    this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/test1.json');
    this.load.image('base_tiles', 'assets/tilemap/dinoguystest1.png');

    // Preload player
    this.load.spritesheet('dino', 'assets/spriteSheets/dino-blue.png', {
      frameWidth: 24,
      frameHeight: 18,
      // spacing: 16,
    });
  }

  create() {
    // Create platform
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('terrain_tiles', 'base_tiles'); // arguments: tileset name used in tilemap file, tileset's image key used when preloaded above
    this.platform = map.createLayer('Platform', tileset, 0, 40);

    // Create player
    this.player = new player(this, 20, 400, 'dino').setScale(2);
    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create collision btw player and platform
    this.platform.setCollisionBetween(1, 35 * 100);
    this.physics.add.collider(this.player, this.platform, null, null, this);
  }

  // time: total time elapsed (ms)
  // delta: time elapsed (ms) since last update() call. 16.666 ms @ 60fps
  update(time, delta) {
    this.player.update(this.cursors /* , this.jumpSound */);
  }

  createAnimations() {
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('dino', { start: 1, end: 4 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('dino', { start: 5, end: 10 }),
      frameRate: 10,
      repeat: -1,
    });
    // this.anims.create({
    //   key: 'jump',
    //   frames: [{ key: 'dino', frame: 17 }],
    //   frameRate: 20,
    // });
    this.anims.create({
      key: 'hurt',
      frames: this.anims.generateFrameNumbers('dino', { start: 14, end: 17 }),
      frameRate: 10,
      repeat: -1,
    });
  }
}
