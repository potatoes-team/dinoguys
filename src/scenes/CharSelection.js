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
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

    // Choose your dino text
    this.add
      .text(width / 2, height * 0.1, 'Choose Your Dino', {
        fontFamily: 'customFont',
        fontSize: '44px',
      })
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

      /* Once choosing the character by clicking on the dinos,
      the player will be sent to the lobby screen if they clicked multiplayer button in main menu
      and stage selection scene if they clicked singleplayer button in main menu */
      dino.on('pointerup', () => {
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

  createUI() {
    const backButton = this.add
      .text(this.scale.width - 20, 20, 'GO BACK', {
        fontFamily: 'customFont',
        fontSize: '15px',
        fill: '#fff',
      })
      .setScrollFactor(0)
      .setOrigin(1, 0);
    backButton.setInteractive();

    backButton.on('pointerover', () => {
      this.cursorOver.play();
    });
    backButton.on('pointerout', () => {
      this.cursorOver.stop();
    });
    backButton.on('pointerup', () => {
      this.scene.stop('CharSelection');
      this.scene.start('MainMenuScene');
    });
  }
}
