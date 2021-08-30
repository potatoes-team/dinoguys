export default class RexUIConfig {
	constructor(scene) {
		this.scene = scene;
	}
	createTextBox(x, y, config) {
		const { scene } = this;

		// creates name input box
		const inputTextBox = this.createNameInputBox(x, y, config);

		// Then, we are making the input text interactive
		inputTextBox.setInteractive();

		// Then, we are creating logic to handle a pointerdown (click) event. We create config with specific properties that we pass into the plugin
		inputTextBox.on(
			'pointerdown',
			function () {
				const config = {
					// onOpen and onClose for debugging purposes
					onOpen: function () {
						console.log('opened text editor');
					},
					onTextChanged: function (textObject, text) {
						textObject.text = text;
						console.log(textObject.text);
					},
					onClose: function (textObject) {
						console.log('closed text editor');
					},
					selectAll: true,
				};
				scene.plugins.get('rexTextEdit').edit(inputTextBox, config); // opens up the text editor on pointerdown with specific configurations
			},
			// recall, the third argument to the event handler provides explicit context, so we can reference scene inside the event handler
			{ scene }
		);
	}

	// ---------------- helper method ----------------
	// Creates InputTextBox given a particular configuration object | NOTE: We are using rexBBCodeText, it's a plugin text type found in our config.js
	createNameInputBox(x, y, config) {
		const { scene } = this;
		const { textColor, fontSize, fixedWidth, fixedHeight } = config;
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
}

// EXAMPLE
/*
		const rexUIConfig = new RexUIConfig(this);
		rexUIConfig.createTextBox(this.scale.width / 2, this.scale.height / 2 - 100, {
			textColor: 0xffffff,
			fontSize: '24px',
			fixedWidth: 300,
			fixedHeight: 60,
		})
*/
