import StageScene from './StageScene';

export default class StageSnow extends StageScene {
  constructor() {
    super('StageSnow');
    this.assetName = 'snow';
    this.obstacles = {
      fire: true,
      saw: true,
      spikes: false,
    };
    this.musicNum = 1
    this.bgSettings = {
      layerNum: 3,
      imgHeight: 640,
      scale: 1.3,
      tileWidth: [2, 4, 7],
      scrollFactors: [0, 0.4, 1],
    };
    this.createMap = this.createMap.bind(this);
    this.createMapFront = this.createMapFront.bind(this);
    this.createObstacles = this.createObstacles.bind(this)
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
    this.createObstacles()
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
  }

  createMapFront() {
    this.map.createLayer('Snow', this.snow_tiles, 0, 0);
    this.map.createLayer('Front', this.snow_tiles, 0, 0);
  }

  createObstacles() {
    const sawNum = 5;
    const sawObjects = [];
    for(let i = 0; i < sawNum; i++) {
      sawObjects.push({
        name: `Saw${i+1}Start`,
        key: 'saw'
      })

    }
    this.saws = this.map.createFromObjects('Saw', sawObjects);
    const { objects: points } = this.map.getObjectLayer('Saw')
    console.log(points)
    this.sawEndPoints = points.filter((point) => point.name.includes('End'));
    this.saws.forEach((saw, i) => {
      this.tweens.add({
        targets: saw,
        x: this.sawEndPoints[i].x,
        ease: 'linear',
        yoyo: true,
        repeat: -1,
        duration: (this.sawEndPoints[i].x - saw.x)*7.5,
        angle: 3600
      })
    })
  }
  
  enableObstacles() {
    this.physics.world.enable(this.saws)
    this.saws.forEach((saw) => {
      saw.body.setCircle(20)
      saw.body.setAllowGravity(false)
      saw.body.pushable = false;
      saw.body.setImmovable(true);
      console.log(saw)
      this.physics.add.collider(this.player, saw, () => {
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
    });
  }
}
