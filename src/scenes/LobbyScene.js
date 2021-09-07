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
  }

  create() {
    const width = this.scale.width;

    //create cursor hover sound
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

    //create click sound
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

    // background music
    if (!this.menuMusic.isPlaying) {
      this.menuMusic.play();
    }

    // background
    this.add.image(0, 0, 'main-menu-background').setOrigin(0);

    // create clouds in background at random positions & angle
    const cloudImgNum = 6;
    const cloudTotalNum = 20;
    this.clouds = [];
    for (let i = 0; i < cloudTotalNum; i++) {
      const x = Math.floor(Math.random() * this.scale.width);
      const y = Math.floor(Math.random() * this.scale.height);
      const angle = Math.floor(Math.random() * -10);
      const cloud = this.add
        .image(x, y, `cloud-0${(i % cloudImgNum) + 1}`)
        .setScale(3)
        .setAngle(angle);
      this.tweens.add({
        targets: cloud,
        scale: { from: 2.9, to: 3.1 },
        delay: i * 100,
        repeat: -1,
        yoyo: true,
      });
      this.clouds.push(cloud);
    }

    // send message to start room status communication chain
    this.socket.emit('checkStaticRooms');

    // render buttons for rooms in the open lobby
    const rooms = [];
    this.socket.on('staticRoomStatus', (staticRooms) => {
      for (let i = 0; i < staticRooms.length; ++i) {
        // render open lobbies with green font, and red if closed
        if (staticRooms[i].isOpen) {
          rooms[i] = this.add
            .text(width * 0.6, 100 * (i + 1), `Room ${i + 1}`, {
              fontFamily: 'customFont',
              fontSize: '30px',
              fill: '#7CFC00',
              align: 'center',
            })
            .setStroke('#000', 2);
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
          rooms[i].setStroke('#fff', 2);
        });
        rooms[i].on('pointerout', () => {
          this.cursorOver.stop();
          rooms[i].setStroke('#000', 2);
          if(staticRooms[i].isOpen){
          rooms[i].setFill('#7CFC00')
        }
        });
        rooms[i].on('pointerdown', () => {
          this.clickSound.play();
          rooms[i].setTint('0xc2c2c2');
        });
        rooms[i].on('pointerup', () => {
          this.input.enabled = false;
          rooms[i].clearTint();
          if(staticRooms[i].isOpen){
          rooms[i].setFill('#7CFC00');
        }
          this.socket.emit('joinRoom', {
            roomKey: `room${i + 1}`,
            spriteKey: this.charSpriteKey,
            username: this.username,
          });
        });
      }

      // whenever a room closes/opens, the color of the button will update
      this.socket.on('updatedRooms', (staticRooms) => {
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
    );

    joinCustomRoom.setInteractive();
    joinCustomRoom.on('pointerover', () => {
      joinCustomRoom.setStroke('#fff', 2);
      this.cursorOver.play();
    });
    joinCustomRoom.on('pointerout', () => {
      joinCustomRoom.setStroke('#000', 0);
      this.cursorOver.stop();
    });
    joinCustomRoom.on('pointerdown', () => {
      this.clickSound.play();
    });
    joinCustomRoom.on('pointerup', () => {
      this.input.enabled = false;
      this.socket.removeAllListeners();
      this.scene.stop('LobbyScene');
      this.scene.start('JoinRoomScene', {
        socket: this.socket,
        charSpriteKey: this.charSpriteKey,
        username: this.username,
        menuMusic: this.menuMusic,
      });
    });

    // create a custom room
    const createRoomButton = this.add
      .text(width * 0.15, 428, 'Create New Room', {
        fontFamily: 'customFont',
        fontSize: '30px',
        fill: '#000',
      })

    createRoomButton.setInteractive();
    createRoomButton.on('pointerover', () => {
      createRoomButton.setStroke('#fff', 2);
      this.cursorOver.play();
    });
    createRoomButton.on('pointerout', () => {
      createRoomButton.setStroke('#000', 0);
      this.cursorOver.stop();
    });
    createRoomButton.on('pointerdown', () => {
      this.clickSound.play();
    });
    createRoomButton.on('pointerup', () => {
      this.input.enabled = false;
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
      this.input.enabled = true;
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
      this.input.enabled = true;
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

  update() {
    // move clouds from right to left repeatedly at random height
    this.clouds.forEach((cloud) => {
      cloud.x -= 0.5;
      if (cloud.x < -100) {
        cloud.x = this.scale.width + 100;
        cloud.y = Math.floor(Math.random() * this.scale.height);
      }
    });
  }

  createUI() {
    const backButton = this.add
      .image(this.scale.width - 20, 20, 'backButton')
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setScale(4);
    backButton.setInteractive();
    backButton.on('pointerover', () => {
      backButton.setTint(0xc2c2c2);
      this.cursorOver.play();
    });
    backButton.on('pointerout', () => {
      backButton.clearTint();
      this.cursorOver.stop();
    });
    backButton.on('pointerdown', () => {
      this.clickSound.play();
      backButton.setTint(0x3f3f3f);
    });
    backButton.on('pointerup', () => {
      this.input.enabled = false;
      this.socket.removeAllListeners();
      this.scene.stop('LobbyScene');
      this.scene.start('CharSelection');
    });
  }
}
