import MainMenuSceneConfig from '../utils/MainMenuSceneConfig';

export default class MainMenuScene extends Phaser.Scene {
	constructor() {
		super('MainMenuScene');
	}

	// init(data) {
	// 	this.socket = data.socket;
	// 	this.username = data.name;
	// }
	preload() {
		this.load.image('title', 'assets/backgrounds/dinoguystitle.png');
		this.load.image('main-menu-background', 'assets/backgrounds/bluebackground.jpg');
		this.load.image('main-menu-crown', 'assets/sprites/crown.png');
	}
	create() {
		const rexUIConfig = new MainMenuSceneConfig(this);
		const { width, height } = this.scale;

		// console.log(this.socket.id);
		// setting the blue background
		this.add.image(0, 0, 'main-menu-background').setOrigin(0);

		// setting title image
		this.add.image(width / 2, height * 0.17, 'title').setOrigin(0.5, 0.5);

		// creating label with crown
		rexUIConfig.createTextLabel('username', 120, 670, {
			bgColor: 0x949398,
			strokeColor: 0x000000,
			textColor: '#000',
			iconKey: 'main-menu-crown',
			fontSize: '16px',
			fixedWidth: 120,
			fixedHeight: 15,
			isBackground: true,
		});

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

		// singlePlayerBtn.on('pointerup', () => {
		// 	this.scene.stop('MainMenuScene');
		// 	this.scene.start('CharSelection', { isMultiplayer: false });
		// });

		// multiplayerBtn.on('pointerup', () => {
		// 	this.scene.stop('MainMenuScene');
		// 	this.scene.start('CharSelection', { socket: this.socket, isMultiplayer: true });
		// });
	}
}
