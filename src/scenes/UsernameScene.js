import RexConfig from '../utils/RexUIConfig';

export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {
			COLOR_PRIMARY: 0x4e342e, // controls the background color of the textbox
			COLOR_LIGHT: 0x7d7371, // controls the outlining of the textbox
			// COLOR_DARK: 0x0d1b1e, // can use to color icons
			titleText: 'Enter your dino name!',
		};
	}
	preload() {}
	create() {
		// createTextBox is a helper method that exists in the UsernameSceneConfig
		const usernameConfig = new RexConfig(this);
		usernameConfig
			.createNormalTextBox(this.scale.width / 2, this.scale.height / 2, {
				fixedWidth: 300,
				fixedHeight: 30,
				colorPrimary: this.state.COLOR_PRIMARY,
				// colorDark: this.state.COLOR_DARK,
				colorLight: this.state.COLOR_LIGHT,
			})
			.start(this.state.titleText, 30);
	}
	update() {}
}
