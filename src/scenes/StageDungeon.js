import player from '../entity/Player';

// tilemap size & stage size
const tileSize = 16; // unit: pixel
const gameWidth = 630; // unit: num of tiles
const gameHeight = 45; // unit: num of tiles

export default class StageDungeon extends Phaser.Scene {
  constructor() {
    super('StageDungeon');
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
      'assets/tilemap/dungeon-tilemap-2.json'
    );
    this.load.image('dungeon_tiles', 'assets/tilemap/dungeon-tileset.png');
    this.load.image('dungeon_deco', 'assets/tilemap/dungeon-decor.png');
    this.load.image('fire', 'assets/tilemap/obstacle-fire-on.png');
    this.load.image('saw', 'assets/tilemap/obstacle-saw.png');

    // background layers
    this.load.image('layer1', 'assets/backgrounds/dungeon/layer-1.png');
    this.load.image('layer2', 'assets/backgrounds/dungeon/layer-2.png');
    this.load.image('layer3', 'assets/backgrounds/dungeon/layer-3.png');
    this.load.image('layer4', 'assets/backgrounds/dungeon/layer-4.png');
    this.load.image('layer5', 'assets/backgrounds/dungeon/layer-5.png');
    this.load.image('layer6', 'assets/backgrounds/dungeon/layer-6.png');

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

    // add collision for spikes
    // this.spikes.setCollisionBetween(1, gameWidth * gameHeight);
    this.spikes.setCollisionFromCollisionGroup();
    this.physics.add.collider(this.player, this.spikes, () => {
      // console.log('ouch!');
      // this.player.setVelocityY(-200);
      // this.player.setVelocityX(this.player.facingLeft ? 1000 : -1000);
      // this.player.play('hurt', true);
    });

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
    const bg1 = this.add.tileSprite(0, height, width * 2, 793, 'layer1');
    const bg2 = this.add.tileSprite(0, height, width * 4, 793, 'layer2');
    const bg3 = this.add.tileSprite(0, height, width * 7, 793, 'layer3');
    const bg4 = this.add.tileSprite(0, height, width * 7, 793, 'layer4');
    const bg5 = this.add.tileSprite(0, height, width * 12, 793, 'layer5');
    const bg6 = this.add.tileSprite(0, height, width * 12, 793, 'layer6');

    // default image origin is (0.5, 0.5) -> i.e. middle of the image
    bg1.setOrigin(0, 1).setScale(1.3).setScrollFactor(0);
    bg2.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.2);
    bg3.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.4);
    bg4.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.6);
    bg5.setOrigin(0, 1).setScale(1.3).setScrollFactor(0.8);
    bg6.setOrigin(0, 1).setScale(1.3).setScrollFactor(1);
  }

  createMap() {
    const map = this.add.tilemap('tilemap');
    const dungeon_tiles = map.addTilesetImage(
      'Dungeon_TileSet',
      'dungeon_tiles'
    );
    const dungeon_bg = map.addTilesetImage(
      'Decorative_TileSet',
      'dungeon_deco'
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
    return new player(this, 50, 400, 'dino', this.socket, this.platform);
  }
}
