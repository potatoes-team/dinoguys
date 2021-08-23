import 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  init(data) {
    this.socket = data.socket;
  }

  create() {
    const height = this.scale.height;
    const width = this.scale.width;

    // render buttons for rooms in the open lobby (aligned on x-axis at 1/3 && 2/3 of the canvas width)
    const room1 = this.add.text(width * 0.33, height / 2, 'Room 1', {
      fontSize: '30px',
      fill: '#fff',
    });
    const room2 = this.add.text(width * 0.66, height / 2, 'Room 2', {
      fontSize: '30px',
      fill: '#fff',
    });

    // player will join a room with room key after clicking on the room button
    room1.setInteractive();
    room2.setInteractive();
    room1.on('pointerup', () => {
      this.socket.emit('joinRoom', 'room1');
    });
    room2.on('pointerup', () => {
      this.socket.emit('joinRoom', 'room2');
    });

    // player will go to stage scene afer receiving room info from server
    this.socket.on('roomInfo', (roomInfo) => {
      this.scene.stop('MainScene');
      this.scene.start('FgScene', { socket: this.socket, roomInfo });
    });
  }
}
