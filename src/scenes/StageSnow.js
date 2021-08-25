import player from '../entity/Player';

// tilemap size & stage size
const tileSize = 16; // unit: pixel
const gameWidth = 630; // unit: num of tiles
const gameHeight = 45; // unit: num of tiles

export default class StageSnow extends Phaser.Scene {
  constructor() {
    super('StageSnow');
    this.opponents = {};
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
  }

  preload() {
    // platforms, props & obstacles
    this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/Snow...json');
    this.load.image('snow_tiles', 'assets/tilemap/mainlevbuild1.png');
    this.load.image('snow_tiles1', 'assets/tilemap/mainlevbuild2.png');
    // this.load.image('fire', 'assets/tilemap/obstacle-fire-on.png');
    // this.load.image('saw', 'assets/tilemap/obstacle-saw.png');

    // background layers
    this.load.image('layer1', 'assets/backgrounds/snow/background1.png');
    this.load.image('layer2', 'assets/backgrounds/snow/background2.png');
    this.load.image('layer3', 'assets/backgrounds/snow/background3.png');
    this.load.image('cloud1', 'assets/backgrounds/snow/cloud1.png');
    this.load.image('cloud2', 'assets/backgrounds/snow/cloud2.png');
    this.load.image('cloud3', 'assets/backgrounds/snow/cloud3.png');
    this.load.image('cloud4', 'assets/backgrounds/snow/cloud4.png');
    this.load.image('cloud5', 'assets/backgrounds/snow/cloud5.png');
    this.load.image('cloud6', 'assets/backgrounds/snow/cloud6.png');
    this.load.image('cloud7', 'assets/backgrounds/snow/cloud7.png');
    this.load.image('cloud8', 'assets/backgrounds/snow/cloud8.png');

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
    this.createMap1();
    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();

    // // try adding collision by collision box
    // console.log(this.matter);
    // this.platform.setCollisionFromCollisionGroup();

    // this.matter.world.convertTilemapLayer(this.platform);
    // this.matter.world.setBounds(
    //   this.map.widthInPixels,
    //   this.map.heightInPixels
    // );
    // this.matter.add.image(100, 400, 'dino');

    // const debugGraphics = this.add.graphics();
    // // this.drawCollisionShapes(debugGraphics);
    // debugGraphics.clear();
    // this.map.renderDebug(debugGraphics, { tileColor: null });

    // // this.physics.add.collider(this.player, this.platform);

    // set up world boundary & camera to follow player
    this.setWorldBoundaryAndCamera();

    // add collision for spikes
    // this.traps.setCollisionBetween(1, gameWidth * gameHeight);
    // this.traps.setCollisionFromCollisionGroup();
    // this.physics.add.collider(this.player, this.traps, () => {
    //   // console.log('ouch!');
    //   this.player.setVelocityY(-250);
    //   this.player.setVelocityX(this.player.facingLeft ? 1300 : -1300);
    //   this.player.play('hurt', true);
    // });

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
    const bg1 = this.add.tileSprite(0, height, width * 2, 640, 'layer1');
    const bg2 = this.add.tileSprite(0, height, width * 4, 640, 'layer2');
    const bg3 = this.add.tileSprite(0, height, width * 7, 640, 'layer3');
    // const cloud1 = this.add.tileSprite(0, height, width, 793, 'cloud1');
    // const cloud2 = this.add.tileSprite(0, height, width, 793, 'cloud2');
    // const cloud3 = this.add.tileSprite(0, height, width, 793, 'cloud3');

    // default image origin is (0.5, 0.5) -> i.e. middle of the image
    bg1.setOrigin(0, 1).setScale(1.3).setScrollFactor(0);
    bg2.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.4);
    bg3.setOrigin(0, 1).setScale(1.3).setScrollFactor(1);
    // cloud1.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.4);
    // cloud2.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.4);
    // cloud3.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.4);
  }

  createMap() {
    this.map = this.add.tilemap('tilemap');
    const snow_tiles = this.map.addTilesetImage('Platform1', 'snow_tiles');
    const snow_tiles1 = this.map.addTilesetImage('Platform2', 'snow_tiles1');
    // const fire = this.map.addTilesetImage('Fire', 'fire');
    // const saw = this.map.addTilesetImage('Saw', 'saw');

    // load layers that are at the bottom first
    this.bg3 = this.map.createLayer(
      'Background',
      [snow_tiles, snow_tiles1],
      0,
      0
    );
    this.bg2 = this.map.createLayer('Background1', snow_tiles, 0, 0);
    this.platform = this.map.createLayer(
      'Platform',
      [snow_tiles, snow_tiles1],
      0,
      0
    );
    this.platformTop = this.map.createLayer('CastleGround', snow_tiles, 0, 0);
    // this.saw = this.map.createLayer('Saw_Trap', saw, 0, 0);
    // this.fire = this.map.createLayer('Fire_Trap', fire, 0, 0);
    // this.traps = this.map.createLayer('Traps', snow_tiles1, 0, 0);
    this.platform.setCollisionBetween(1, gameWidth * gameHeight); // enable collision by tile index in a range
  }

  createMap1() {
    // const map = this.add.tilemap('tilemap');
    const snow_tiles = this.map.addTilesetImage('Platform1', 'snow_tiles');
    const snow_tiles1 = this.map.addTilesetImage('Platform2', 'snow_tiles1');
    this.snow = this.map.createLayer('Snow', snow_tiles, 0, 0);
    this.front = this.map.createLayer('Front', snow_tiles, 0, 0);
    this.traps = this.map.createLayer('Traps', snow_tiles1, 0, 0);
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
    return new player(this, 150, 400, 'dino', this.socket, this.platform);
  }
}
