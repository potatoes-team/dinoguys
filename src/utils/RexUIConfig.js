export default class UsernameSceneConfig {
	constructor(scene) {
		this.scene = scene;
	}
	createTextBox(x, y, config) {
		// this method accepts an x, y, and config OBJECT with properties I grab
		const { scene } = this;
		const { wrapWidth, fixedWidth, fixedHeight, colorPrimary, colorLight } = config;
		const textBox = scene.rexUI.add
			.textBox({
				x: x,
				y: y,
				background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, colorPrimary).setStrokeStyle(2, colorLight),
				text: this.getText(wrapWidth, fixedWidth, fixedHeight),
				orientation: 0,
				space: {
					left: 20,
					right: 20,
					top: 20,
					bottom: 20,
					text: 10,
				},
			})
			.setOrigin(0.5, 0.5)
			.layout();
		return textBox;
	}

	getText(wrapWidth, fixedWidth, fixedHeight) {
		const { scene } = this;
		return scene.add
			.text(0, 0, '', {
				fontSize: '20px',
				wordWrap: {
					width: wrapWidth,
				},
				maxLines: 1,
			})
			.setFixedSize(fixedWidth, fixedHeight);
	}
}
