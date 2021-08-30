import RexUIConfig from "../utils/RexUIConfig";

export default class JoinRoomScene extends Phaser.Scene {
  constructor() {
    super('JoinRoomScene');
  }
  init(data) {
    this.socket = data.socket;
    this.charSpriteKey = this.charSpriteKey;
  }
  create(){
    this.add.text(this.scale.width / 2 - 135, this.scale.height / 2 - 200, 'Enter Room Code', {
      fontSize: '30px',
    })
    const rexUIConfig = new RexUIConfig(this);
		rexUIConfig.createTextBox(this.scale.width / 2, this.scale.height / 2 - 100, {
			textColor: 0xffffff,
			fontSize: '24px',
			fixedWidth: 300,
			fixedHeight: 60,
		})
  }
}
