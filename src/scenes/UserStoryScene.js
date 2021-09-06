export default class UserStoryScene extends Phaser.Scene {
	constructor() {
		super('UserStoryScene');
		this.story =
			"DinoGuys is a free-to-play 2D Battle Royale game where you can race with your friends to see who can cross the finish line first. Be quick, if you do not make it to the end you will be sent back to the lobby. We suggest playing the single-player mode first to get familiar with the game's controls. Now that you know what this is, go ahead and click the red button again to continue.";
	}
	preload() {
		this.load.image('control-scene-panel', 'assets/backgrounds/panel-background.png');
		this.load.audio('typing', 'assets/audio/typing-audio.wav');
		this.load.image('nextPageIcon', 'assets/buttons/nextPage.png');
		this.load.spritesheet('dino', 'assets/spriteSheets/dino-blue.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
		this.load.spritesheet('dino_red', 'assets/spriteSheets/dino-red.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
		this.load.spritesheet('dino_yellow', 'assets/spriteSheets/dino-yellow.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
		this.load.spritesheet('dino_green', 'assets/spriteSheets/dino-green.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
	}
	create() {
		const { width, height } = this.scale;
		// add panel to the canvas
		this.add
			.image(width / 2, height / 2, 'control-scene-panel')
			.setOrigin(0.5)
			.setScale(1.2);

		// creates typing text
		this.text = this.createTypingText(width / 2, 300, {
			fixedWidth: 530,
			fixedHeight: 250,
			wrapWidth: 530,
			fontSize: '22px',
		}).start(this.story, 35);

		// tracking audio
		this.isPlaying = false;

		const textBox = this.text;
		// creates arrow
		const nextArrow = this.add.image(855, 615, 'nextPageIcon').setInteractive();

		// for arrow interactivity
		nextArrow.on(
			'pointerdown',
			function () {
				if (textBox.isTyping) {
					textBox.stop(true);
				} else {
					textBox.typeNextPage();
				}
			},
			textBox
		);
		// loads all dinos
		this.add.sprite(450, 500, 'dino').setScale(4);
		this.add.sprite(583, 500, 'dino_red').setScale(4);
		this.add.sprite(715, 500, 'dino_yellow').setScale(4);
		this.add.sprite(840, 500, 'dino_green').setScale(4);
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

		textBox.setInteractive().on(
			'pageend',
			function () {
				if (this.isLastPage) {
					return;
				}
			},
			textBox
		);
		return textBox;
	}

	getText(text, fixedWidth, fixedHeight, wrapWidth, fontSize) {
		return this.add
			.text(0, 0, text, {
				fontFamily: 'customFont',
				fontSize,
				stroke: '#000',
				strokeThickness: 2,
				wordWrap: {
					width: wrapWidth,
				},
				padding: {
					top: 10,
					bottom: 10,
					left: 10,
					right: 10,
				},
				lineSpacing: 10,
				maxLines: 5,
			})
			.setFixedSize(fixedWidth, fixedHeight)
			.setAlign('center');
	}
}
