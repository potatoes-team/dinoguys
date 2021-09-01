export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  init(data) {
    this.socket = data.socket;
    this.username = data.username;
  }

  create() {
    // chuck
    console.log(this.username + ' is alive and well from the MainMenuScene');
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 4, 'Main Menu Scene', { fontSize: '32px' })
      .setOrigin(0.5, 0.5);

    if (!this.menuMusic) {
      this.menuMusic = this.sound.add('Strolling');
    }
    if (!this.menuMusic.isPlaying) {
      this.menuMusic.play({
        volume: 0.1,
        loop: true,
      });
    }

    const singlePlayerBtn = this.add
      .text(width / 3, (height / 4) * 2, 'Single-Player', { fontSize: '24px' })
      .setOrigin(0.5, 0.5);
    const multiplayerBtn = this.add
      .text((width / 3) * 2, (height / 4) * 2, 'Multiplayer', {
        fontSize: '24px',
      })
      .setOrigin(0.5, 0.5);

    singlePlayerBtn.setInteractive();
    multiplayerBtn.setInteractive();

    singlePlayerBtn.on('pointerup', () => {
      this.scene.stop('MainMenuScene');
      this.scene.start('CharSelection', {
        isMultiplayer: false,
        menuMusic: this.menuMusic,
      });
    });

    multiplayerBtn.on('pointerup', () => {
      this.scene.stop('MainMenuScene');
      this.scene.start('CharSelection', {
        socket: this.socket,
        username: this.username,
        isMultiplayer: true,
        menuMusic: this.menuMusic,
      });
    });
  }
}
