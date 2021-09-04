import MainMenuSceneConfig from '../utils/MainMenuSceneConfig';

export default class AboutScene extends Phaser.Scene {
	constructor() {
		super('AboutScene');
	}

	create() {
		// using mainMenuConfig
		const mainMenuConfig = new MainMenuSceneConfig(this);

		// setting the blue background
		const background = this.add.image(0, 0, 'main-menu-background').setOrigin(0);
		background.alpha = 0.1;
		const aboutLabel = mainMenuConfig.createAboutLabel('Back', 1060, 670, {
			bgColor: 0x949398,
			strokeColor: 0x000000,
			textColor: '#000',
			fontSize: '14px',
			fixedWidth: 200,
			fixedHeight: 15,
			isBackground: true,
		});
		// handle cursorOver sound
		this.cursorOver = this.sound.add('cursor');
		this.cursorOver.volume = 0.05;

		// handle label events, on pointerdown launch next scene
		mainMenuConfig.handleLabelEvents(aboutLabel, 'about', this.cursorOver);
	}
}
