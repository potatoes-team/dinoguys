import RexConfig from '../utils/RexUIConfig';

export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {
			COLOR_PRIMARY: 0x4e342e,
			COLOR_LIGHT: 0x7b5e57,
			COLOR_DARK: 0x260e04,
			titleText: 'Enter your dino name!',
		};
	}
	preload() {}
	create() {
		// createTextBox is a helper method that exists in the UsernameSceneConfig
		const usernameConfig = new RexConfig(this);
		usernameConfig
			.createTextBox(this.scale.width / 2, this.scale.height / 2, {
				wrapWidth: 500,
				fixedWidth: 500,
				fixedHeight: 50,
				colorPrimary: this.state.COLOR_PRIMARY,
				colorDark: this.state.COLOR_DARK,
				colorLight: this.state.COLOR_LIGHT,
			})
			.start(this.state.titleText, 20);
	}
	update() {}
}
