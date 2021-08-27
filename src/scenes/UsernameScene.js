export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {};
	}
	preload() {}
	create() {
		// Load text - > What's your dino name?
		const test = this.add
			.text(this.scale.width / 2, this.scale.height / 2 - 100, "What's your dino name?", {
				fontFamily: 'Pricedown',
				fontSize: '20px',
			})
			.setOrigin(0.5, 0.5);
		// Capture Dom Element from LoadingScene.js
		const element = this.add.dom(400, 0).createFromCache('usernameform');
		element.addListener('click', function (e) {
			// if we clicked on the enter button
			if (e.target.name === 'enter-username-button') {
				const inputText = this.getChildByName('username-form');
				// if user has entered information
				if (inputText.value) {
					this.removeListener('click');
					this.setVisible(false);
					test.setText(inputText.value);
				} else {
					this.scene.tweens.add({
						targets: test,
						duration: 200,
						ease: 'Power3',
						yoyo: true,
					});
				}
			}
		});
	}
	update() {}
}
