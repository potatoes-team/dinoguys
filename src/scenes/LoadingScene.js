import player from '../entity/Player';
import PlayerConfig from '../utils/PlayerConfig';

export default class LoadingScene extends Phaser.Scene {
	constructor() {
		super('LoadingScene');
	}
	preload() {
		this.load.spritesheet('loadingdino', 'assets/spriteSheets/dino-blue3.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
	}
	create() {
        const { height, width } = this.scale;
		this.player = this.add.sprite(width * .25, height / 2, 'loadingdino').setScale(2.25);
        // since PlayerConfig is being passed the context of this scene, it is able to use scene.create on a specific scene. This will modify the 'this' object such that
        // our this.player.anims still has access to all the animations created in a different file. (see utils folder)
        const config = new PlayerConfig(this, 'loadingdino');
        config.createAnimations();
	}
    update() {
        this.player.anims.play('run', true);
    }
}
