export default class UsernameSceneConfig {
	constructor(scene) {
		this.scene = scene;
		this.state = {
			savedText: '', // this holds the username information
			typingText: undefined, // this holds the textBox created by createTypingMessage method -> can destroy and create at will
			blinkTween: undefined, // holds the tween in state so we can start and destroy at will
			inputTextBox: undefined, // holds username input box in state so we can start and destroy at will
			inputTextBoxConfigSettings: undefined, // holds username input box config settings so we can create an input box at will with proper settings.
		};
	}
	// this is the typing text at the top of the screen. this is only created once so settings do not need to persist.
	createTypingText(x, y, config) {
		// this method accepts an x, y, and config OBJECT with particular properties.
		const { scene } = this;
		const { isBackground, bgColor, strokeColor, fixedWidth, fixedHeight } = config;
		// config object should expect isBackground to be true or false, if true -> specify bg and stroke Color.
		const textBox = scene.rexUI.add
			.textBox({
				x: x, // center of textbox
				y: y,
				background: isBackground // if background color is true, create roundRectangle background
					? scene.rexUI.add.roundRectangle(0, 0, 2, 4, 20, bgColor).setStrokeStyle(2, strokeColor)
					: undefined,
				text: this.getText(0, fixedWidth, fixedHeight), // start the text off as an empty string
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

	// methods handles creating the username input, saving config settings to state, saving and starting our blink tween,
	createTextBoxEditor(x, y, config) {
		const { scene } = this;

		// this helper method will save config on this.state, so we can freely create and delete textboxes later in our code.
		this.saveConfigToState(x, y, config);

		// creates name input box and saves it to the state so we can freely create and destroy the text box later.
		this.state.inputTextBox = this.createNameInputBox(config);

		// Takes textObject as argument and begins blinking functionality
		this.startTextboxTween(this.state.inputTextBox);

		// Then, we are making the input text interactive
		this.state.inputTextBox.setInteractive();

		// Passing this by reference to rexUIConfigContext, without it we cannot access this's state in the event handler.
		// rexUIConfigContext.state === this.state
		const rexUIConfigContext = this;

		// Then, we are creating logic to handle a pointerdown (click) event. We create config with specific properties that we pass into the plugin
		// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/textedit/
		this.state.inputTextBox.on(
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
						rexUIConfigContext.startConfirmationMessage();
					},
					selectAll: true,
				};
				scene.plugins.get('rexTextEdit').edit(rexUIConfigContext.state.inputTextBox, config); // opens up the text editor on pointerdown with specific configurations
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
			.setFixedSize(fixedWidth, fixedHeight)
			.setAlign('center');
			// set the alignment of the text in the Text object. and setFixedSize(). methods on phaser3 docs.
	}

	// misc, returns savedText from inputTextBox
	getName() {
		return this.state.savedText;
	}

	// saves configuration settings to state so I can delete and create textboxes with the same settings from UsernameScene.js
	saveConfigToState(x, y, config) {
		if (!this.state.inputTextBoxConfigSettings) {
			this.state.inputTextBoxConfigSettings = config;
			this.state.inputTextBoxConfigSettings.x = x;
			this.state.inputTextBoxConfigSettings.y = y;
		}
	}

	// Creates InputTextBox given a particular configuration object
	createNameInputBox(config) {
		const { scene } = this;
		const { x, y, textColor, fontSize, fixedWidth, fixedHeight } = config;
		return scene.add
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
	}

	// used in event handler to start input textbox blinking effect
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

	// used in event handler to stop blinking effect
	stopTextboxTween() {
		this.state.blinkTween.stop();
		this.state.inputTextBox.destroy();
	}

	// used in event handler to start typing the confirmation message
	startConfirmationMessage() {
		const { scene } = this;
		this.state.typingText = this.createTypingText(scene.scale.width / 2, 500, {
			fixedWidth: 600,
			fixedHeight: 40,
			isBackground: true,
			bgColor: 0x4e342e,
			strokeColor: 0x7b5e57,
		}).start(`Your dino name is: ${this.getName()}?`, 65); // (text, speed of typing).
	}
}

// feature to add: on stop tween, stop the tween and remove the textbox - prompt a yes or no - if no start tween again - else enter next scene with info
// done: on stop tween, we stop the tween and remove the textbox
// next: provide a prompt of yes or no
// if no -> create a new textbox,
// else -> enter next scene with information
