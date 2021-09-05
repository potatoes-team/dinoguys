import StageScene from './StageScene';

export default class StageDungeon extends StageScene {
  constructor() {
    super('StageDungeon');
    this.assetName = 'dungeon';
    this.obstacles = {
      fire: true,
      saw: true,
      spikes: false,
      chain: true,
      spikedball: true,
    };
    this.musicNum = 3;
    this.bgSettings = {
      layerNum: 6,
      imgHeight: 384,
      scale: 2,
      tileWidth: [2, 4, 7, 12, 12, 12],
      scrollFactors: [0, 0.2, 0.4, 0.6, 0.8, 1],
    };
    this.createMap = this.createMap.bind(this);
    this.createObstacles = this.createObstacles.bind(this);
  }

  createMap() {
    // load tilemap & tilesets
    this.map = this.add.tilemap(`${this.assetName}_tilemap`);
    const dungeon_tiles = this.map.addTilesetImage(
      'Dungeon_TileSet',
      'dungeon_tiles'
    );
    const dungeon_decor = this.map.addTilesetImage(
      'Decorative_TileSet',
      'dungeon_decor'
    );

    // create layers from bottom to top
    this.map.createLayer('Background3', dungeon_tiles, 0, 0);
    this.map.createLayer('BackGround2', dungeon_tiles, 0, 0);
    this.map.createLayer('BackGround', dungeon_decor, 0, 0);
    this.createObstacles();
    this.platform = this.map.createLayer('Platform_Layer', dungeon_tiles, 0, 0);
    this.platform.setCollisionBetween(1, this.map.width * this.map.height); // enable collision by tile index in a range
    this.spikes = this.map.createLayer('Spike_Trap', dungeon_decor, 0, 0);

    // create start & end points
    const { objects: points } = this.map.getObjectLayer('Start_End_Point');
    this.startPoint = points.find((point) => point.name === 'Start_Point');
    this.endPoint = points.find((point) => point.name === 'End_Point');

    //creating checkpoints
    const { objects: checkpoints } = this.map.getObjectLayer('Checkpoints');
    this.checkpoints = checkpoints;
    for (let i = 0; i < checkpoints.length; ++i) {
      this[`checkpoint${i + 1}`] = checkpoints.find(
        (checkpoint) => checkpoint.name === `Checkpoint${i + 1}`
      );
    }
  }

  createObstacles() {
    const sawNum = 10;
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
        duration: Math.abs(this.sawEndPoints[i].x - saw.x) * 7.5,
        angle: 3600,
      });
    });

    const fireNum = 9;
    const fireObjects = [];
    for (let i = 0; i < fireNum; i++) {
      fireObjects.push({
        name: `Fire${i + 1}`,
        key: 'fire',
      });
    }
    this.fires = this.map.createFromObjects('Fire', fireObjects);
    this.anims.create({
      key: 'fire_on',
      frames: this.anims.generateFrameNumbers('fire', { start: 0, end: 2 }),
      frameRate: 6,
      repeat: -1,
    });
    this.fires.forEach((fire) => {
      fire.setOrigin(0.5, 1);
      fire.play('fire_on', true);
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
    this.physics.world.enable(this.fires, 1);
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

    this.fires.forEach((fire) => {
      fire.body.reset();
      this.physics.add.collider(this.player, fire, () => {
        console.log('ouch!');
        this.hurt = true;
        this.cameras.main.shake(200, 0.01);
        this.player.setVelocityY(-300);
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
