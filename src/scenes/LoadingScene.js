import player from '../entity/Player';
import LoadingSceneConfig from '../utils/LoadingSceneConfig';

export default class LoadingScene extends Phaser.Scene {
	constructor() {
		super({
			key: 'LoadingScene',
			pack: {
				files: [
					{
						type: 'image',
						key: 'dinoguystitle',
						url: 'assets/backgrounds/dinoguystitle.png',
					},
				],
			},
		});
	}
	init(data) {
		this.socket = data.socket;
	}
	preload() {
		// adds dinoguystitle in the preload because of the constructor
		this.add.image(this.scale.width / 2, this.scale.height - 200, 'dinoguystitle').setOrigin(.5, .5);

		// player spritesheet - chuck edit
		this.load.spritesheet('loadingdino', 'assets/spriteSheets/dino-blue3.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});

		// starts sends a message out, then starts a loop (edge case if the user stalls)
		this.loadingConfig = new LoadingSceneConfig(this);
		this.loadingConfig.generateRandomHint();
		this.loadingConfig.startMessageLoop();

		this.scene.launch('SpriteRunningInLoadingScene', {
			config: this.loadingConfig,
		});

		// create loading text
		this.loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'Loading...', {
				fontSize: '24px',
				fill: '#fff',
			}).setOrigin(0.5, 0.5);

		// create loading box
		this.progressBox = this.add.graphics({
			lineStyle: { width: 2 },
		});

		// want to have the progress box before progress so the bar fills inside the box as assets are loading
		// 1280. rectangle spans 640. [320] - [640] - [320]
		// 720. rectange has a height of 50 px. [335] - [50] - [335]
		this.progressBox.clear();
		this.progressBox.strokeRect(this.scale.width / 2 - 320, 335, this.scale.width / 2, 50 );

		// Load everything that needs to be loaded in
		// platform & traps
		this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/J.Test1Map.json');
		this.load.image('terrain_tiles', 'assets/tilemap/dinoguystest1.png');
		this.load.image('spike_tile', 'assets/tilemap/spike.png');
		this.load.image('fire_tile', 'assets/tilemap/fire-on.png');

		// background layers
		this.load.image('layer1', 'assets/Island/Layers/L1.png');
		this.load.image('layer2', 'assets/Island/Layers/L2.png');
		this.load.image('layer3', 'assets/Island/Layers/L3.png');
		this.load.image('layer4', 'assets/Island/Layers/L4.png');
		this.load.image('layer5', 'assets/Island/Layers/L5.png');

		// load title screen
		this.load.image('title', 'assets/backgrounds/dinoguystitle.png');

		// simulating load
		// for (let i = 0; i < 25; i++) {
		// 	this.load.spritesheet(
		// 		'loadingdino' + i,
		// 		'assets/spriteSheets/dino-blue3.png',
		// 		{
		// 			frameWidth: 15,
		// 			frameHeight: 18,
		// 			spacing: 9,
		// 		}
		// 	);
		// }
		
		// loader event
		this.load.on('progress', (percent) => {});

		this.load.on('complete', () => {
			this.loadingConfig.stopMessageLoop();
			this.progressBox.destroy();
			this.loadingText.destroy();
			// this.scene.stop('LoadingScene');
			// this.scene.start('MainScene', { socket: this.socket } )
		});
	}
	create() {
		const { height, width } = this.scale;
		this.player = this.add
			.sprite(width * 0.28, height / 2, 'loadingdino')
			.setScale(2.25);
		// since PlayerConfig is being passed the context of this scene (via inheritance),
		// it is able to use scene.create on a specific scene. This will modify the 'this' object such that
		// our this.player.anims still has access to all the animations created in a different file. (see utils folder)
		this.loadingConfig.createAnimations('loadingdino');
	}
	update() {
		this.player.anims.play('idle', true);
	}
}
