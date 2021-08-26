export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {};
	}
	preload() {
		this.state.textObject = this.add
			.text(this.scale.width / 2, this.scale.height / 2, 'Username Scene', {
				fontSize: '32px',
			})
			.setOrigin(0.5, 0.5);
	}
	create() {
		const usernameForm = this.cache.html.get('usernameform');
		const usernameBox = this.add.graphics();
		usernameBox.strokeRect(425, 200, 275, 100);
		usernameBox.fillRect(425, 200, 275, 100);
		const inputElement = (this.add.scene.inputElement = this.add
			.dom(562.5, 250)
			.createFromCache('usernameform'));
		inputElement.on('click', function (e) {
			e.preventDefault();
			if (e.target.name === 'enter-username') {
				const input = inputElement.getChildByName('username-form');
				console.log(input.value);
			}
		});
	}
	update() {}
}
