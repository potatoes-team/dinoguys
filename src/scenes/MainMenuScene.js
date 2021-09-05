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
		// menu music
		this.load.audio('Strolling', 'assets/audio/Strolling.wav');
		this.load.image('title', 'assets/backgrounds/dinoguystitle.png');
		this.load.image('main-menu-background', 'assets/backgrounds/bluebackground.jpg');
		this.load.image('main-menu-crown', 'assets/sprites/crown.png');
		//load cursor hover sound
		this.load.audio('cursor', 'assets/audio/style_19_cursor_01.ogg');
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

		// creating label with crown
		const usernameLabel = mainMenuConfig.createUsernameLabel(this.username, 160, 670, {
			bgColor: 0x949398,
			strokeColor: 0x000000,
			textColor: '#000',
			iconKey: 'main-menu-crown',
			fontSize: '14px',
			fixedWidth: 200,
			fixedHeight: 15,
			isBackground: true,
		});

		const aboutLabel = mainMenuConfig.createAboutLabel('About', 1060, 670, {
			bgColor: 0x949398,
			strokeColor: 0x000000,
			textColor: '#000',
			fontSize: '14px',
			fixedWidth: 200,
			fixedHeight: 15,
			isBackground: true,
		});

		// enable physics on the textbox, image object, and others
		const physicsEnabledUsernameLabel = this.physics.add.staticGroup(usernameLabel);
		const physicsEnabledAboutLabel = this.physics.add.staticGroup(aboutLabel);

		// setting title image
		const physicsEnabledTitle = this.physics.add
			.staticImage(width / 2, height * 0.17, 'title')
			.setOrigin(0.5, 0.5)
			.setSize(410, height * 0.17);

		// initalize data once
		mainMenuConfig.initializeData(this.socket, this.username, this.menuMusic, this.cursorOver, this.clickSound);

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
		const [singlePlayerText, multiplayerText] = mainMenuConfig.createTexts(width, height);

		// adds collider physics for objects like the textboxes, image objects, etc
		mainMenuConfig.addColliders(
			physicsEnabledUsernameLabel,
			physicsEnabledAboutLabel,
			physicsEnabledTitle,
			singlePlayerText,
			multiplayerText
		);

		// these assets are going to appear in the about scene but blurred.
		// const assetsForNextScene = [background, usernameLabel, aboutLabel];

		// handle label events, on pointerdown launch next scene
		mainMenuConfig.handleLabelEvents(aboutLabel, 'mainmenu');

		// sets texts as interactive and defines functionality for pointerover and pointerout
		mainMenuConfig.handleTextEvents();

		// switch scenes
		mainMenuConfig.handleSceneSwitch();
	}
}
