export default class UsernameSceneConfig {
	constructor(scene) {
		this.scene = scene;
		this.state = {
			savedText: '',
			blinkTween: undefined,
		};
	}
	// used in coordinance with getText
	createTypingText(x, y, config) {
		// this method accepts an x, y, and config OBJECT with properties I grab from UsernameScene.js
		const { scene } = this;
		const { isBackground, bgColor, strokeColor, fixedWidth, fixedHeight } = config;

		const textBox = scene.rexUI.add
			.textBox({
				x: x, // center of textbox
				y: y,
				text: this.getText(0, fixedWidth, fixedHeight), // start the text off as an empty string
				background: isBackground // if background color is true, create roundRectangle background
					? scene.rexUI.add.roundRectangle(0, 0, 2, 4, 20, bgColor).setStrokeStyle(2, strokeColor)
					: undefined,
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

	// calls on helper methods getName, startTween, stopTween
	createTextBoxEditor(x, y, config) {
		const { scene } = this;
		const { textColor, fontSize, fixedWidth, fixedHeight } = config;

		// We are creating a rexBBCodeText similar to this.add.text but this.add.rexBBCodeText -> https://rexrainbow.github.io/phaser3-rex-notes/docs/site/bbcodetext/
		const input = scene.add
			.rexBBCodeText(x, y, '', {
				color: textColor,
				fontSize,
				fixedWidth,
				fixedHeight,
				backgroundColor: '#333333',
				halign: 'center',
				valign: 'center',
				maxLines: 1,
			})
			.setOrigin(0.5);

		// Takes textObject as argument and begins blinking functionality
		this.startTextboxTween(input);

		// Then, we are making the input text interactive
		input.setInteractive();

		// Passing this by reference to rexUIConfigContext, without it we cannot access this's state in the event handler
		const rexUIConfigContext = this;

		// Then, we are creating logic to handle a pointerdown (click) event. We create config with specific properties that we pass into the plugin
		// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/textedit/
		input.on(
			'pointerdown',
			function () {
				const config = {
					// onOpen and onClose for debugging purporse
					onOpen: function () {
						console.log('Open text editor');
						// destroys 'Your name is' message
						if (rexUIConfigContext.state.typingText) {
							rexUIConfigContext.state.typingText.destroy();
						}
					},
					onTextChanged: function (textObject, text) {
						textObject.text = text;
					},
					onClose: function (textObject) {
						rexUIConfigContext.state.savedText = textObject.text;
						rexUIConfigContext.stopTextboxTween();
						rexUIConfigContext.startTypingMessage();
					},
					selectAll: true,
				};
				scene.plugins.get('rexTextEdit').edit(input, config); // opens up the text editor on pointerdown with specific configurations
			},
			// recall, the third argument to the event handler provides explicit context, so we can reference scene inside the event handler
			{ scene, rexUIConfigContext }
		);
	}
	// ------------------------------------------- HELPER METHODS-------------------------------------------
	// for createTypingText
	getText(wrapWidth, fixedWidth, fixedHeight) {
		// creates textObject with specific width and height that comes from the config object in createTypingText
		// be careful when changing fontSize, depending on the fixedWidth and fixedHeight, letters may disappear
		// add a background to check the width and height of the surrounding box
		const { scene } = this;
		return scene.add
			.text(0, 0, '', {
				fontSize: '24px',
				wordWrap: {
					width: wrapWidth,
				},
				maxLines: 1,
			})
			.setFixedSize(fixedWidth, fixedHeight);
	}
	// misc
	getName() {
		return this.state.savedText;
	}
	// used in event handler
	startTypingMessage() {
		const { scene } = this;
		this.state.typingText = this.createTypingText(scene.scale.width / 2, 500, {
			fixedWidth: 600,
			fixedHeight: 50,
			isBackground: false,
			bgColor: 0x4e342e,
			strokeColor: 0x7b5e57,
		}).start(`Your dino name is: ${this.getName()}?`, 65); // (text, speed of typing).
	}
	// used in event handler
	startTextboxTween(input) {
		const { scene } = this;
		this.state.blinkTween = scene.tweens.add({
			targets: input,
			duration: 500,
			delay: 300,
			repeat: -1,
			ease: Phaser.Math.Easing.Expo.InOut,
			alpha: 0,
			yoyo: true,
		});
	}
	// used in event handler
	stopTextboxTween() {
		this.state.blinkTween.stop();
	}
}
