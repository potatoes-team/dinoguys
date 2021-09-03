import 'phaser';

export default class WinnerScene extends Phaser.Scene {
  constructor() {
    super('WinnerScene');
  }

  init(data) {
    this.winner = data.winner;
    this.playerWon = data.playerWon;
  }

  create() {
    const { width, height } = this.scale;
    const winnerName = this.playerWon ? 'YOU' : this.winner.username;
    // winner sprite key = this.winner.spriteKey

    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // message for who winned the stage
    this.add
      .text(width / 2, height / 2, `${winnerName} WON!!!`, {
        fontFamily: 'customFont',
        fontSize: '80px',
        fill: '#fff',
      })
      .setOrigin(0.5, 0.5);

    // button for going back to lobby
    this.createUI();
  }

  createUI() {
    const { width, height } = this.scale;
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

    this.backButton = this.add
      .text(width / 2, (height / 4) * 3, 'BACK TO LOBBY', {
        fontFamily: 'customFont',
        fontSize: '30px',
        fill: '#fff',
      })
      .setOrigin(0.5, 0.5);

    this.backButton.setInteractive();
    this.backButton.on('pointerover', () => {
      this.cursorOver.play();
    });

    this.backButton.on('pointerout', () => {
      this.cursorOver.stop();
    });

    this.backButton.on('pointerup', () => {
      this.scene.stop('WinnerScene');
      this.scene.start('LobbyScene');
    });
  }
}
