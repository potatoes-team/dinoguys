import 'phaser';

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super('LobbyScene');
  }

  init(data) {
    this.socket = data.socket;
    this.charSpriteKey = data.charSpriteKey;
    this.username = data.username;
    this.menuMusic = data.menuMusic;
    console.log('first initiation');
  }

  create() {
    console.log('join the open lobby!');
    const width = this.scale.width;
    this.add.image(0, 0, 'main-menu-background').setOrigin(0)

    //create cursor hover sound
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

    //create click sound
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

    if (!this.menuMusic.isPlaying) {
      this.menuMusic.play();
    }

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
              fontFamily: 'customFont',
              fontSize: '30px',
              fill: '#7CFC00',
              align: 'center',
            }
          ).setStroke('#000', 2);
        } else {
          rooms[i] = this.add.text(
            width * 0.6,
            100 * (i + 1),
            `Room ${i + 1}`,
            {
              fontFamily: 'customFont',
              fontSize: '30px',
              fill: '#FF0000',
              align: 'center',
            }
          );
        }
        rooms[i].setInteractive();
        rooms[i].on('pointerover', () => {
          this.cursorOver.play();
          rooms[i].setStroke('#fff', 2)
        });
        rooms[i].on('pointerout', () => {
          this.cursorOver.stop();
          rooms[i].setStroke('#000', 2)
          rooms[i].setFill('#7CFC00')
        });
        rooms[i].on('pointerdown', () => {
          this.clickSound.play();
          rooms[i].setTint('0xc2c2c2')
        })
        rooms[i].on('pointerup', () => {
          rooms[i].clearTint();
          rooms[i].setFill('#7CFC00');
          this.socket.emit('joinRoom', {
            roomKey: `room${i + 1}`,
            spriteKey: this.charSpriteKey,
            username: this.username,
          });
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
      width * 0.12,
      225,
      'Join a Custom Room',
      {
        fontFamily: 'customFont',
        fontSize: '30px',
        fill: '#000',
      }
    ).setStroke('#fff', 2);
    joinCustomRoom.setInteractive();
    joinCustomRoom.on('pointerover', () => {
      this.cursorOver.play();
    });
    joinCustomRoom.on('pointerout', () => {
      this.cursorOver.stop();
    });
    joinCustomRoom.on('pointerdown', () => {
      this.clickSound.play();
    })
    joinCustomRoom.on('pointerup', () => {
      this.socket.removeAllListeners();
      this.scene.stop('LobbyScene');
      this.scene.start('JoinRoomScene', {
        socket: this.socket,
        charSpriteKey: this.charSpriteKey,
        username: this.username,
        menuMusic: this.menuMusic,
      });
    });

    const createRoomButton = this.add.text(
      width * 0.15,
      428,
      'Create New Room',
      {
        fontFamily: 'customFont',
        fontSize: '30px',
        fill: '#000',
      }
    ).setStroke('#fff', 2);

    createRoomButton.setInteractive();
    // create a custom room
    createRoomButton.on('pointerover', () => {
      this.cursorOver.play();
    });
    createRoomButton.on('pointerout', () => {
      this.cursorOver.stop();
    });
    createRoomButton.on('pointerdown', () => {
      this.clickSound.play();
    })
    createRoomButton.on('pointerup', () => {
      this.socket.emit('createRoom');
    });

    // immediately join the custom room that was created
    this.socket.on('roomCreated', (code) => {
      this.socket.emit('joinRoom', {
        roomKey: code,
        spriteKey: this.charSpriteKey,
        username: this.username,
      });
    });

    // feedback if clicked on closed room
    this.socket.on('roomClosed', () => {
      const roomClosedText = this.add.text(350, 40, 'This room is closed', {
        fontFamily: 'customFont',
        fontSize: '30px',
        fill: '#fff',
      });
      const roomClosedInterval = setInterval(() => {
        roomClosedText.destroy();
        clearInterval(roomClosedInterval);
      }, 3000);
    });

    this.socket.on('roomFull', () => {
      const roomFullText = this.add.text(350, 40, 'This room is full', {
        fontFamily: 'customFont',
        fontSize: '30px',
        fill: '#fff',
      });
      const roomFullInterval = setInterval(() => {
        roomFullText.destroy();
        clearInterval(roomFullInterval);
      }, 3000);
    });
    // player will go to stage scene afer receiving room info from server
    this.socket.on('roomInfo', ({ roomInfo, roomKey }) => {
      this.socket.removeAllListeners();
      this.game.music.stopAll();
      this.scene.stop('LobbyScene');
      this.scene.start('WaitingScene', {
        socket: this.socket,
        roomInfo,
        roomKey,
        charSpriteKey: this.charSpriteKey,
        username: this.username,
      });
    });
    this.createUI();
  }

  createUI() {
    const backButton = this.add
    .image(this.scale.width - 20, 20, 'backButton')
    .setScrollFactor(0)
    .setOrigin(1, 0)
    .setScale(4);
    backButton.setInteractive();
    backButton.on('pointerover', () => {
      this.cursorOver.play();
    });
    backButton.on('pointerout', () => {
      this.cursorOver.stop();
    });
    backButton.on('pointerdown', () => {
      this.clickSound.play();
      backButton.setTint(0xc2c2c2);
    })
    backButton.on('pointerup', () => {
      this.socket.removeAllListeners();
      this.scene.stop('LobbyScene');
      this.scene.start('CharSelection');
    });
  }
}
