import MainMenuSceneConfig from '../utils/MainMenuSceneConfig';

export default class MainMenuScene extends Phaser.Scene {
	constructor() {
		super('MainMenuScene');
	}

	// init(data) {
	// 	this.socket = data.socket;
	// 	this.username = data.username;
	// }
	preload() {
		this.load.image('title', 'assets/backgrounds/dinoguystitle.png');
		this.load.image('main-menu-background', 'assets/backgrounds/bluebackground.jpg');
		this.load.image('main-menu-crown', 'assets/sprites/crown.png');
		this.load.audio('Strolling', 'assets/audio/Strolling.wav');
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
		const mainMenuConfig = new MainMenuSceneConfig(this);
		const { width, height } = this.scale;
		if (!this.menuMusic) {
			this.menuMusic = this.sound.add('Strolling');
		}
		if (!this.menuMusic.isPlaying) {
			this.menuMusic.play({
				volume: 0.1,
				loop: true,
			});
		}

		// setting the blue background
		this.add.image(0, 0, 'main-menu-background').setOrigin(0);

		// setting title image
		// const imageObject = this.add.image(width / 2, height * 0.17, 'title').setOrigin(0.5, 0.5);

		// creating label with crown
		const textBox = mainMenuConfig.createTextLabel(this.username, 120, 670, {
			bgColor: 0x949398,
			strokeColor: 0x000000,
			textColor: '#000',
			iconKey: 'main-menu-crown',
			fontSize: '16px',
			fixedWidth: 120,
			fixedHeight: 15,
			isBackground: true,
		});
		// enable physics on the textbox, image object, and others
		const physicsEnabledBox = this.physics.add.staticGroup(textBox);
		const physicsEnabledTitle = this.physics.add
			.staticImage(width / 2, height * 0.17, 'title')
			.setOrigin(0.5, 0.5)
			.setSize(410, height * 0.17);

		// creates single player sprite under the singleplayer text
		mainMenuConfig.showSinglePlayerChar();

		// starts looping through random sprites on interval
		mainMenuConfig.startSinglePlayerCharLoop();

		// shows all multiplayer characters under the multiplayer text
		mainMenuConfig.showMultiplayerChars(this.socket, this.username, this.menuMusic);

		// creates dino group (falling dinos)
		mainMenuConfig.createDinoGroup();

		// adds collider physics for objects like the textbox, image object, etc
		mainMenuConfig.addColliders(physicsEnabledBox, physicsEnabledTitle);

		// starts spawning dinos to fall from a specific x and y
		mainMenuConfig.startFallingDinosLoop();

		// creates singlePlayer and multiplayer text
		mainMenuConfig.createTexts(width, height);

		// sets texts as interactive and defines functionality for pointerover and pointerout
		mainMenuConfig.handleTextEvents();

		// switch scenes
		mainMenuConfig.handleSceneSwitch(this.socket, this.username, this.menuMusic);
	}
}
