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
		this.add.image(0, 0, 'main-menu-background').setOrigin(0)
		console.log(this.socket.id);
		// creates the title box with type effect
		usernameConfig
			.createTypingText(this.scale.width / 2, 200, {
				fontFamily: 'customFont',
				fixedWidth: 1000, // width of the box, how wide the box is
				fixedHeight: 30, // height of the box, how tall the box is
				isBackground: false,
			})
			.start(this.state.titleText, 35); // (text, speed of typing).

		// create textbox that can be edited, this method is responsible for starting the next scene on a particular event.
		this.time.delayedCall(1250, () =>
			usernameConfig.runAllTextBoxLogic(this.scale.width / 2, this.scale.height / 2 - 50, {
				fontFamily: 'customFont',
				textColor: 0xffffff,
				fontSize: '20px',
				fixedWidth: 500,
				fixedHeight: 60,
			})
		);
	}
}
