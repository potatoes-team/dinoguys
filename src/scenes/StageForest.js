import player from '../entity/Player';

// tilemap size & stage size
const tileSize = 16; // unit: pixel
const gameWidth = 630; // unit: num of tiles
const gameHeight = 45; // unit: num of tiles

export default class StageForest extends Phaser.Scene {
  constructor() {
    super('StageForest');
    this.opponents = {};
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
  }

  preload() {
    // platforms, props & obstacles
    this.load.tilemapTiledJSON(
      'tilemap',
      'assets/tilemap/forest-tilemap-5.json'
    );
    this.load.image('forest_tiles', 'assets/tilemap/forest-tileset.png');
    this.load.image('forest_decor', 'assets/tilemap/forest-decor.png');
    this.load.image('spikes', 'assets/tilemap/obstacle-spike.png');

    // background layers
    this.load.image('layer1', 'assets/backgrounds/forest/layer-1.png');
    this.load.image('layer2', 'assets/backgrounds/forest/layer-2.png');
    this.load.image('layer3', 'assets/backgrounds/forest/layer-3.png');
    this.load.image('layer4', 'assets/backgrounds/forest/layer-4.png');
    this.load.image('layer5', 'assets/backgrounds/forest/layer-5.png');
    this.load.image('layer6', 'assets/backgrounds/forest/layer-6.png');
    this.load.image('layer7', 'assets/backgrounds/forest/layer-7.png');
    this.load.image('layer8', 'assets/backgrounds/forest/layer-8.png');
    this.load.image('layer9', 'assets/backgrounds/forest/layer-9.png');
    this.load.image('layer10', 'assets/backgrounds/forest/layer-10.png');
    this.load.image('layer11', 'assets/backgrounds/forest/layer-11.png');

    // player spritesheet
    this.load.spritesheet('dino', 'assets/spriteSheets/dino-blue.png', {
      frameWidth: 15,
      frameHeight: 18,
      spacing: 9,
    });
  }

  create() {
    // create backgrounds & map (including platforms, obstacles, etc.)
    this.createParallaxBackgrounds();
    this.createMap();

    // create player
    this.player = this.createPlayer();
    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();

    // set up world boundary & camera to follow player
    this.setWorldBoundaryAndCamera();

    // confirm if player is connected to server through socket
    this.socket.on('connect', function () {
      console.log('connected to server!');
    });

    // create opponents that are already in the room player joined
    console.log('room info:', this.roomInfo);
    Object.keys(this.roomInfo.players).forEach((playerId) => {
      if (playerId !== this.socket.id) {
        this.opponents[playerId] = this.createPlayer();
      }
    });

    // create new opponent when new player join the room
    this.socket.on('newPlayerJoined', ({ playerId, playerInfo }) => {
      // const { playerName, spriteKey, moveState } = playerInfo;
      this.opponents[playerId] = this.createPlayer();
      console.log('new player joined!');
      console.log('current opponents:', this.opponents);
    });

    // remove opponent from the stage when they leave the room (i.e. disconnected from the server)
    this.socket.on('playerDisconnected', ({ playerId }) => {
      this.opponents[playerId].destroy(); // remove opponent's game object
      delete this.opponents[playerId]; // remove opponent's key-value pair
      console.log('one player left!');
      console.log('current opponents:', this.opponents);
    });

    // update opponent's movements
    this.socket.on('playerMoved', ({ playerId, moveState }) => {
      if (this.opponents[playerId])
        this.opponents[playerId].updateOtherPlayer(moveState);
    });
  }

  update() {
    this.player.update(this.cursors /* , this.jumpSound */);
  }

  createParallaxBackgrounds() {
    const height = this.scale.height;
    const width = this.scale.width;
    const bg1 = this.add.tileSprite(0, height, width * 2, 793, 'layer1'); // this.add.tileSprite(x, y, img width, img height, img key)
    const bg2 = this.add.tileSprite(0, height, width * 4, 793, 'layer2');
    const bg3 = this.add.tileSprite(0, height, width * 7, 793, 'layer3');
    const bg4 = this.add.tileSprite(0, height, width * 7, 793, 'layer4');
    const bg5 = this.add.tileSprite(0, height, width * 12, 793, 'layer5');
    const bg6 = this.add.tileSprite(0, height, width * 12, 793, 'layer6');
    const bg7 = this.add.tileSprite(0, height, width * 12, 793, 'layer7');
    const bg8 = this.add.tileSprite(0, height, width * 12, 793, 'layer8');
    const bg9 = this.add.tileSprite(0, height, width * 12, 793, 'layer9');
    const bg10 = this.add.tileSprite(0, height, width * 12, 793, 'layer10');
    const bg11 = this.add.tileSprite(0, height, width * 12, 793, 'layer11');

    // default image origin is (0.5, 0.5) -> i.e. middle of the image
    bg1.setOrigin(0, 1).setScale(1.3).setScrollFactor(0);
    bg2.setOrigin(0, 1).setScale(1.3).setScrollFactor(0);
    bg3.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.2);
    bg4.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.3);
    bg5.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.4);
    bg6.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.5);
    bg7.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.6);
    bg8.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.7);
    bg9.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.8);
    bg10.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.9);
    bg11.setOrigin(0, 1).setScale(1.3).setScrollFactor(1);
  }

  createMap() {
    const map = this.add.tilemap('tilemap');
    const forest_tiles = map.addTilesetImage('swamp_tile', 'forest_tiles');
    // const flag = map.addTilesetImage('flag');
    const spikes = map.addTilesetImage('spikes');
    const forest_decor = map.addTilesetImage('forest_decor');

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
    this.forest_decor = map.createLayer('Tile Layer 5', forest_decor, 0, 0);

    this.spikes = map.createLayer('Tile Layer 4', spikes, 0, 0);
    // this.flag = map.createLayer('Tile Layer 3', flag, 0, 0);

    this.platform = map.createLayer('Tile Layer 1', forest_tiles, 0, 0);
    this.platform.setCollisionBetween(1, gameWidth * gameHeight); // enable collision by tile index in a range
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

  setWorldBoundaryAndCamera() {
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
  }

  createPlayer() {
    return new player(this, 20, 400, 'dino', this.socket, this.platform);
  }
}
