export default class MainMenuScene extends Phaser.Scene {
<<<<<<< HEAD
	constructor() {
		super('MainMenuScene');
	}
	preload() {
		// adds dinoguystitle in the preload because it was loaded in the LoadingScene.js
		this.add
			.image(this.scale.width / 2, this.scale.height * 0.17, 'dinoguystitle')
			.setOrigin(0.5, 0.5);
	}
	create() {
		this.add
			.text(this.scale.width / 2, this.scale.height / 2, 'Main Menu Scene', {
				fontSize: '32px',
			})
			.setOrigin(0.5, 0.5);
	}
}
// pass is in { isMultiplayer: true } or { isMultiplayer: false }
=======
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
      this.scene.start('StageSelection', { socket: this.socket });
    });

    multiplayerBtn.on('pointerup', () => {
      this.scene.stop('MainMenuScene');
      this.scene.start('LobbyScene', { socket: this.socket });
    });
  }
}
>>>>>>> main
