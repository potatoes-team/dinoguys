import RexUIConfig from './RexUIConfig';

export default class MainMenuSceneConfig extends RexUIConfig {
	constructor(scene) {
		super(scene);
		this.scene = scene;
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
}
