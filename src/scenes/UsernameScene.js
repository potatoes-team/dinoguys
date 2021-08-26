export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {};
	}
	preload() {
		const textObject = this.add
			.text(this.scale.width / 2, this.scale.height / 2, 'Username -Scene-', {
				fontSize: '32px',
			})
			.setOrigin(0.5, 0.5);

		const typing = this.plugins
			.get('rextexttypingplugin')
			.add(textObject, config);
	}
	create() {}
}
