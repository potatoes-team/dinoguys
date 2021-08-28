import RexConfig from '../utils/RexUIConfig';

export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {
			titleText: 'Enter your dino name!',
		};
	}
	create() {
		const usernameConfig = new RexConfig(this);
		// creates the title box with type effect
		usernameConfig
			.createTypingText(this.scale.width / 2, 200, {
				fixedWidth: 300, // width of the box, how wide the box is
				fixedHeight: 30, // height of the box, how tall the box is
				isBackground: false
			})
			.start(this.state.titleText, 35); // (text, speed of typing).

		// create textbox that can be edited
		this.time.delayedCall(1500, () =>
			usernameConfig.createTextBoxEditor(this.scale.width / 2, this.scale.height / 2, {
				textColor: 0xffffff,
				fontSize: '24px',
				fixedWidth: 300,
				fixedHeight: 60,
			})
		);
	}
}
