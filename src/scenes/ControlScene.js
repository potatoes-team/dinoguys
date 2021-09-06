import Player from '../entity/Player';
import PlayerConfig from '../utils/PlayerConfig';
import LoadingSceneConfig from '../utils/LoadingSceneConfig';

export default class ControlScene extends Phaser.Scene {
	constructor() {
		super('ControlScene');
	}
	// init(data) {
	// 	this.socket = data.socket;
	// }
	preload() {
		this.load.audio('jumpSound', 'assets/audio/jumpsound2.wav');
		this.load.image('control-scene-panel', 'assets/backgrounds/panel-background.png');
		this.load.image('right-arrow', 'assets/buttons/keyboard_72.png');
		this.load.image('right-arrow-clicked', 'assets/buttons/keyboard_173.png');
		this.load.image('left-arrow', 'assets/buttons/keyboard_73.png');
		this.load.image('left-arrow-clicked', 'assets/buttons/keyboard_174.png');
		this.load.image('up-arrow', 'assets/buttons/keyboard_70.png');
		this.load.image('up-arrow-clicked', 'assets/buttons/keyboard_171.png');
		this.load.spritesheet('dino', 'assets/spriteSheets/dino-blue.png', {
			frameWidth: 15,
			frameHeight: 18,
			spacing: 9,
		});
		this.load.image('platform', 'assets/backgrounds/controlsceneplatform.png');
	}
	create() {
		// start transition scene in parallel
		// this.scene.launch('TransitionScene');
		const { width, height } = this.scale;

		// creates cursor keys
		this.cursors = this.input.keyboard.createCursorKeys();

		// jump sound for control scene
		this.jumpSound = this.sound.add('jumpSound');
		this.jumpSound.volume = 0.1;

		// add panel to the canvas
		this.add
			.image(width / 2, height / 2, 'control-scene-panel')
			.setOrigin(0.5)
			.setScale(1.5);

		// title
		this.add
			.text(width * 0.5, height * 0.15, 'CONTROLS', {
				fontFamily: 'customFont',
				fontSize: '26px',
				stroke: '#000',
				strokeThickness: 2,
			})
			.setOrigin(0.5);

		// ------------------------------- instructions -------------------------------
		// run right
		this.add
			.text(width * 0.3, height * 0.3, 'Run Right ------------', {
				fontFamily: 'customFont',
				fontSize: '20px',
				stroke: '#000',
				strokeThickness: 2,
			})
			.setOrigin(0, 0.5);
		this.rightArrow = this.add.image(width * 0.68, height * 0.3, 'right-arrow');

		// run left
		this.add
			.text(width * 0.3, height * 0.4, 'Run Left -------------', {
				fontFamily: 'customFont',
				fontSize: '20px',
				stroke: '#000',
				strokeThickness: 2,
			})
			.setOrigin(0, 0.5);
		this.leftArrow = this.add.image(width * 0.68, height * 0.4, 'left-arrow');

		// jump
		this.add
			.text(width * 0.3, height * 0.5, 'Jump -----------------', {
				fontFamily: 'customFont',
				fontSize: '20px',
				stroke: '#000',
				strokeThickness: 2,
			})
			.setOrigin(0, 0.5);
		this.upArrow = this.add.image(width * 0.68, height * 0.5, 'up-arrow');

		// ------------------------------- dino sandbox -------------------------------
		const playerConfig = new PlayerConfig(this);

		// creates platform
		this.platform = this.physics.add
			.staticImage(this.scale.width / 2, 700, 'platform')
			.setOrigin(1, 0.5)
			.setScale(0.6);

		// this.platform.body.setSize(350, 50).setOffset(50, 200);
		// this.platform.body.reset(this.scale.width / 2, 750);
		// creates a new player
		this.dino = new Player(this, width * 0.5, height * 0.84, 'dino', 'main', null, this.platform);
		this.dino.setScale(4);
		this.dino.setBounce(1, 0.5).setCollideWorldBounds(true);

		// allows us to listen for the 'worldbounds' event
		this.physics.add.collider(this.dino, this.platform);
		playerConfig.createDinoAnimations('dino');
	}
	update() {
		this.dino.update(this.cursors, this.jumpSound);
		if (this.cursors.left.isDown) {
			this.leftArrow.setTexture('left-arrow-clicked');
			this.resetButton('left');
		} else if (this.cursors.right.isDown) {
			this.rightArrow.setTexture('right-arrow-clicked');
			this.resetButton('right');
		} else if (this.cursors.up.isDown) {
			this.upArrow.setTexture('up-arrow-clicked');
			this.resetButton('up');
		}
	}

	resetButton(direction) {
		switch (direction) {
			case 'left':
				this.time.delayedCall(0, () => {
					this.leftArrow.setTexture('left-arrow');
				});
				break;
			case 'right':
				this.time.delayedCall(0, () => {
					this.rightArrow.setTexture('right-arrow');
				});
				break;
			case 'up':
				this.time.delayedCall(0, () => {
					this.upArrow.setTexture('up-arrow');
				});
				break;
			default:
				console.log('Error resetting button');
				break;
		}
	}
}
