import player from '../entity/Player';
import LoadingSceneConfig from '../utils/LoadingSceneConfig';

export default class LoadingScene extends Phaser.Scene {
	constructor() {
		super('LoadingScene');
	}
    init(data) {
        this.socket = data.socket;
    }
	preload() {
        // starts sends a message out, then starts a loop (edge case if the user stalls)
        this.loadingConfig = new LoadingSceneConfig(this);
        this.loadingConfig.generateRandomHint();
        this.loadingConfig.startMessageLoop();

        // create loading bar
		const progressBar = this.add.graphics({
            fillStyle: { color: 0xfff }
        });
		const progressBox = this.add.graphics({
            lineStyle: { width: 2 }
        });
        // want to have the progress box before progress so the bar fills inside the box as assets are loading
        // 1280. rectangle spans 640. [320] - [640] - [320]
        // 720. rectange has a height of 50 px. [335] - [50] - [335]
        progressBox.clear();
        progressBox.strokeRect(this.scale.width / 2 - 320, 335, this.scale.width / 2, 50);
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

		// player spritesheet - chuck edit
		this.load.spritesheet('loadingdino', 'assets/spriteSheets/dino-blue3.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
        // simulating load
        for(let i = 0; i < 100; i++) {
            this.load.spritesheet('loadingdino' + i, 'assets/spriteSheets/dino-blue3.png', {
                frameWidth: 15,
                frameHeight: 18,
                spacing: 9,
            });
        }
        // loader event
        this.load.on("progress", (percent) => {
            progressBar.clear();
            progressBox.fillRect(this.scale.width / 2 - 320, 335, this.scale.width / 2, 50);
            progressBar.fillRect(0, this.scale.height / 2, this.scale.width * percent, 50);

        })

        this.load.on('complete', () => {
            // this.loadingConfig.stopMessageLoop();
        })
	}
	create() {
		const { height, width } = this.scale;
		this.player = this.add
			.sprite(width * 0.25, height / 2, 'loadingdino')
			.setScale(2.25);
		// since PlayerConfig is being passed the context of this scene (via inheritance),
		// it is able to use scene.create on a specific scene. This will modify the 'this' object such that
		// our this.player.anims still has access to all the animations created in a different file. (see utils folder)
		this.loadingConfig.createAnimations('loadingdino');
		// loadingConfig.startMessageLoop();
		// loadingConfig.stopMessageLoop() works | can stop the loop whenever we want
	}
	update() {
		this.player.anims.play('idle', true);
		// this.add.text(width / 2, height * .9, "Some random dino messages", { fontSize: '15px' }).setOrigin(0.5);
	}
	changeText() {}
}
