import RexUIConfig from './RexUIConfig';

export default class MainMenuSceneConfig extends RexUIConfig {
	constructor(scene) {
		super(scene);
		this.state = {
			singlePlayerCharLoop: undefined,
			currentSprite: undefined,
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

	addRandomSprite() {
		const { scene, randomKey } = this;
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
		this.state.currentSprite.play(`idle_${key}`, true);
		this.state.currentSprite.on('pointerover', () => {
			this.state.currentSprite.play(`run_${key}`, true);
		});
		this.state.currentSprite.on('pointerout', () => {
			this.state.currentSprite.play(`idle_${key}`, true);
		});
	}

	randomKey() {
		const keys = ['dino', 'dino_red', 'dino_yellow', 'dino_green'];
		const randomIndex = Math.floor(Math.random() * keys.length);
		return keys[randomIndex];
	}
}