import UsernameSceneConfig from '../utils/UsernameSceneConfig';

export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {
			COLOR_PRIMARY: '#4e342e',
			COLOR_LIGHT: '#7b5e57',
			COLOR_DARK: '#260e04',
			titleText: 'Enter your dino name!',
		};
	}
	preload() {}
	create() {
		// createTextBox is a helper method that exists in the UsernameSceneConfig
		const usernameConfig = new UsernameSceneConfig(this);
		usernameConfig
			.createTextBox(this.scale.width / 2, this.scale.height / 2, {
				wrapWidth: 500,
				fixedWidth: 500,
				fixedHeight: 65,
				colorPrimary: this.state.COLOR_PRIMARY,
				colorDark: this.state.COLOR_DARK,
				colorLight: this.state.COLOR_LIGHT,
			})
			.start(this.state.titleText, 20);
	}
	update() {}
}
