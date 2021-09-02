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

		// setting the blue background
		this.add.image(0, 0, 'main-menu-background').setOrigin(0);

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
		mainMenuConfig.initializeData(this.socket, this.username, this.menuMusic, this.cursorOver);

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
		const [physicsText1, physicsText2] = mainMenuConfig.createTexts(width, height);

		// adds collider physics for objects like the textbox, image object, etc
		mainMenuConfig.addColliders(physicsEnabledBox, physicsEnabledTitle, physicsText1, physicsText2);

		// sets texts as interactive and defines functionality for pointerover and pointerout
		mainMenuConfig.handleTextEvents();

		// switch scenes
		mainMenuConfig.handleSceneSwitch();
	}
}
