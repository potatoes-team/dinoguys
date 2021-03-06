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
    // background music
    if (!this.menuMusic.isPlaying) {
      this.menuMusic.isPlaying();
    }

    //create cursor hover sound
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

    //create click sound
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

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
        fontFamily: 'customFont',
        textColor: 0xffffff,
        fontSize: '24px',
        fixedWidth: 300,
        fixedHeight: 60,
      }
    );

    const joinButton = this.add.text(
      this.scale.width / 2 - 100,
      this.scale.height / 2,
      'Join Room',
      {
        fontFamily: 'customFont',
        fontSize: '20px',
        fill: '#000',
      }
    );

    joinButton.setInteractive();
    joinButton.on('pointerover', () => {
      joinButton.setStroke('#fff', 2);
      this.cursorOver.play();
    });
    joinButton.on('pointerout', () => {
      joinButton.setStroke('#000', 0);
      this.cursorOver.stop();
    });
    joinButton.on('pointerdown', () => {
      this.clickSound.play();
    });
    joinButton.on('pointerup', () => {
      this.input.enabled = false;
      const textbox = rexUIConfig.scene.input.displayList.list.find(
        (e) => e.type === 'rexBBCodeText'
      );
      this.socket.emit('joinRoom', {
        roomKey: textbox._text.toUpperCase(),
        spriteKey: this.charSpriteKey,
        username: this.username,
      });
    });

    this.socket.on('roomDoesNotExist', () => {
      this.input.enabled = true;
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
      this.input.enabled = true;
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
      this.input.enabled = true;
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
      this.game.music.stopAll();
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
      backButton.setAlpha(1);
      this.socket.removeAllListeners();
      this.scene.stop('StageSelection');
      this.scene.start('LobbyScene');
    });
  }
}
