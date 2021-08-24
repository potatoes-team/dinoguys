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
        this.load.image('dinoguystitle', 'assets/backgrounds/dinoguystitle.png');
        
    }
    create() {
        this.scene.stop('SpriteLoaderScene');
        this.scene.start('LoadingScene');
    }
}