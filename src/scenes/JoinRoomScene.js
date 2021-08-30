import RexUIConfig from "../utils/RexUIConfig";

export default class JoinRoomScene extends Phaser.Scene {
  constructor() {
    super('JoinRoomScene');
  }
  init(data) {
    this.socket = data.socket;
    this.charSpriteKey = data.charSpriteKey;
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

    const joinButton = this.add.text(this.scale.width / 2 - 135, this.scale.height / 2, 'Join Room', {
      fontSize: '20px',
    })

    joinButton.setInteractive();
    joinButton.on('pointerup', () => {
      this.socket.emit('joinRoom', {roomKey: rexUIConfig.scene.input.displayList.list[1]._text.toUpperCase(), spriteKey: this.charSpriteKey});
      // this.socket.on('joinRoom', ())
    })

    this.socket.on('roomDoesNotExist', () => {
      const roomDNE = this.add.text(this.scale.width / 2 - 135, this.scale.height / 2 - 300, 'This room does not exist', {
        fontSize: '30px',
        fill: '#fff',
      })
      const roomDNEInterval = setInterval(() => {
        roomDNE.destroy();
        clearInterval(roomDNEInterval)
      }, 3000);
    })

    this.socket.on('roomInfo', ({roomInfo, roomKey}) => {
      this.socket.removeAllListeners();
      this.scene.stop('JoinRoomScene');
      this.scene.start('WaitingScene', { socket: this.socket, roomInfo, roomKey,  charSpriteKey: this.charSpriteKey});
    });
  }
}
