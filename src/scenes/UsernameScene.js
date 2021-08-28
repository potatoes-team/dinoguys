import RexConfig from '../utils/RexUIConfig';

export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {
			BG_COLOR: 0x4e342e, // controls the background color of the textbox
			OUTLINE_COLOR: 0x7d7371, // controls the outlining of the textbox
			titleText: 'Enter your dino name!',
		};
	}
	preload() {}
	create() {
		const usernameConfig = new RexConfig(this);
		// creates the title box with type effect
		usernameConfig
			.createTypingText(this.scale.width / 2, 200, {
				bgColor: this.state.BG_COLOR,
				outlineColor: this.state.OUTLINE_COLOR,
				fixedWidth: 300, // width of the box, how wide the box is
				fixedHeight: 30, // height of the box, how tall the box is
			})
			.start(this.state.titleText, 35); // (text, speed of typing).
		// start() docs on https://rexrainbow.github.io/

		// create textbox that can be edited
		usernameConfig.createTextBoxEditor(this.scale.width / 2, this.scale.height / 2, {
			textColor: 0xffffff,
			fontSize: '24px',
			fixedWidth: 300,
			fixedHeight: 60,
		});
	}

	update() {}
}

// var printText = this.add
// 	.text(400, 200, '', {
// 		fontSize: '12px',
// 	})
// 	.setOrigin(0.5)
// 	.setFixedSize(100, 100);

// usernameConfig.createInputText(this.scale.width / 2, this.scale.height / 2, 200, 100, {
// 	type: 'textarea',
// 	text: 'hello good morning',
// 	fontSize: '16px',
// });
/*
			
		*/
// printText.text = inputText.text;
