import StageScene from './StageScene';

export default class StageDungeon extends StageScene {
  constructor() {
    super('StageDungeon');
    this.assetName = 'dungeon';
    this.obstacles = {
      fire: true,
      saw: true,
      spikes: false,
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
    this.createObstacles = this.createObstacles.bind(this)
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

    // load obstacles
    // const fire = this.map.addTilesetImage('Fire', 'fire');
    // const saw = this.map.addTilesetImage('Saw', 'saw');

    // create layers from bottom to top
    this.map.createLayer('Background3', dungeon_tiles, 0, 0);
    this.map.createLayer('BackGround2', dungeon_tiles, 0, 0);
    this.map.createLayer('BackGround', dungeon_decor, 0, 0);
    this.createObstacles();
    this.platform = this.map.createLayer('Platform_Layer', dungeon_tiles, 0, 0);
    this.platform.setCollisionBetween(1, this.map.width * this.map.height); // enable collision by tile index in a range

    // this.saw = this.map.createLayer('Saw_Trap', saw, 0, 0);
    // this.fire = this.map.createLayer('Fire_Trap', fire, 0, 0);
    this.spikes = this.map.createLayer('Spike_Trap', dungeon_decor, 0, 0);

    // create start & end points
    const { objects: points } = this.map.getObjectLayer('Start_End_Point');
    this.startPoint = points.find((point) => point.name === 'Start_Point');
    this.endPoint = points.find((point) => point.name === 'End_Point');
  }

  createObstacles() {
    const sawNum = 10;
    const sawObjects = []
    for(let i = 0; i < sawNum; i++) {
      sawObjects.push({
        name: `Saw${i+1}Start`,
        key: 'saw'
      })
    }
    this.saws = this.map.createFromObjects('Saw', sawObjects);
    const { objects: points } = this.map.getObjectLayer('Saw')
    this.sawEndPoints = points.filter((point) => point.name.includes('End'));
    this.saws.forEach((saw, i) => {
      this.tweens.add({
        targets: saw,
        x: this.sawEndPoints[i].x,
        ease: 'linear',
        yoyo: true,
        repeat: -1,
        duration: Math.abs(this.sawEndPoints[i].x - saw.x)*7.5,
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
