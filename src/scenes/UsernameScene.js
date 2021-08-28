import RexConfig from '../utils/RexUIConfig';

export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {
			// COLOR_PRIMARY: 0x4e342e, // controls the background color of the textbox
			// COLOR_LIGHT: 0x7d7371, // controls the outlining of the textbox
			// COLOR_DARK: 0x0d1b1e, // can use to color icons
			titleText: 'Enter your dino name!',
		};
	}
	preload() {}
	create() {
		const usernameConfig = new RexConfig(this);
		usernameConfig
			.createTypingText(this.scale.width / 2, 100, {
				fixedWidth: 300,
				fixedHeight: 30,
			})
			.start(this.state.titleText, 30); // (text, speed of typing).
		// start() docs on https://rexrainbow.github.io/

		// usernameConfig.createNormalTextBox(this.scale.width / 2, this.scale.height / 2, {
		// 	// createTextBox is a helper method that exists in the UsernameSceneConfig
		// 	frameWidth: 600, // width of the box, how wide the box is
		// 	fixedHeight: 30, // height of the box, how tall the box is
		// 	colorPrimary: 0x4e342e,
		// 	colorLight: 0x7d7371,
		// });
		// var printText = this.add
		// 	.text(400, 200, '', {
		// 		fontSize: '12px',
		// 	})
		// 	.setOrigin(0.5)
		// 	.setFixedSize(100, 100);
		var inputText = this.add
			.rexInputText(400, 400, 10, 10, {
				type: 'textarea',
				text: 'hello world',
				fontSize: '12px',
			})
			.resize(100, 100)
			.setOrigin(0.5)
			// .on('textchange', function (inputText) {
			// 	printText.text = inputText.text;
			// })
			.on('focus', function (inputText) {
				console.log('On focus');
			})
			.on('blur', function (inputText) {
				console.log('On blur');
			})
			.on('click', function (inputText) {
				console.log('On click');
			})
			.on('dblclick', function (inputText) {
				console.log('On dblclick');
			});

		// printText.text = inputText.text;
	}
	update() {}
}
