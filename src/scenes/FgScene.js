import player from '../entity/Player';

// tilemap size & stage size
const tileSize = 16; // unit: pixel
const gameWidth = 630; // unit: num of tiles
const gameHeight = 45; // unit: num of tiles

export default class FgScene extends Phaser.Scene {
  constructor() {
    super('FgScene');
  }

  preload() {
    // tilemap for platform
    this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/J.Test1Map.json');
    this.load.image('terrain_tiles', 'assets/tilemap/dinoguystest1.png');
    this.load.image('spike_tile', 'assets/tilemap/spike.png');
    this.load.image('fire_tile', 'assets/tilemap/fire-on.png');

    // background layers
    this.load.image('layer1', 'assets/Island/Layers/L1.png');
    this.load.image('layer2', 'assets/Island/Layers/L2.png');
    this.load.image('layer3', 'assets/Island/Layers/L3.png');
    this.load.image('layer4', 'assets/Island/Layers/L4.png');
    this.load.image('layer5', 'assets/Island/Layers/L5.png');

    // player spritesheet
    this.load.spritesheet('dino', 'assets/spriteSheets/dino-blue3.png', {
      frameWidth: 15,
      frameHeight: 18,
      spacing: 9,
    });
  }

  create() {
    // create backgrounds
    this.createParallaxBackgrounds();

    // create platform
    const map = this.add.tilemap('tilemap');
    const tileset = map.addTilesetImage('terrain_tiles', 'terrain_tiles'); // arguments: tileset name used in tilemap file, tileset image's key used when preloaded above
    const spike = map.addTilesetImage('Spike_tile', 'spike_tile');
    const fire = map.addTilesetImage('fire_tile', 'fire_tile');
    this.platform = map.createLayer(
      'Tile Layer 1',
      [tileset, spike, fire],
      0,
      0
    );

    // create player
    this.player = new player(this, 20, 400, 'dino').setScale(2.25);
    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();

    // set camera to follow player
    this.physics.world.setBounds(
      0,
      0,
      tileSize * gameWidth,
      tileSize * gameHeight
    );
    this.cameras.main.setBounds(
      0,
      0,
      tileSize * gameWidth,
      tileSize * gameHeight
    );
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);

    // set collision btw player and platform
    this.platform.setCollisionBetween(1, gameWidth * gameHeight); // enable collision by tile index in a range
    this.physics.add.collider(this.player, this.platform, null, null, this);
  }

  // time: total time elapsed (ms)
  // delta: time elapsed (ms) since last update() call. 16.666 ms @ 60fps
  update(time, delta) {
    this.player.update(this.cursors /* , this.jumpSound */);
  }

  createParallaxBackgrounds() {
    const height = this.scale.height;
    const width = this.scale.width;
    // 0.5 puts us at the middle of the image
    const bg1 = this.add.tileSprite(0, height, width * 2, 1080, 'layer1'); // x, y, img width, img height, img key
    const bg2 = this.add.tileSprite(0, height, width * 4, 1080, 'layer2');
    const bg3 = this.add.tileSprite(0, height, width * 7, 1080, 'layer3');
    const bg4 = this.add.tileSprite(0, height, width * 7, 1080, 'layer4');
    const bg5 = this.add.tileSprite(0, height, width * 12, 1080, 'layer5');

    bg1.setOrigin(0, 1).setScale(0.8).setScrollFactor(0);
    bg2.setOrigin(0, 1).setScale(0.8).setScrollFactor(0);
    bg3.setOrigin(0, 1).setScale(0.8).setScrollFactor(0.2);
    bg4.setOrigin(0, 1).setScale(0.8).setScrollFactor(0.2);
    bg5.setOrigin(0, 1).setScale(0.8).setScrollFactor(1);
  }

  createAnimations() {
    // player animations
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('dino', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('dino', { start: 4, end: 9 }),
      frameRate: 20,
      repeat: -1,
    });
    // this.anims.create({
    //   key: 'kick',
    //   frames: this.anims.generateFrameNumbers('dino', { start: 10, end: 12 }),
    //   frameRate: 10,
    //   repeat: -1,
    // });
    this.anims.create({
      key: 'hurt',
      frames: this.anims.generateFrameNumbers('dino', { start: 13, end: 16 }),
      frameRate: 10,
      repeat: -1,
    });
  }
}
