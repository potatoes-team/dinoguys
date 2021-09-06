export default class UserStoryScene extends Phaser.Scene {
	constructor() {
		super('UserStoryScene');
		this.story =
			"Welcome to DinoGuys! DinoGuys is a free-to-play 2D Battle Royale game where you can race with your friends to see who can cross the finish line first. Be quick, if you do not make it to the end you will be sent back to the lobby. We suggest playing the single-player mode first to get familiar with the game's controls. Now that you know what this is, go ahead and click the red button again to continue.";
	}
	preload() {
		this.load.image('control-scene-panel', 'assets/backgrounds/panel-background.png');
		this.load.audio('typing', 'assets/audio/typing-audio.wav');
	}
	create() {
		const { width, height } = this.scale;
		this.text = this.createTypingText(width / 2, 400, {
			fixedWidth: 1000,
			fixedHeight: 400,
			wrapWidth: 50,
			fontSize: '22px',
		}).start(this.story, 50);

		// // add panel to the canvas
		// this.add
		// 	.image(width / 2, height / 2, 'control-scene-panel')
		// 	.setOrigin(0.5)
		// 	.setScale(1.5);

		// usernameConfig
		// .createTypingText(this.scale.width / 2, 200, {
		//   fontFamily: 'customFont',
		//   fixedWidth: 1000, // width of the box, how wide the box is
		//   fixedHeight: 30, // height of the box, how tall the box is
		//   isBackground: false,
		// })
		// .start(this.state.titleText, 35); // (text, speed of typing).
	}
	createTypingText(x, y, config) {
		// this method accepts an x, y, and config OBJECT with particular properties.
		const { fixedWidth, fixedHeight, fontSize, wrapWidth } = config;
		// config object should expect isBackground to be true or false, if true -> specify bg and stroke Color.
		const textBox = this.rexUI.add
			.textBox({
				x: x, // center of textbox
				y: y,
				background: this.rexUI.add.roundRectangle(0, 0, 2, 4, 20, 0x4e342e).setStrokeStyle(2, 0x7b5e57),
				text: this.getText('', fixedWidth, fixedHeight, wrapWidth, fontSize), // start the text off as an empty string
				orientation: 0,
				space: {
					left: 20,
					right: 20,
					top: 20,
					bottom: 20,
				},
			})
			.setOrigin(0.5)
			.layout();
		return textBox;
	}

	getText(text, fixedWidth, fixedHeight, wrapWidth, fontSize) {
		console.log(text);
		return this.add
			.text(0, 0, text, {
				fontFamily: 'customFont',
				fontSize,
			})
			.setFixedSize(fixedWidth, fixedHeight)
			.setAlign('center');
	}
}
