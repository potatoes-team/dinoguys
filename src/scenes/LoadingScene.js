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
		this.currentSpeed = 1;
		this.maxSpeed = 5;
	}

	preload() {
		// adds dinoguystitle in the preload because of the constructor
		this.add.image(this.scale.width / 2, this.scale.height * .17, 'dinoguystitle').setOrigin(.5, .5);

		// player spritesheet - chuck edit
		this.load.spritesheet('loadingdino', 'assets/spriteSheets/dino-blue3.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});

		// starts sends a message out, then starts a loop (edge case if the user stalls) || on this object as it's used in create and update.
		this.loadingConfig = new LoadingSceneConfig(this);
		this.loadingConfig.generateRandomHint();
		this.loadingConfig.startMessageLoop();

		// create loading text 
		const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'Loading...', {
				fontSize: '24px',
				fill: '#fff',
			}).setOrigin(0.5, 0.5);

		// create progress bar
		const progressBar = this.add.graphics({
			fillStyle: { color: 0x90ee90 , alpha: 1 }
		});
		// create loading box
		const progressBox = this.add.graphics({
			lineStyle: { width: 3 },
		});

		// want to have the progress box before progress so the bar fills inside the box as assets are loading
		// 1280. rectangle spans 640. [320] - [640] - [320]
		// 720. rectange has a height of 50 px. [335] - [50] - [335]
		progressBox.clear();
		progressBox.strokeRect(320, 335, this.scale.width / 2, 50);

		// loader event handler
		this.load.on('progress', (percent) => {
			progressBar.clear();
			progressBar.fillRect(320, 335, (this.scale.width / 2) * percent, 50);
		});

		// ----------------------------------- Load Here ----------------------------------- 
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

		// load audio
		this.load.audio('start', 'assets/audio/letsstart!.mp3');

		// simulating load
		for (let i = 0; i < 50; i++) {
			this.load.spritesheet(
				'loadingdino' + i,
				'assets/spriteSheets/dino-blue3.png',
				{
					frameWidth: 15,
					frameHeight: 18,
					spacing: 9,
				}
			);
		}
		// audio 

		// on complete event handler
		this.load.on('complete', () => {
			this.loadingConfig.stopMessageLoop();
			progressBar.destroy();
			progressBox.destroy();
			loadingText.destroy();
			this.cameras.main.fade(2000, 0);
		});
	}
	create() {
		const { height } = this.scale;
		this.player = this.add.sprite(50, height / 2, 'loadingdino').setScale(2.25);
		this.loadingConfig.createAnimations('loadingdino');
		// start sound
		start = this.sound.add('start', { loop: false });
		start.play();
		// in 2 seconds stop scene and load MainMenu -> as the camera fades out.
		this.time.delayedCall(2000, () => {
			this.scene.stop('LoadingScene');
			this.scene.start('MainMenuScene');
		})
	}
	update() {
		this.player.anims.play('run', true);
		if(this.currentSpeed < this.maxSpeed) this.currentSpeed += .5;
		this.player.x += this.currentSpeed;
	}
}
