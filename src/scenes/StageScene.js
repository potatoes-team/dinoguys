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
    this.gameLoaded = false;
    this.hurt = false;
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
    this.isMultiplayer = data.isMultiplayer;
    this.charSpriteKey = data.charSpriteKey
  }

  create() {
    // create backgrounds, map & music
    this.createParallaxBackgrounds();
    this.createMap();
    this.createMusic();
    console.log("char sprite key",this.charSpriteKey)

    // create player
    this.createAnimations(this.charSpriteKey);
    this.player = this.createPlayer();
    this.cursors = this.input.keyboard.createCursorKeys();

    this.enableObstacles();

    // create front map for snow stage
    if (this.stageKey === 'StageSnow') this.createMapFront();

    // set up world boundary & camera to follow player
    this.setWorldBoundaryAndCamera();

    // spikes for dungeon scene
    if (this.stageKey === 'StageDungeon' || this.stageKey === 'StageSnow') {
      this.spikes.setCollisionBetween(1, gameWidth * gameHeight);
        this.physics.add.collider(this.player, this.spikes, () => {
        console.log('ouch!');
        this.hurt = true;
        this.player.setVelocityY(-200);
        this.player.setVelocityX(this.player.facingLeft ? 300 : -300);
        this.player.play(`hurt_${this.charSpriteKey}`, true);
        this.time.addEvent({delay:300, callback: () => {
          this.player.setVelocityX(0)
        }})
        this.time.addEvent({delay: 800, callback: () => {
          this.hurt = false;
        }})
      });
    }

    // create stage goal
    this.createGoal();

    // create UI
    if (!this.isMultiplayer) {
      this.createUI();
    }

    // game mechanisms for multiplayer mode
    if (this.isMultiplayer) {
      // instantiates player countdown but not visible to players
      this.playerCountdown = this.add.text(640, 80, `5`, {
        fontSize: '0px',
      })

      // create opponents
      Object.keys(this.roomInfo.players).forEach((playerId) => {
        if (playerId !== this.socket.id) {
          this.opponents[playerId] = this.createPlayer();
          console.log('opponent coords', this.opponents[playerId].x, this.opponents[playerId].y)
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

      this.socket.on('stageTimerUpdated', (time) => {
        console.log(time);
        this.playerCountdown.setFontSize('30px');
        this.playerCountdown.setText(`${time}`);
      })

      this.socket.on('startStage', (gameStatus) => {
        console.log('stage start')
        this.playerCountdown.destroy();
        this.roomInfo.gameStart = gameStatus;
      })

      // update opponent's movements
      this.socket.on('playerMoved', ({ playerId, moveState }) => {
        if (this.opponents[playerId])
          this.opponents[playerId].updateOtherPlayer(moveState);
      });
    }
  }

  update() {
    if(this.socket){
      if(!this.gameLoaded){
        // inform server that stage is loaded
        this.socket.emit('stageLoaded');
        this.gameLoaded = true;
      }
      if(this.roomInfo.gameStart) {
        this.player.update(this.cursors /* , this.jumpSound */);
      }
    }
    else {
    if(!this.hurt) {
      this.player.update(this.cursors /* , this.jumpSound */);
    }
  }
}

  createMusic() {
    let musicList = [];
    for (let i = 0; i < this.musicNum; i++) {
      const music = this.sound.add(`${this.assetName}-music-${i + 1}`);
      music.once('complete', () => {
        console.log('WHAT THE HELLLLLLL MANNN');
        const nextSong = musicList[i + 1 >= this.musicNum ? 0 : i + 1];
        nextSong.volume = 0.05;
        nextSong.play();
      });
      musicList.push(music);
    }
    this.backgroundMusic = musicList[0];
    this.backgroundMusic.volume = 0.05;
    this.backgroundMusic.play();
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
          `${this.assetName}_bgLayer${i + 1}`
        )
        .setOrigin(0, 1)
        .setScale(bg.scale)
        .setScrollFactor(bg.scrollFactors[i]);
    }
  }

  createPlayer() {
    const { x, y } = this.startPoint;
    return new player(this, x, y, this.charSpriteKey, this.socket, this.platform);
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
      this.physics.world.disable(this.flag);
      this.add
        .text(
          gameWidth * tileSize - this.scale.width / 2,
          gameHeight * tileSize - this.scale.height / 2,
          'SUCCESS!',
          {
            fontSize: '100px',
            fill: '#fff',
          }
        )
        .setOrigin(0.5, 0.5);
    });
  }

  createUI() {
    const homeButton = this.add
      .text(this.scale.width - 20, 20, 'HOME', {
        fontSize: '30px',
        fill: '#fff',
      })
      .setScrollFactor(0)
      .setOrigin(1, 0);
    homeButton.setInteractive();
    homeButton.on('pointerup', () => {
      this.sound.stopAll();
      this.scene.stop(this.stageKey);
      this.scene.start(
        'StageSelection' /* , { previousStage: this.stageKey } */
      );
    });
  }

  setWorldBoundaryAndCamera() {
    const totalWidth = tileSize * gameWidth;
    const totalHeight = tileSize * gameHeight;
    this.physics.world.setBounds(0, 0, totalWidth, totalHeight);
    this.cameras.main.setBounds(0, 0, totalWidth, totalHeight);
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
  }

  createAnimations(key) {
    // player animations
    this.anims.create({
      key: `idle_${key}`,
      frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: `run_${key}`,
      frames: this.anims.generateFrameNumbers(key, { start: 4, end: 9 }),
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
      key: `hurt_${key}`,
      frames: this.anims.generateFrameNumbers(key, { start: 13, end: 16 }),
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
