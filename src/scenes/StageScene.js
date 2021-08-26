import player from '../entity/Player';

// tilemap size & stage size
const tileSize = 16; // unit: pixel
const gameWidth = 630; // unit: num of tiles
const gameHeight = 45; // unit: num of tiles

export default class StageScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.stageKey = key;
    this.opponents = {};
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
    this.isMultiplayer = data.isMultiplayer
  }

  preload() {
    const {
      assetName,
      obstacles,
      bgSettings: { layerNum },
    } = this;

    // platforms, props & obstacles
    this.load.tilemapTiledJSON(
      'tilemap',
      `assets/tilemaps/${assetName}-tilemap.json`
    );
    this.load.image(
      `${assetName}_tiles`,
      `assets/tilemaps/${assetName}-tileset.png`
    );
    this.load.image(
      `${assetName}_decor`,
      `assets/tilemaps/${assetName}-decor.png`
    );

    // obstacles
    for (let [obstacleKey, isOnStage] of Object.entries(obstacles)) {
      if (isOnStage)
        this.load.image(
          obstacleKey,
          `assets/tilemaps/obstacle-${obstacleKey}.png`
        );
    }

    // background layers
    for (let i = 1; i <= layerNum; ++i) {
      this.load.image(
        `layer${i}`,
        `assets/backgrounds/${assetName}/layer-${i}.png`
      );
    }

    // player spritesheet
    this.load.spritesheet('dino', 'assets/spriteSheets/dino-blue.png', {
      frameWidth: 15,
      frameHeight: 18,
      spacing: 9,
    });

    // flag spritesheet
    this.load.spritesheet('flag', 'assets/spriteSheets/flag.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  create() {
    // create backgrounds & map (platform, obstacle positions, start & end points, etc.)
    this.createParallaxBackgrounds();
    this.createMap();

    // create player
    this.player = this.createPlayer();
    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();

    // create stage goal
    this.createGoal();

    // create front map for snow stage
    if (this.stageKey === 'StageSnow') this.createMapFront();

    // set up world boundary & camera to follow player
    this.setWorldBoundaryAndCamera();

    // create obstacles
    for (let [obstacleKey, isOnStage] of Object.entries(this.obstacles)) {
      if (isOnStage) {
        switch (obstacleKey) {
          case 'fire':
            console.log('this stage has fire trap');
            break;

          case 'saw':
            console.log('this stage has saw trap');
            break;

          default:
            break;
        }
      }
    }

    // spikes for dungeon scene
    if (this.stageKey === 'StageDungeon') {
      this.spikes.setCollisionBetween(1, gameWidth * gameHeight);
      this.physics.add.collider(this.player, this.spikes, () => {
        // should only hurt when player lands on it?
        console.log('ouch!');
        this.player.setVelocityY(-200);
        this.player.setVelocityX(this.player.facingLeft ? 1000 : -1000);
        this.player.play('hurt', true);
      });
    }
    if (this.isMultiplayer) {
      // create opponents
        Object.keys(this.roomInfo.players).forEach((playerId) => {
        if (playerId !== this.socket.id) {
          this.opponents[playerId] = this.createPlayer();
          }
        });
          console.log('room info:', this.roomInfo);
          console.log('current opponents:', this.opponents);

      // remove opponent when they leave the room (i.e. disconnected from the server)
        this.socket.on('playerDisconnected', ({ playerId }) => {
          this.opponents[playerId].destroy(); // remove opponent's game object
          delete this.opponents[playerId]; // remove opponent's key-value pair
          console.log('one player left the stage!');
          console.log('remained opponents:', this.opponents);
        });

      // update opponent's movements
        this.socket.on('playerMoved', ({ playerId, moveState }) => {
          if (this.opponents[playerId])
          this.opponents[playerId].updateOtherPlayer(moveState);
        });
    }
  }

  update() {
    this.player.update(this.cursors /* , this.jumpSound */);
  }

  createParallaxBackgrounds() {
    const { height, width } = this.scale;
    const bg = this.bgSettings;
    for (let i = 0; i < bg.layerNum; ++i) {
      this.add
        .tileSprite(
          0,
          height,
          width * bg.tileWidth[i],
          bg.imgHeight,
          `layer${i + 1}`
        )
        .setOrigin(0, 1)
        .setScale(bg.scale)
        .setScrollFactor(bg.scrollFactors[i]);
    }
  }

  createPlayer() {
    const { x, y } = this.endPoint;
    return new player(this, x - 50, y, 'dino', this.socket, this.platform);
  }

  createGoal() {
    this.flag = this.physics.add
      .staticSprite(this.endPoint.x, this.endPoint.y, 'flag')
      .setOrigin(0.5, 1);
    this.flag.body.reset();
    this.flag.body.setSize(this.flag.width * 0.6);
    this.physics.add.overlap(this.player, this.flag, () => {
      console.log('goal!');
      this.flag.play('flag-waving', true);
    });
  }

  setWorldBoundaryAndCamera() {
    const totalWidth = tileSize * gameWidth;
    const totalHeight = tileSize * gameHeight;
    this.physics.world.setBounds(0, 0, totalWidth, totalHeight);
    this.cameras.main.setBounds(0, 0, totalWidth, totalHeight);
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
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

    // flag animation
    this.anims.create({
      key: 'flag-waving',
      frames: this.anims.generateFrameNumbers('flag', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
  }
}
