import RexUIConfig from '../utils/RexUIConfig';

export default class JoinRoomScene extends Phaser.Scene {
  constructor() {
    super('JoinRoomScene');
  }
  init(data) {
    this.socket = data.socket;
    this.charSpriteKey = data.charSpriteKey;
    this.username = data.username;
    this.menuMusic = data.menuMusic;
  }

  create() {
    if (!this.menuMusic.isPlaying) {
      this.menuMusic.isPlaying();
    }

    this.add.image(0, 0, 'main-menu-background').setOrigin(0);

    //create cursor hover sound
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

    //create click sound
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

    this.add
      .text(
        this.scale.width / 2 - 222,
        this.scale.height / 2 - 200,
        'Enter Room Code',
        {
          fontFamily: 'customFont',
          fontSize: '30px',
          color: '#000',
        }
      )
      .setStroke('#fff', 2);

    const rexUIConfig = new RexUIConfig(this);
    rexUIConfig.createTextBox(
      this.scale.width / 2,
      this.scale.height / 2 - 100,
      {
        textColor: 0xffffff,
        fontSize: '24px',
        fixedWidth: 300,
        fixedHeight: 60,
      }
    );

    const joinButton = this.add
      .text(this.scale.width / 2 - 100, this.scale.height / 2, 'Join Room', {
        fontFamily: 'customFont',
        fontSize: '20px',
        color: '#000',
      })
      .setStroke('#fff', 2);

    joinButton.setInteractive();
    joinButton.on('pointerover', () => {
      this.cursorOver.play();
    });
    joinButton.on('pointerout', () => {
      this.cursorOver.stop();
    });
    joinButton.on('pointerdown', () => {
      this.clickSound.play();
    });
    joinButton.on('pointerup', () => {
      this.socket.emit('joinRoom', {
        roomKey:
          rexUIConfig.scene.input.displayList.list[2]._text.toUpperCase(),
        spriteKey: this.charSpriteKey,
        username: this.username,
      });
    });

    this.socket.on('roomDoesNotExist', () => {
      const roomDNE = this.add
        .text(
          this.scale.width / 2 - 350,
          this.scale.height / 2 - 300,
          'This room does not exist',
          {
            fontFamily: 'customFont',
            fontSize: '30px',
            fill: '#000',
          }
        )
        .setStroke('#fff', 2);
      const roomDNEInterval = setInterval(() => {
        roomDNE.destroy();
        clearInterval(roomDNEInterval);
      }, 3000);
    });

    this.socket.on('roomClosed', () => {
      const roomClosedText = this.add
        .text(
          this.scale.width / 2 - 155,
          this.scale.height / 2 - 300,
          'This room is closed',
          {
            fontFamily: 'customFont',
            fontSize: '30px',
            fill: '#000',
          }
        )
        .setStroke('#fff', 2);
      const roomClosedInterval = setInterval(() => {
        roomClosedText.destroy();
        clearInterval(roomClosedInterval);
      }, 3000);
    });

    this.socket.on('roomFull', () => {
      const roomFullText = this.add
        .text(
          this.scale.width / 2 - 155,
          this.scale.height / 2 - 300,
          'This room is full',
          {
            fontFamily: 'customFont',
            fontSize: '30px',
            fill: '#000',
          }
        )
        .setStroke('#fff', 2);
      const roomFullInterval = setInterval(() => {
        roomFullText.destroy();
        clearInterval(roomFullInterval);
      }, 3000);
    });

    this.socket.on('roomInfo', ({ roomInfo, roomKey }) => {
      this.socket.removeAllListeners();
      this.sound.stopAll();
      this.scene.stop('JoinRoomScene');
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
    });
    backButton.on('pointerup', () => {
      this.socket.removeAllListeners();
      this.scene.stop('StageSelection');
      this.scene.start('LoobyScene');
    });
  }
}
