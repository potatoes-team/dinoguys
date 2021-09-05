import LoadingSceneConfig from '../utils/LoadingSceneConfig';

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.state = {
      maxSpan: 580,
      currentSpeed: 1,
      maxSpeed: 3,
      flagXCoord: 975,
    };
  }

  init(data) {
    this.socket = data.socket;
  }

  preload() {
    // adds dinoguystitle in the preload because of the constructor. (test -> can be changed later at group discretion)
    this.add
      .image(this.scale.width / 2, this.scale.height * 0.17, 'dinoguystitle')
      .setOrigin(0.5, 0.5);

    // renders dino sprite on state
    this.state.dino = this.add
      .sprite(350, this.scale.height / 2, 'dino')
      .setScale(2.25);

    // adds flagpole to state. flagpole's x coord is rendered with respect to the flag, however. manual heights for both the flag pole and the pole.
    this.state.flagPole = this.add
      .image(
        this.state.flagXCoord * 0.973,
        this.scale.height / 2 - 15,
        'flagpole'
      )
      .setScale(0.15);

    // renders flag sprite on state, the flag is HUGE, we SCALED DOWN for sure.
    this.state.flag = this.add
      .sprite(this.state.flagXCoord, this.scale.height / 2 - 38, 'loadingflag')
      .setScale(0.08);

    // loading configuration allows us to call class methods that take care of particular functionality.
    const loadingConfig = new LoadingSceneConfig(this);
    loadingConfig.generateRandomHint();
    loadingConfig.startMessageLoop();
    loadingConfig.createFlagAnimations('loadingflag');

    // create animations for all dinos
    const dinoKeys = ['dino', 'dino_red', 'dino_yellow', 'dino_green'];
    dinoKeys.forEach((key) => loadingConfig.createDinoAnimations(key));

    // runs specified key animations for dino and flag
    this.state.dino.play('run_dino', true);
    this.state.flag.play('start', true);

    // create loading text
    const loadingText = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 100, 'Loading...', {
        fontFamily: 'customFont',
        fontSize: '24px',
        fill: '#fff',
      })
      .setOrigin(0.5, 0.5);

    // create loading box
    const platformLine = this.add.graphics({
      lineStyle: { width: 2 },
    });

    // creates a line for the dino to run on
    platformLine.clear();
    platformLine.strokeRect(320, 380, this.scale.width / 2, 2);

    // loader event handler -> allows the dino to run across the screen
    this.load.on('progress', (percent) => {
      this.state.dino.x = this.state.maxSpan * percent + 350;
    });

    // ----------------------------------- Load Here -----------------------------------
    // title screen
    this.load.image('title', 'assets/backgrounds/dinoguystitle.png');
    this.load.image(
      'main-menu-background',
      'assets/backgrounds/bluebackground.jpg'
    );
    this.load.image('main-menu-crown', 'assets/sprites/crown.png');

    // about scene
    this.load.image('githublogo', 'assets/backgrounds/github.png');
    this.load.image('linkedinlogo', 'assets/backgrounds/linkedin.png');

    // stage-selection scene
    this.load.image('castle-name', 'assets/StageFont/Castle.png');
    this.load.image('forest-name', 'assets/StageFont/Forest.png');
    this.load.image('snow-name', 'assets/StageFont/Snow.png');

    //stage-selection background
    this.load.image(
      'castle-background',
      'assets/backgrounds/Castle-Background.png'
    );
    this.load.image(
      'forest-background',
      'assets/backgrounds/Forest-Background.png'
    );
    this.load.image(
      'snow-background',
      'assets/backgrounds/Snow-Background.png'
    );

    //stage-selection music
    this.load.audio('selection-music', 'assets/audio/8-Epic.mp3');

    // menu music
    this.load.audio('Strolling', 'assets/audio/Strolling.wav');

    // waiting scene assets
    this.load.tilemapTiledJSON(
      'WaitingScene',
      'assets/tilemaps/waitingScene-tilemap.json'
    );
    this.load.image('WaitingTiles', 'assets/tilemaps/waitingScene-tileset.png');
    this.load.image(
      'waitingBackground',
      'assets/backgrounds/waitingBackground.png'
    );
    this.load.image('waitingMiddle', 'assets/backgrounds/waitingMiddle.png');
    this.load.audio('gfy', 'assets/audio/gfy.mp3');

    // stage scenes assets
    const assetNames = ['forest', 'dungeon', 'snow'];
    const stageBgLayerNum = {
      forest: 11,
      dungeon: 6,
      snow: 3,
    };
    const snowMusicList = [
      'assets/audio/05.Niels Prayer - Confronting_Night_King.mp3',
    ];
    const dungeonMusicList = [
      'assets/audio/10-Fight.mp3',
      'assets/audio/11-Fight2.mp3',
      'assets/audio/12-Fight3.mp3',
    ];
    const forestMusicList = [
      'assets/audio/17-Prairie3.mp3',
      'assets/audio/18-Prairie4.mp3',
      'assets/audio/19-Prairie5.mp3',
    ];

    // audio
    for (let i = 0; i < snowMusicList.length; i++) {
      this.load.audio(`snow-music-${i + 1}`, snowMusicList[i]);
    }
    for (let i = 0; i < dungeonMusicList.length; i++) {
      this.load.audio(`dungeon-music-${i + 1}`, dungeonMusicList[i]);
    }
    for (let i = 0; i < forestMusicList.length; i++) {
      this.load.audio(`forest-music-${i + 1}`, forestMusicList[i]);
    }

    assetNames.forEach((assetName) => {
      // platforms, props & obstacles
      this.load.tilemapTiledJSON(
        `${assetName}_tilemap`,
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

      // background layers
      for (let i = 1; i <= stageBgLayerNum[assetName]; ++i) {
        this.load.image(
          `${assetName}_bgLayer${i}`,
          `assets/backgrounds/${assetName}/layer-${i}.png`
        );
      }
    });

    // player jump sound
    this.load.audio('jumpSound', 'assets/audio/jumpsound2.wav');

    // cursor hover sound
    this.load.audio('cursor', 'assets/audio/style_19_cursor_01.ogg');

    // clicking sound
    this.load.audio('clickSound', 'assets/audio/style_19_confirm_01.ogg');

    // stage countdown sounds
    this.load.audio('countdown-seconds', 'assets/audio/countdown-seconds.mp3');
    this.load.audio('countdown-go', 'assets/audio/countdown-go.mp3');

    // obstacles
    const obstacleTypes = ['saw', 'spike', 'chain', 'spikedball'];
    obstacleTypes.forEach((obstacleType) => {
      this.load.image(
        obstacleType,
        `assets/tilemaps/obstacle-${obstacleType}.png`
      );
    });

    this.load.spritesheet('fire', 'assets/tilemaps/obstacle-fire.png', {
      frameWidth: 48 / 3,
      frameHeight: 32,
    });

    // flag spritesheet
    this.load.spritesheet('stageflag', 'assets/spriteSheets/flag.png', {
      frameWidth: 48,
      frameHeight: 48,
    });

    // on complete event handler
    this.load.on('complete', () => {
      loadingConfig.stopMessageLoop();
      platformLine.destroy();
      loadingText.destroy();
      this.state.flag.destroy();
      this.state.flagPole.destroy();
      this.cameras.main.fade(2000, 0);
    });

    //buttons
    this.load.image('backButton', 'assets/buttons/Back.png');
  }
  create() {
    // start transition scene in parallel
    this.scene.launch('TransitionScene');

    // create
    const loadingConfig = new LoadingSceneConfig(this);
    loadingConfig.createStageFlagAnimations('stageflag');

    // in 2 seconds stop scene and load MainMenu -> as the camera fades out.
    this.time.delayedCall(2000, () => {
      this.scene.stop('LoadingScene');
      this.scene.start('UsernameScene', { socket: this.socket });
    });
  }
  update() {
    // dictates how the dino moves after used as a loading bar
    if (this.state.currentSpeed < this.state.maxSpeed)
      this.state.currentSpeed += 0.5;
    this.state.dino.x += this.state.currentSpeed;
  }
}
