// loads the spritesheet and the flag + flagpole for use in loading scenes.

export default class SpriteLoaderScene extends Phaser.Scene {
	constructor() {
		super('SpriteLoaderScene');
	}
	preload() {
		this.load.spritesheet('loadingdino', 'assets/spriteSheets/dino-blue3.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
		this.load.spritesheet(
			'loadingflag',
			'assets/spriteSheets/flagspritesheet.png',
			{
				frameWidth: 898,
				frameHeight: 436,
				spacing: 1,
			}
		);
		this.load.image('flagpole', 'assets/sprites/flagpole.png');
	}
	create() {
		this.scene.stop('SpriteLoaderScene');
		this.scene.start('LoadingScene');
	}
}