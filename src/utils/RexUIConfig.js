export default class UsernameSceneConfig {
	constructor(scene) {
		this.scene = scene;
	}
	// used in coordinance with getText
	createTypingText(x, y, config) {
		// no wrapping, paging, or special features
		// this method accepts an x, y, and config OBJECT with properties I grab
		const { scene } = this;
		const { bgColor, outlineColor, fixedWidth, fixedHeight } = config;
		const textBox = scene.rexUI.add
			.textBox({
				x: x, // center of textbox - width
				y: y,
				background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, bgColor).setStrokeStyle(2, outlineColor),
				text: this.getText(0, fixedWidth, fixedHeight),
				orientation: 0,
				space: {
					left: 20,
					right: 20,
					top: 20,
					bottom: 20,
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
				fontSize: '24px',
				wordWrap: {
					width: wrapWidth,
				},
				maxLines: 1,
			})
			.setFixedSize(fixedWidth, fixedHeight);
	}
}
