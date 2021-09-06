import Player from '../entity/Player';
import PlayerConfig from '../utils/PlayerConfig';

export default class ControlScene extends Phaser.Scene {
	constructor() {
		super('ControlScene');
	}

	init(data) {
		this.socket = data.socket;
	}

	create() {
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
			.staticImage(this.scale.width / 2, 700, 'platform-control-scene')
			.setOrigin(0.5, 0.5)
			.setScale(0.6);

		// sets platform on the ground and makes it invisible
		this.platform.body.setSize(700, 25).setOffset(-50, 248);
		this.platform.setVisible(false);

		// sets rectangle border
		this.physics.world.setBounds(width * 0.245, height * 0.65, 652, 500);

		// creates a new player
		this.dino = new Player(this, width * 0.5, height * 0.84, 'dino', 'main', null, this.platform);
		this.dino.setScale(4);
		this.dino.setCollideWorldBounds(true);

		// allows us to create physics for invisible platform and dino (turn debug on to see)
		this.physics.add.collider(this.dino, this.platform);

		// makes sure all animations are working properly
		playerConfig.createDinoAnimations('dino');

		// creates backbutton
		this.createUI();
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

	createUI() {
		this.cursorOver = this.sound.add('cursor');
		this.cursorOver.volume = 0.05;
		this.clickSound = this.sound.add('clickSound');
		this.clickSound.volume = 0.05;

		this.backButton = this.add.image(950, 22, 'forwardButton').setScrollFactor(0).setOrigin(1, 0).setScale(3);

		this.backButton.setInteractive();
		this.backButton.on('pointerover', () => {
      this.backButton.setTint(0xc2c2c2);
      this.cursorOver.play();
    });
    this.backButton.on('pointerout', () => {
      this.backButton.clearTint();
      this.cursorOver.stop();
    });
    this.backButton.on('pointerdown', () => {
      this.clickSound.play();
      this.backButton.setTint(0x3f3f3f);
    });
		this.backButton.on('pointerup', () => {
			this.scene.stop('ControlsScene');
			this.scene.start('UserStoryScene', { socket: this.socket });
		});
	}
}
