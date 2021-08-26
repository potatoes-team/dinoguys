import LoadingSceneConfig from '../utils/LoadingSceneConfig';

export default class LoadingScene extends Phaser.Scene {
	constructor() {
		super('LoadingScene');
		this.state = {
			maxSpan: 580,
			currentSpeed: 1,
			maxSpeed: 3
		};
	}

	preload() {
		// adds dinoguystitle in the preload because of the constructor. (test -> can be changed later at group discretion)
		this.add.image(this.scale.width / 2, this.scale.height * .17, 'dinoguystitle').setOrigin(.5, .5);

		// renders dino sprite on state
		this.state.dino = this.add.sprite(350, this.scale.height / 2, 'loadingdino').setScale(2.25);

		// adds flagpole to state
		this.add.image(940, this.scale.height / 2 - 15, 'flagpole').setScale(0.15);

		// renders flag sprite on state, the flag is HUGE, we SCALED DOWN for sure.
		this.state.flag = this.add.sprite(965, this.scale.height / 2 - 40, 'loadingflag').setScale(0.08);



		// loading configuration allows us to call class methods that take care of particular functionality.
		const loadingConfig = new LoadingSceneConfig(this);
		loadingConfig.generateRandomHint();
		loadingConfig.startMessageLoop();
		loadingConfig.createDinoAnimations('loadingdino');
		loadingConfig.createFlagAnimations('loadingflag');

		// runs specified key animations for dino and flag
		this.state.dino.play('run', true);
		this.state.flag.play('start', true);

		// create loading text 
		const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'Loading...', {
				fontSize: '24px',
				fill: '#fff',
			}).setOrigin(0.5, 0.5);

		// create loading box
		const progressBox = this.add.graphics({
			lineStyle: { width: 3 },
		});

		// 720. rectange has a height of 50 px. [335] - [50] - [335]
		progressBox.clear();
		progressBox.strokeRect(320, 335, this.scale.width / 2, 50);

		// loader event handler
		this.load.on('progress', (percent) => {
			this.state.dino.x = this.state.maxSpan * percent + 350;
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

		// simulating load
		for (let i = 0; i < 25; i++) {
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

		// on complete event handler
		this.load.on('complete', () => {
			loadingConfig.stopMessageLoop();
			progressBox.destroy();
			loadingText.destroy();
			this.cameras.main.fade(2000, 0);
		});
	}
	create() {
		// in 2 seconds stop scene and load MainMenu -> as the camera fades out.
		this.time.delayedCall(2000, () => {
			this.scene.stop('LoadingScene');
			this.scene.start('MainMenuScene');
		})
	}
	update() {
		// dictates how the dino moves after used as a loading bar
		if(this.state.currentSpeed < this.state.maxSpeed) this.state.currentSpeed += .5;
		this.state.dino.x += this.state.currentSpeed;
	}
}
