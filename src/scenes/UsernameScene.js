import RexConfig from '../utils/RexUIConfig';

export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {
			// BG_COLOR: 0x4e342e, // controls the background color of the textbox
			// OUTLINE_COLOR: 0x7d7371, // controls the outlining of the textbox
			// COLOR_DARK: 0x0d1b1e, // can use to color icons
			titleText: 'Enter your dino name!',
		};
	}
	preload() {}
	create() {
		const usernameConfig = new RexConfig(this);
		usernameConfig
			.createTypingText(this.scale.width / 2, 100, {
				bgColor: 0x4e342e,
				outlineColor: 0x7d7371,
				fixedWidth: 300, // width of the box, how wide the box is
				fixedHeight: 30, // height of the box, how tall the box is
			})
			.start(this.state.titleText, 35); // (text, speed of typing).
		// start() docs on https://rexrainbow.github.io/

		var printText = this.add
			.rexBBCodeText(400, 300, 'abc', {
				color: 'yellow',
				fontSize: '24px',
				fixedWidth: 200,
				fixedHeight: 80,
				backgroundColor: '#333333',
				valign: 'center',
			})
			.setOrigin(0.5)
			.setInteractive()
			.on(
				'pointerdown',
				function () {
					var config = {
						onOpen: function (textObject) {
							console.log('Open text editor');
						},
						onTextChanged: function (textObject, text) {
							textObject.text = text;
							console.log(`Text: ${text}`);
						},
						onClose: function (textObject) {
							console.log('Close text editor');
						},
						selectAll: true,
						// enterClose: false
					};
					this.plugins.get('rexTextEdit').edit(printText, config);
				},
				this
			);
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
