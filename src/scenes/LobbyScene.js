import 'phaser';

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super('LobbyScene');
    // this.sceneLoadedBefore = false;
  }

  init(data) {
    /* if (!this.sceneLoadedBefore)  */ this.socket = data.socket;
    console.log('first initiation');
  }

  create() {
    // this.socket.removeAllListeners();
    console.log('join the open lobby!');
    // console.log('this scene was loaded before?', this.sceneLoadedBefore);
    // console.log('socket exist?', this.socket);
    // const height = this.scale.height;
    const width = this.scale.width;

    // send message to start room status communication chain
    this.socket.emit('checkStaticRooms');

    // render buttons for rooms in the open lobby
    const rooms = [];
    this.socket.on('staticRoomStatus', (staticRooms) => {
      console.log(staticRooms);
      for (let i = 0; i < staticRooms.length; ++i) {
        // render open lobbies with green font, and red if closed
        if (staticRooms[i].isOpen) {
          rooms[i] = this.add.text(
            width * 0.6,
            100 * (i + 1),
            `Room ${i + 1}`,
            {
              fontSize: '30px',
              fill: '#7CFC00',
              align: 'center',
            }
          );
        } else {
          rooms[i] = this.add.text(
            width * 0.6,
            100 * (i + 1),
            `Room ${i + 1}`,
            {
              fontSize: '30px',
              fill: '#FF0000',
              align: 'center',
            }
          );
        }
        rooms[i].setInteractive();
        rooms[i].on('pointerup', () => {
          this.socket.emit('joinRoom', `room${i + 1}`);
        });
      }

      // whenever a room closes/opens, the color of the button will update
      this.socket.on('updatedRooms', (staticRooms) => {
        console.log('inside updated rooms check');
        for (let i = 0; i < staticRooms.length; ++i) {
          // render open lobbies with green font, and red if closed
          if (rooms[i]) {
            if (staticRooms[i].isOpen) {
              rooms[i].setFill('#7CFC00');
            } else {
              rooms[i].setFill('#FF0000');
            }
          }
        }
      });
    });

    const joinCustomRoom = this.add.text(
      width * 0.23,
      225,
      'Join a Custom Room',
      {
        fontSize: '30px',
        fill: '#fff',
      }
    );
    joinCustomRoom.setInteractive();
    joinCustomRoom.on('pointerup', () => {
      this.socket.emit('joinCustomRoom');
    });

    const createRoomButton = this.add.text(
      width * 0.23,
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

    // feedback if clicked on closed room
    this.socket.on('roomClosed', () => {
      const roomClosedInterval = setInterval(() => {
        this.add.text(350, 40, 'This room is closed', {
          fontSize: '30px',
          fill: '#fff',
        });
        clearInterval(roomClosedInterval);
      }, 3000);
    });

    // player will go to stage scene afer receiving room info from server
    this.socket.on('roomInfo', (roomInfo) => {
      this.socket.removeAllListeners();
      // if (this.sceneLoadedBefore) {
      //   this.scene.stop('LobbyScene');
      //   this.scene.start('WaitingScene', { roomInfo });
      // } else {
      // this.sceneLoadedBefore = true;
      this.scene.stop('LobbyScene');
      this.scene.start('WaitingScene', { socket: this.socket, roomInfo });
      // }
    });
  }
}
