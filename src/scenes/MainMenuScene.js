import MainMenuSceneConfig from '../utils/MainMenuSceneConfig';
import PlayerConfig from '../utils/PlayerConfig';

export default class MainMenuScene extends Phaser.Scene {
	constructor() {
		super('MainMenuScene');
	}

	// init(data) {
	// 	this.socket = data.socket;
	// 	this.username = data.name;
	// }

	preload() {
		// FOR DEV
		this.load.image('title', 'assets/backgrounds/dinoguystitle.png');
		this.load.image('main-menu-background', 'assets/backgrounds/bluebackground.jpg');
		this.load.image('main-menu-crown', 'assets/sprites/crown.png');
		this.load.spritesheet('dino', 'assets/spriteSheets/dino-blue.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
		this.load.spritesheet('dino_red', 'assets/spriteSheets/dino-red.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
		this.load.spritesheet('dino_yellow', 'assets/spriteSheets/dino-yellow.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
		this.load.spritesheet('dino_green', 'assets/spriteSheets/dino-green.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
	}
	create() {
		const playerConfig = new PlayerConfig(this);
		const rexUIConfig = new MainMenuSceneConfig(this);
		const { width, height } = this.scale;
		// console.log(this.socket.id);

		// creates animations on this scene.
		playerConfig.createDinoAnimations('dino');
		playerConfig.createDinoAnimations('dino_red');
		playerConfig.createDinoAnimations('dino_yellow');
		playerConfig.createDinoAnimations('dino_green');

		// setting the blue background
		this.add.image(0, 0, 'main-menu-background').setOrigin(0);

		// setting title image
		this.add.image(width / 2, height * 0.17, 'title').setOrigin(0.5, 0.5);

		// creating label with crown
		const textBox = rexUIConfig.createTextLabel(this.username, 120, 670, {
			bgColor: 0x949398,
			strokeColor: 0x000000,
			textColor: '#000',
			iconKey: 'main-menu-crown',
			fontSize: '16px',
			fixedWidth: 120,
			fixedHeight: 15,
			isBackground: true,
		});
		// enable physics on the textbox
		const physicsEnableBox = this.physics.add.staticGroup(textBox);
		// creates single player sprite under the singleplayer text
		rexUIConfig.showSinglePlayerChar();
		// starts looping through random sprites on interval
		rexUIConfig.startSinglePlayerCharLoop();
		// shows all multiplayer characters under the multiplayer text
		rexUIConfig.showMultiplayerChars();
		// creates dino group (falling dinos)
		rexUIConfig.createDinoGroup(physicsEnableBox);
		// starts spawning dinos to fall from a specific x and y
		rexUIConfig.startFallingDinosLoop();

		const singlePlayerBtn = this.add
			.text(width / 3, (height / 4) * 2, 'Single-Player', {
				fontSize: '24px',
				color: '#000',
			})
			.setOrigin(0.5, 0.5);
		const multiplayerBtn = this.add
			.text((width / 3) * 2, (height / 4) * 2, 'Multiplayer', {
				fontSize: '24px',
				color: '#000',
			})
			.setOrigin(0.5, 0.5);

		singlePlayerBtn.setInteractive();
		multiplayerBtn.setInteractive();

		singlePlayerBtn.on('pointerover', () => {
			singlePlayerBtn.setStroke('#fff', 2);
		});

		singlePlayerBtn.on('pointerout', () => {
			singlePlayerBtn.setStroke('#000', 0);
		});

		multiplayerBtn.on('pointerover', () => {
			multiplayerBtn.setStroke('#fff', 2);
		});

		multiplayerBtn.on('pointerout', () => {
			multiplayerBtn.setStroke('#000', 0);
		});

		// FOR DEV
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
