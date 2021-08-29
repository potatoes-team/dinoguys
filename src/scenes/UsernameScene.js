import UsernameConfig from '../utils/UsernameSceneConfig';

export default class UsernameScene extends Phaser.Scene {
	constructor() {
		super('UsernameScene');
		this.state = {
			titleText: 'Enter your dino name!',
		};
	}
	init(data) {
		this.socket = data.socket;
	}
	create() {
		const usernameConfig = new UsernameConfig(this, this.socket);
		console.log(this.socket.id)
		// creates the title box with type effect
		usernameConfig
			.createTypingText(this.scale.width / 2, 200, {
				fixedWidth: 300, // width of the box, how wide the box is
				fixedHeight: 30, // height of the box, how tall the box is
				isBackground: false
			})
			.start(this.state.titleText, 35); // (text, speed of typing).

		// create textbox that can be edited, this method is responsible for starting the next scene on a particular event.
		this.time.delayedCall(1250, () =>
			usernameConfig.createTextBoxEditorAndEvents(this.scale.width / 2, this.scale.height / 2 - 50, {
				textColor: 0xffffff,
				fontSize: '24px',
				fixedWidth: 300,
				fixedHeight: 60,
			})
		);
	}
}
