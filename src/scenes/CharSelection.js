import 'phaser';

export default class CharSelection extends Phaser.Scene {
  constructor() {
    super('CharSelection');
  }

  init(data) {
    this.socket = data.socket;
    this.username = data.username;
    this.isMultiplayer = data.isMultiplayer;
    this.menuMusic = data.menuMusic;
  }

  create() {
    const width = this.game.config.width;
    const height = this.game.config.height;

    // SFX for buttons
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

    // background
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

    // Choose your dino text
    this.add
      .text(width / 2, height * 0.1, 'Choose Your Dino', {
        fontFamily: 'customFont',
        fontSize: '44px',
        color: '#000',
      })
      .setStroke('#fff', 2)
      .setOrigin(0.5, 0.5);

    // Adding Dino sprite to the game using Dino keys from SpriteLoaderScene
    const charSpriteArr = ['dino', 'dino_red', 'dino_yellow', 'dino_green'];
    charSpriteArr.forEach((key, i) => {
      const dino = this.add
        .sprite(width * 0.2 * (i + 1), height / 2, key)
        .setScale(7)
        .setInteractive();

      // Dinos have idle animation by default when CharSelection Scene is loaded
      dino.play(`idle_${key}`, true);

      /* Hovering the mouse pointer over the dino sprites to animate them.
      When mouse pointer is away from the dino sprites, they will stand idle once again */
      dino.on('pointerover', () => {
        dino.play(`run_${key}`, true);
        this.cursorOver.play();
      });
      dino.on('pointerout', () => {
        dino.play(`idle_${key}`, true);
        this.cursorOver.stop();
      });

      dino.on('pointerdown', () => {
        this.clickSound.play();
      });

      /* Once choosing the character by clicking on the dinos,
      the player will be sent to the lobby screen if they clicked multiplayer button in main menu
      and stage selection scene if they clicked singleplayer button in main menu */
      dino.on('pointerup', () => {
        this.input.enabled = false;
        this.scene.stop('CharSelection');
        if (this.isMultiplayer) {
          this.scene.start('LobbyScene', {
            socket: this.socket,
            charSpriteKey: key,
            username: this.username,
            menuMusic: this.menuMusic,
          });
        } else {
          this.scene.start('StageSelection', {
            charSpriteKey: key,
            menuMusic: this.menuMusic,
          });
        }
      });
    });
    this.createUI();
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

  createUI() {
    const backButton = this.add
      .image(this.scale.width - 20, 20, 'backButton')
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setScale(4);
    backButton.setInteractive();

    backButton.on('pointerover', () => {
      backButton.setTint(0xc2c2c2);
      this.cursorOver.play();
    });
    backButton.on('pointerout', () => {
      backButton.clearTint();
      this.cursorOver.stop();
    });
    backButton.on('pointerdown', () => {
      this.clickSound.play();
      backButton.setTint(0x3f3f3f);
    });
    backButton.on('pointerup', () => {
      this.input.enabled = false;
      this.scene.stop('CharSelection');
      this.scene.start('MainMenuScene');
    });
  }
}
