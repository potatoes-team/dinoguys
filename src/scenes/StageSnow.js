import StageScene from './StageScene';

export default class StageSnow extends StageScene {
  constructor() {
    super('StageSnow');
    this.assetName = 'snow';
    this.obstacles = {
      fire: true,
      saw: true,
      spikes: false,
      chain: true,
      spikedball: true,
    };
    this.musicNum = 1;
    this.bgSettings = {
      layerNum: 3,
      imgHeight: 640,
      scale: 1.3,
      tileWidth: [2, 4, 7],
      scrollFactors: [0, 0.4, 1],
    };
    this.createMap = this.createMap.bind(this);
    this.createMapFront = this.createMapFront.bind(this);
    this.createObstacles = this.createObstacles.bind(this);
  }

  createMap() {
    // load tilemap & tilesets
    this.map = this.add.tilemap(`${this.assetName}_tilemap`);
    this.snow_tiles = this.map.addTilesetImage('Platform1', 'snow_tiles');
    this.snow_decor = this.map.addTilesetImage('Platform2', 'snow_decor');

    // create layers from bottom to top
    this.map.createLayer(
      'Background',
      [this.snow_tiles, this.snow_decor],
      0,
      0
    );
    this.map.createLayer('Background1', this.snow_tiles, 0, 0);
    this.createObstacles();
    this.platform = this.map.createLayer(
      'Platform',
      [this.snow_tiles, this.snow_decor],
      0,
      0
    );
    this.platform.setCollisionBetween(1, this.map.width * this.map.height); // enable collision by tile index in a range
    this.map.createLayer('CastleGround', this.snow_tiles, 0, 0);

    this.spikes = this.map.createLayer('Traps', this.snow_decor);

    // create start & end points
    const { objects: points } = this.map.getObjectLayer('Start_End_Point');
    this.startPoint = points.find((point) => point.name === 'Start');
    this.endPoint = points.find((point) => point.name === 'End');

    //creating checkpoints
    const { objects: checkpoints } = this.map.getObjectLayer('Checkpoints');
    this.checkpoints = checkpoints;
    for (let i = 0; i < checkpoints.length; ++i) {
      this[`checkpoint${i + 1}`] = checkpoints.find(
        (checkpoint) => checkpoint.name === `Checkpoint${i + 1}`
      );
    }
  }

  createMapFront() {
    this.map.createLayer('Snow', this.snow_tiles, 0, 0);
    this.map.createLayer('Front', this.snow_tiles, 0, 0);
  }

  createObstacles() {
    const sawNum = 5;
    const sawObjects = [];
    for (let i = 0; i < sawNum; i++) {
      sawObjects.push({
        name: `Saw${i + 1}Start`,
        key: 'saw',
      });
    }
    this.saws = this.map.createFromObjects('Saw', sawObjects);
    const { objects: points } = this.map.getObjectLayer('Saw');
    this.sawEndPoints = points.filter((point) => point.name.includes('End'));
    this.saws.forEach((saw, i) => {
      this.tweens.add({
        targets: saw,
        x: this.sawEndPoints[i].x,
        ease: 'linear',
        yoyo: true,
        repeat: -1,
        duration: (this.sawEndPoints[i].x - saw.x) * 7.5,
        angle: 3600,
      });
    });

    const { objects: chains } = this.map.getObjectLayer('Spikedball');
    this.spikedBallStartPoints = chains.filter((point) =>
      point.name.includes('Start')
    );
    this.spikedBallEndPoints = chains.filter((point) =>
      point.name.includes('End')
    );
    this.anchorPoints = [];
    this.spikedBalls = [];
    this.spikedBallStartPoints.forEach((chain, i) => {
      const dist = chain.y - this.spikedBallEndPoints[i].y;
      const chainGap = 5;
      const chainNum = Math.abs(dist) / chainGap;
      const chainGroup = [];
      for (let i = 0; i < chainNum; i++) {
        const up = dist > 0 ? -1 : 1;
        chainGroup.push(
          this.add.image(chain.x, chain.y + chainGap * i * up, 'chain')
        );
      }
      const spikedBall = this.add.image(
        chain.x,
        this.spikedBallEndPoints[i].y,
        'spikedball'
      );
      this.spikedBalls.push(spikedBall);
      chainGroup.push(spikedBall);
      this[`group${i}`] = this.add.group(chainGroup);
      let point = new Phaser.Geom.Point(chain.x, chain.y);
      this.anchorPoints.push(point);
    });
  }

  enableObstacles() {
    this.physics.world.enable(this.saws);
    this.physics.world.enable(this.spikedBalls);
    this.saws.forEach((saw) => {
      saw.body.setCircle(20);
      saw.body.setAllowGravity(false);
      saw.body.pushable = false;
      saw.body.setImmovable(true);
      this.physics.add.collider(this.player, saw, () => {
        console.log('ouch!');
        this.hurt = true;
        this.cameras.main.shake(200, 0.01);
        this.player.setVelocityY(-200);
        this.player.setVelocityX(this.player.facingLeft ? 300 : -300);
        this.player.play(`hurt_${this.charSpriteKey}`, true);
        this.hurtSound.play();
        this.time.addEvent({
          delay: 300,
          callback: () => {
            this.player.setVelocityX(0);
          },
        });
        this.time.addEvent({
          delay: 800,
          callback: () => {
            this.hurt = false;
          },
        });
      });
    });
    this.spikedBalls.forEach((spikedBall) => {
      spikedBall.body.setCircle(14);
      spikedBall.body.setAllowGravity(false);
      spikedBall.body.pushable = false;
      spikedBall.body.setImmovable(true);
      this.physics.add.collider(this.player, spikedBall, () => {
        console.log('ouch!');
        this.hurt = true;
        this.cameras.main.shake(200, 0.01);
        this.player.setVelocityY(-200);
        this.player.setVelocityX(this.player.facingLeft ? 300 : -300);
        this.player.play(`hurt_${this.charSpriteKey}`, true);
        this.hurtSound.play();
        this.time.addEvent({
          delay: 300,
          callback: () => {
            this.player.setVelocityX(0);
          },
        });
        this.time.addEvent({
          delay: 800,
          callback: () => {
            this.hurt = false;
          },
        });
      });
    });
  }
}
