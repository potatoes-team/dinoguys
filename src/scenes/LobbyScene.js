import 'phaser';

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super('LobbyScene');
  }

  init(data) {
    this.socket = data.socket;
  }

  create() {
    const height = this.scale.height;
    const width = this.scale.width;

    // render buttons for rooms in the open lobby (aligned on x-axis at 1/3 && 2/3 of the canvas width)
    const rooms = [];
    for (let i = 1; i < 6; ++i) {
      if (i < 4) {
        rooms[i] = this.add.text(width * 0.27, height * (i / 5), `Room ${i}`, {
          fontSize: '30px',
          fill: '#fff',
        });
      } else if (i === 4) {
        rooms[i] = this.add.text(width * 0.6, 140, `Room ${i}`, {
          fontSize: '30px',
          fill: '#fff',
        });
      } else if (i === 5) {
        rooms[i] = this.add.text(width * 0.6, 284, `Room ${i}`, {
          fontSize: '30px',
          fill: '#fff',
        });
      }
      rooms[i].setInteractive();
      rooms[i].on('pointerup', () => {
        this.socket.emit('joinRoom', `room${i}`);
      });
    }
    const createRoomButton = this.add.text(
      width * 0.55,
      428,
      'Create New Room',
      {
        fontSize: '30px',
        fill: '#fff',
      }
    );
    createRoomButton.setInteractive();
    createRoomButton.on('pointerup', () => {
      this.socket.emit('createRoom');
    });
    // player will go to stage scene afer receiving room info from server
    this.socket.on('roomInfo', (roomInfo) => {
      this.scene.stop('LobbyScene');
      this.scene.start('StageSnow', { socket: this.socket, roomInfo });
    });
  }
}
