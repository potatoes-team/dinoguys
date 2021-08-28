export default class UsernameSceneConfig {
	constructor(scene) {
		this.scene = scene;
		this.state = {
			savedText: '',
			blinkTween: undefined,
		}
	}
	// used in coordinance with getText
	createTypingText(x, y, config) {
		// this method accepts an x, y, and config OBJECT with properties I grab from UsernameScene.js
		const { scene } = this;
		const { fixedWidth, fixedHeight } = config;
		const textBox = scene.rexUI.add
			.textBox({
				x: x, // center of textbox
				y: y,
				text: this.getText(0, fixedWidth, fixedHeight), // start the text off as an empty string
				orientation: 0,
				space: {
					left: 20,
					right: 20,
					top: 20,
					bottom: 20,
				},
			})
			.setOrigin(0.5, 0.5)
			.layout();
		return textBox;
	}

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
				maxLines: 1
			})
			.setOrigin(0.5, 0.5);

		// Takes textObject as argument and begins blinking functionality
		this.startTextboxTween(input);

		// Then, we are making the input text interactive
		input.setInteractive();

		// Passing this by reference to rexUIConfigContext, without it we cannot access this's state in the event handler
		const rexUIConfigContext = this;
		
		// Then, we are creating logic to handle a pointerdown (click) event. We create config with specific properties that we pass into the plugin
		// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/textedit/
		input.on('pointerdown', function () {
				const config = {
					// onOpen and onClose for debugging purporse
					onOpen: function () {
						console.log('Open text editor');
					},
					onTextChanged: function (textObject, text) {
						textObject.text = text;
					},
					onClose: function (textObject) {
						rexUIConfigContext.state.savedText = textObject.text;
						rexUIConfigContext.stopTextboxTween();
						console.log(rexUIConfigContext.state);
					},
					selectAll: true,
				};
				scene.plugins.get('rexTextEdit').edit(input, config); // opens up the text editor on pointerdown with specific configurations
			},
			// recall, the third argument to the event handler provides explicit context, so we can reference scene inside the event handler
			{ scene, rexUIConfigContext }
		);
	}
	getName() {
		return this.state.savedText;
	}
	startTextboxTween(input) {
		const { scene } = this;
		this.state.blinkTween = scene.tweens.add({
			targets: input,
			duration: 500,
			delay: 300,
			repeat: -1,
			ease: Phaser.Math.Easing.Expo.InOut,
			alpha: 0,
			yoyo: true
		})
		this.state.blinkTween.play();
	}
	stopTextboxTween() {
		this.state.blinkTween.stop();
	}
}
