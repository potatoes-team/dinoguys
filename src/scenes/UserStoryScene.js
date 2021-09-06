export default class UserStoryScene extends Phaser.Scene {
	constructor() {
		super('UserStoryScene');
		this.story =
			'Play as a Dino to race your friends and see who will come out as the winner. \nOnly a limited amount of dinos could get to the next stage, so be quick! \nFinish first on the last stage and you win!';
	}

	init(data) {
		this.socket = data.socket;
	}

	create() {
		const { width, height } = this.scale;

		// add panel to the canvas
		this.add
			.image(width / 2, height / 2, 'control-scene-panel')
			.setOrigin(0.5)
			.setScale(1.2);

		// creates typing text
		this.text = this.createTypingText(width / 2 + 1, 300, {
			fixedWidth: 500,
			fixedHeight: 250,
			wrapWidth: 500,
			fontSize: '22px',
		}).start(this.story, 35);

		// creates next text
		this.nextText = this.add
			.text(750, 600, 'NEXT', {
				fill: '#000',
				fontSize: '26px',
				fontFamily: 'customFont',
				stroke: '#fff',
				strokeThickness: 2,
			})
			.setInteractive();

		// creates skip text
		this.skipText = this.add
			.text(420, 600, 'SKIP', {
				fill: '#000',
				fontSize: '26px',
				fontFamily: 'customFont',
				stroke: '#fff',
				strokeThickness: 2,
			})
			.setInteractive();

		// loads all dinos
		this.add.sprite(450, 500, 'dino').setScale(4);
		this.add.sprite(583, 500, 'dino_red').setScale(4);
		this.add.sprite(715, 500, 'dino_yellow').setScale(4);
		this.add.sprite(840, 500, 'dino_green').setScale(4);

		// or text interactivity and sound
		this.createUI(this.nextText, 'next');
		this.createUI(this.skipText);
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

	// some intense trickery went on here
	createUI(textObject, type) {
		let textFinished = false;
		let lineCount = 1;
		const MAX_LINES = 3;

		const textBox = this.text;
		this.cursorOver = this.sound.add('cursor');
		this.cursorOver.volume = 0.05;
		this.clickSound = this.sound.add('clickSound');
		this.clickSound.volume = 0.05;

		textObject.on('pointerover', () => {
			this.cursorOver.play();
		});

		textObject.on('pointerout', () => {
			this.cursorOver.stop();
		});

		textObject.on(
			'pointerdown',
			() => {
				if (type === 'next') {
					// handle typing the next page
					if (textBox.isTyping) {
						textBox.stop(true);
					} else {
						lineCount++;
						textBox.typeNextPage();
					}
				}
				this.clickSound.play();
				textObject.setTint(0xc2c2c2);
			},
			textBox
		);

		textObject.on('pointerup', () => {
			if (type !== 'next' || textFinished) {
				this.typing.stop();
				this.scene.stop('UserStoryScene');
				this.scene.start('UsernameScene', { socket: this.socket });
			} else {
				// textObject is either next text or skip text. if not next, it is skip.
				if (lineCount === MAX_LINES) {
					this.skipText.destroy();
					textObject.setText('PLAY');
					textFinished = true;
				}
				textObject.setTint();
			}
		});
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
				},
				lineSpacing: 10,
				maxLines: 4,
			})
			.setFixedSize(fixedWidth, fixedHeight)
			.setAlign('center');
	}
}
