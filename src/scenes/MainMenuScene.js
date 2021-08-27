export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  init(data) {
    this.socket = data.socket;
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 4, 'Main Menu Scene', { fontSize: '32px' })
      .setOrigin(0.5, 0.5);

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
      this.scene.start('CharSelection');
      // this.scene.start('StageSelection', { socket: this.socket });
    });

    multiplayerBtn.on('pointerup', () => {
      this.scene.stop('MainMenuScene');
      this.scene.start('LobbyScene', { socket: this.socket });
    });
  }
}
