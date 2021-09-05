import MainMenuSceneConfig from '../utils/MainMenuSceneConfig';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  init(data) {
    this.socket = data.socket;
    this.username = data.username;
  }

  create() {
    const mainMenuConfig = new MainMenuSceneConfig(this);
    const { width, height } = this.scale;

    // menu music functionality
    if (!this.menuMusic) {
      this.menuMusic = this.sound.add('Strolling');
    }
    if (!this.menuMusic.isPlaying) {
      this.menuMusic.play({
        volume: 0.1,
        loop: true,
      });
    }

    // cursor over effect functionality
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

    //create click sound
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

    // setting the blue background
    this.add.image(0, 0, 'main-menu-background').setOrigin(0);

    // create clouds in background at random positions & angle
    const cloudImgNum = 6;
    const cloudTotalNum = 20;
    this.clouds = [];
    for (let i = 0; i < cloudTotalNum; i++) {
      const x = Math.floor(Math.random() * this.scale.width);
      const y = Math.floor(Math.random() * this.scale.height);
      const angle = Math.floor(Math.random() * -10);
      const cloud = this.add
        .image(x, y, `cloud-0${(i % cloudImgNum) + 1}`)
        .setScale(3)
        .setAngle(angle);
      this.tweens.add({
        targets: cloud,
        scale: { from: 2.9, to: 3.1 },
        delay: i * 100,
        repeat: -1,
        yoyo: true,
      });
      this.clouds.push(cloud);
    }

    // creating label with crown
    const textBox = mainMenuConfig.createTextLabel(this.username, 160, 670, {
      bgColor: 0x949398,
      strokeColor: 0x000000,
      textColor: '#000',
      iconKey: 'main-menu-crown',
      fontSize: '14px',
      fixedWidth: 200,
      fixedHeight: 15,
      isBackground: true,
    });
    // enable physics on the textbox, image object, and others
    const physicsEnabledBox = this.physics.add.staticGroup(textBox);

    // setting title image
    const physicsEnabledTitle = this.physics.add
      .staticImage(width / 2, height * 0.17, 'title')
      .setOrigin(0.5, 0.5)
      .setSize(410, height * 0.17);

    // initalize data once
    mainMenuConfig.initializeData(
      this.socket,
      this.username,
      this.menuMusic,
      this.cursorOver,
      this.clickSound
    );

    // creates single player sprite under the singleplayer text
    mainMenuConfig.showSinglePlayerChar();

    // starts looping through random sprites on interval
    mainMenuConfig.startSinglePlayerCharLoop();

    // shows all multiplayer characters under the multiplayer text
    mainMenuConfig.showMultiplayerChars();

    // creates dino group (falling dinos)
    mainMenuConfig.createDinoGroup();

    // starts spawning dinos to fall from a specific x and y
    mainMenuConfig.startFallingDinosLoop();

    // creates singlePlayer and multiplayer text
    const [physicsText1, physicsText2] = mainMenuConfig.createTexts(
      width,
      height
    );

    // adds collider physics for objects like the textbox, image object, etc
    mainMenuConfig.addColliders(
      physicsEnabledBox,
      physicsEnabledTitle,
      physicsText1,
      physicsText2
    );

    // sets texts as interactive and defines functionality for pointerover and pointerout
    mainMenuConfig.handleTextEvents();

    // switch scenes
    mainMenuConfig.handleSceneSwitch();
  }

  update() {
    // move clouds from right to left repeatedly at random height
    this.clouds.forEach((cloud) => {
      cloud.x -= 0.5;
      if (cloud.x < -100) {
        cloud.x = this.scale.width + 100;
        cloud.y = Math.floor(Math.random() * this.scale.height);
      }
    });
  }
}
