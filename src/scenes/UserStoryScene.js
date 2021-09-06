export default class UserStoryScene extends Phaser.Scene {
	constructor() {
		super('UserStoryScene');
		this.story =
			"DinoGuys is a free-to-play 2D Battle Royale game where you can race with your friends to see who can cross the finish line first. Be quick, if you do not make it to the end you will be sent back to the lobby. We suggest playing the single-player mode first to get familiar with the game's controls. Now that you know what this is, go ahead and click the red button again to continue.";
	}
	preload() {
		this.load.image('control-scene-panel', 'assets/backgrounds/panel-background.png');
		this.load.audio('typing', 'assets/audio/typing-audio.wav');
	}
	create() {
		const { width, height } = this.scale;
		// add panel to the canvas
		this.add
			.image(width / 2, height / 2, 'control-scene-panel')
			.setOrigin(0.5)
			.setScale(1.2);

		this.text = this.createTypingText(width / 2, 300, {
			fixedWidth: 550,
			fixedHeight: 250,
			wrapWidth: 550,
			fontSize: '22px',
		}).start(this.story, 35);
		this.text.setInteractive();
		this.text.on(
			'pointerdown',
			function () {
				if (this.isTyping) {
					this.stop(true);
				} else {
					this.typeNextPage();
				}
			},
			this.text
		);
		// tracking audio
		this.isPlaying = false;
	}
	update() {
		if (this.text.isTyping) {
			if (!this.isPlaying) {
				this.typing = this.sound.add('typing');
				this.typing.volume = 0.1;
				this.typing.loop = true;
				this.typing.play();
				this.isPlaying = true;
			}
		} else {
			if (this.isPlaying) {
				this.typing.stop();
				this.isPlaying = false;
			}
		}
		// console.log(this.text.isTyping);
	}
	createTypingText(x, y, config) {
		// this method accepts an x, y, and config OBJECT with particular properties.
		const { fixedWidth, fixedHeight, fontSize, wrapWidth } = config;
		// config object should expect isBackground to be true or false, if true -> specify bg and stroke Color.
		const textBox = this.rexUI.add
			.textBox({
				x: x, // center of textbox
				y: y,
				text: this.getText('', fixedWidth, fixedHeight, wrapWidth, fontSize), // start the text off as an empty string
				orientation: 0,
				space: {
					left: 20,
					right: 20,
					top: 20,
					bottom: 20,
					text: 20,
				},
			})
			.setOrigin(0.5)
			.layout();
		return textBox;
	}

	getText(text, fixedWidth, fixedHeight, wrapWidth, fontSize) {
		return this.add
			.text(0, 0, text, {
				fontFamily: 'customFont',
				fontSize,
				wordWrap: {
					width: wrapWidth,
				},
				padding: {
					top: 5,
					bottom: 5,
				},
				lineSpacing: 10,
			})
			.setFixedSize(fixedWidth, fixedHeight)
			.setAlign('center');
	}
}
