import RexUIConfig from './RexUIConfig';

export default class MainMenuSceneConfig extends RexUIConfig {
	constructor(scene) {
		super(scene);
		this.state = {
			singlePlayerCharLoop: undefined,
			currentSprite: undefined,
			dinoGroup: undefined,
			dinoGroupFallingLoop: undefined,
		};
	}

	createTextLabel(text, x, y, config) {
		const { scene } = this;
		const { bgColor, strokeColor, textColor, iconKey, fixedWidth, fixedHeight, fontSize } = config;
		// config object should expect isBackground to be true or false, if true -> specify bg and stroke Color.
		const textBox = scene.rexUI.add
			.textBox({
				x: x, // center of textbox
				y: y,
				background: scene.rexUI.add.roundRectangle(0, 0, 2, 4, 10, bgColor).setStrokeStyle(2, strokeColor),
				text: this.getText(text, textColor, fontSize, fixedWidth, fixedHeight),
				icon: iconKey && scene.add.image(0, 0, iconKey).setScale(2),
				orientation: 0,
				space: {
					left: 10,
					right: 10,
					top: 10,
					bottom: 10,
				},
			})
			.setOrigin(0.5)
			.layout();
		return textBox;
	}

	showSinglePlayerChar() {
		this.addRandomSprite();
	}

	showMultiplayerChars() {
		// creates all sprites for multiplayer scene and adds them to group.
		this.addAllSprites();
	}

	startSinglePlayerCharLoop() {
		const { scene, addRandomSprite } = this;

		this.state.singlePlayerCharLoop = scene.time.addEvent({
			callback: addRandomSprite,
			delay: 5000,
			callbackScope: this,
			loop: true,
		});
	}

	stopSinglePlayerCharLoop() {
		this.state.singlePlayerCharLoop.destroy();
	}

	// -------------------- Helper Methods --------------------
	addRandomSprite() {
		const { scene, randomKey, activateListener } = this;
		const key = randomKey();
		if (!this.state.currentSprite) {
			this.state.currentSprite = scene.add
				.sprite(scene.scale.width * 0.33, scene.scale.height / 2 + 100, key)
				.setScale(7)
				.setInteractive();
		} else {
			this.state.currentSprite.destroy();
			this.state.currentSprite = scene.add
				.sprite(scene.scale.width * 0.33, scene.scale.height / 2 + 100, key)
				.setScale(7)
				.setInteractive();
		}
		activateListener(this.state.currentSprite, key);
	}

	addAllSprites() {
		const { scene, activateListener } = this;
		const blue = scene.add
			.sprite(scene.scale.width * 0.59, scene.scale.height / 2 + 120, 'dino')
			.setScale(3)
			.setInteractive();
		activateListener(blue, 'dino');

		const red = scene.add
			.sprite(scene.scale.width * 0.64, scene.scale.height / 2 + 90, 'dino_red')
			.setScale(3)
			.setInteractive();
		activateListener(red, 'dino_red');

		const yellow = scene.add
			.sprite(scene.scale.width * 0.69, scene.scale.height / 2 + 120, 'dino_yellow')
			.setScale(3)
			.setInteractive();
		activateListener(yellow, 'dino_yellow');

		const green = scene.add
			.sprite(scene.scale.width * 0.74, scene.scale.height / 2 + 90, 'dino_green')
			.setScale(3)
			.setInteractive();
		activateListener(green, 'dino_green');
	}

	activateListener(sprite, key) {
		sprite.play(`idle_${key}`, true);
		sprite.on('pointerover', () => {
			sprite.play(`run_${key}`, true);
		});
		sprite.on('pointerout', () => {
			sprite.play(`idle_${key}`, true);
		});
	}

	createDinoGroup(platform) {
		const { scene } = this;
		this.state.dinoGroup = scene.physics.add.group(); // creates dinogroup
		// ensures that falling dinos have proper physics
		scene.physics.add.collider(this.state.dinoGroup, platform);
		// ensures that any object reaching the world bounds is destroyed.
		scene.physics.world.on('worldbounds', (body) => {
			body.gameObject.destroy();
		});
	}

	generateDinos() {
		const { scene } = this;
		const maxXCoordinate = Math.random() * scene.scale.width - 16;
		this.state.dinoGroup.rotate(30);
		const dino = this.state.dinoGroup.create(maxXCoordinate, 10, this.randomKey());
		dino.setBounce(1, 0.4).setCollideWorldBounds(true).setVelocity(Phaser.Math.Between(-200, 200), 20);
		// allows us to listen for the 'worldbounds' event
		dino.body.onWorldBounds = true;
	}

	// not a helper method
	startFallingDinosLoop() {
		const { scene } = this;

		this.state.dinoGroupFallingLoop = scene.time.addEvent({
			delay: 350,
			callback: this.generateDinos,
			callbackScope: this,
			loop: true,
		});
	}

	randomKey() {
		const keys = ['dino', 'dino_red', 'dino_yellow', 'dino_green'];
		const randomIndex = Math.floor(Math.random() * keys.length);
		return keys[randomIndex];
	}
}
