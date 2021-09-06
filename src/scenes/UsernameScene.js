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
		// creates the title box with type effect
		this.text = usernameConfig
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
	update() {
		if (this.text.isTyping) {
			if (!this.isPlaying) {
				this.typing = this.sound.add('typing');
				this.typing.volume = 0.1;
				this.typing.loop = true;
				this.typing.play();
				this.isPlaying = true;
			}
		} else {
			if (this.isPlaying) {
				this.typing.stop();
				this.isPlaying = false;
			}
		}
	}
}
