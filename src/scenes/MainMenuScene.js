export default class MainMenuScene extends Phaser.Scene {
	constructor() {
		super('MainMenuScene');
	}
	preload() {
		// adds dinoguystitle in the preload because it was loaded in the LoadingScene.js
		this.add
			.image(this.scale.width / 2, this.scale.height * 0.17, 'dinoguystitle')
			.setOrigin(0.5, 0.5);
	}
	create() {
		this.add
			.text(this.scale.width / 2, this.scale.height / 2, 'Main Menu Scene', {
				fontSize: '32px',
			})
			.setOrigin(0.5, 0.5);
	}
}
// pass is in { isMultiplayer: true } or { isMultiplayer: false }
