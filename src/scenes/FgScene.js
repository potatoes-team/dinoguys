import player from '../entity/Player';

// tilemap size & stage size
const tileSize = 16; // unit: pixel
const gameWidth = 630; // unit: num of tiles
const gameHeight = 45; // unit: num of tiles

export default class FgScene extends Phaser.Scene {
  constructor() {
    super('FgScene');
    this.opponents = {};
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
  }

  preload() {
    // platform & traps
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

    // create platform & traps
    const map = this.add.tilemap('tilemap');
    const tileset = map.addTilesetImage('terrain_tiles', 'terrain_tiles'); // map.addTilesetImage("tileset name used in tilemap file", "tileset image's key used when preloaded above");
    const spike = map.addTilesetImage('Spike_tile', 'spike_tile');
    const fire = map.addTilesetImage('fire_tile', 'fire_tile');
    this.platform = map.createLayer(
      'Tile Layer 1',
      [tileset, spike, fire],
      0,
      0
    );
    console.log(this.platform);

    // render opponents that are in the same room as the player
    console.log('room info:', this.roomInfo);
    let i = 1; // render opponents on diff x positions to make sure we do have correct numbers of opponents on the stage
    Object.keys(this.roomInfo.players).forEach((playerId) => {
      if (playerId !== this.socket.id) {
        this.opponents[playerId] = new player(
          this,
          20 * i++,
          400,
          'dino',
          this.socket,
          this.platform
        );
      }
    });

    // create player
    this.player = new player(
      this,
      20,
      400,
      'dino',
      this.socket,
      this.platform
    ).setScale(2.25);
    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();

    // set collision btw player and platform
    this.platform.setCollisionBetween(1, gameWidth * gameHeight); // enable collision by tile index in a range

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

    // confirm if player is connected to server through socket
    this.socket.on('connect', function () {
      console.log('connected to server!');
    });

    // remove oponent from the stage when the opponent leaves the room (i.e. disconnected from the server)
    this.socket.on('playerDisconnected', ({ playerId }) => {
      this.opponents[playerId].destroy(); // remove opponent's game object
      delete this.opponents[playerId]; // remove opponent's key-value pair
      delete this.roomInfo.players[playerId];
      console.log('one player left!');
      console.log('current opponents:', this.opponents);
    });

    // update opponent's movements
    this.socket.on('playerMoved', ({ playerId, moveState }) => {
      this.opponents[playerId].updateOtherPlayer(moveState);
    });
  }

  // time: total time elapsed (ms)
  // delta: time elapsed (ms) since last update() call. 16.666 ms @ 60fps
  update(time, delta) {
    this.player.update(this.cursors /* , this.jumpSound */);
  }

  createParallaxBackgrounds() {
    const height = this.scale.height;
    const width = this.scale.width;
    const bg1 = this.add.tileSprite(0, height, width * 2, 1080, 'layer1'); // this.add.tileSprite(x, y, img width, img height, img key)
    const bg2 = this.add.tileSprite(0, height, width * 4, 1080, 'layer2');
    const bg3 = this.add.tileSprite(0, height, width * 7, 1080, 'layer3');
    const bg4 = this.add.tileSprite(0, height, width * 7, 1080, 'layer4');
    const bg5 = this.add.tileSprite(0, height, width * 12, 1080, 'layer5');

    // default image origin is (0.5, 0.5) -> i.e. middle of the image
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
