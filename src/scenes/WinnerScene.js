import 'phaser';

export default class WinnerScene extends Phaser.Scene {
  constructor() {
    super('WinnerScene');
  }

  init(data) {
    this.winner = data.winner;
    this.losers = data.losers;
    this.playerWon = data.playerWon;
  }

  create() {
    const { width, height } = this.scale;
    const winnerName = this.playerWon ? 'YOU' : this.winner.username;
    this.cameras.main.fadeIn(2000, 0, 0, 0);

    // background music
    this.winnerMusic = this.game.music.add('winnerMusic');
    this.winnerMusic.play({ volume: 0.1, loop: true });

    // background sky
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

    // emit confetti particles
    const confettiColors = ['blue', 'red', 'yellow'];
    confettiColors.forEach((color) => {
      let confetti = this.add.particles(`confetti-${color}`);
      confetti.createEmitter({
        x: { min: 0, max: 1280 },
        y: 0,
        lifespan: 2400,
        speedX: { min: -20, max: 20 },
        speedY: { min: 150, max: 250 },
        scale: { min: 0.5, max: 1 },
        rotate: { min: -120, max: 120 },
      });
    });

    // create ground
    this.add.image(width / 2, height / 2, 'ground');

    // create crying loser dinos
    const standPoints = [427, 854, 327, 954, 227];
    Object.keys(this.losers).forEach((loserId, i) => {
      const { spriteKey, username } = this.losers[loserId];
      const loserDino = this.add
        .sprite(standPoints[i], 525, spriteKey)
        .setScale(6);
      this.add
        .text(loserDino.x, loserDino.y - 55, username, {
          fontSize: '20px',
          fill: '#fff',
        })
        .setOrigin(0.5, 1);
      if (loserDino.x > width / 2) loserDino.flipX = true;
      loserDino.play(`lose_${spriteKey}`, true);
    });

    // create jumping winner dino
    const winnerDino = this.add
      .sprite(width / 2, height / 2 - 50, this.winner.spriteKey)
      .setScale(12);
    winnerDino.play(`run_${this.winner.spriteKey}`, true);
    this.tweens.add({
      targets: winnerDino,
      y: '-=80',
      repeat: -1,
      yoyo: true,
      ease: 'Cubic',
      duration: 500,
    });

    // create trophy
    this.add.image(width / 2, (height / 3) * 2, 'trophy').setScale(5);

    // display message of who winned the stage
    this.add
      .text(width / 2, height * 0.15, `${winnerName} WON!!!`, {
        fontFamily: 'customFont',
        fontSize: '44px',
        fill: '#000',
      })
      .setStroke('#fff', 2)
      .setOrigin(0.5, 0.5);

    // button for going back to lobby
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
    const { width } = this.scale;
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

    this.backButton = this.add
      .image(width - 20, 20, 'forwardButton')
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setScale(4);

    this.backButton.setInteractive();
    this.backButton.on('pointerover', () => {
      this.backButton.setTint(0xc2c2c2);
      this.cursorOver.play();
    });
    this.backButton.on('pointerout', () => {
      this.backButton.clearTint();
      this.cursorOver.stop();
    });
    this.backButton.on('pointerdown', () => {
      this.clickSound.play();
      this.backButton.setTint(0x3f3f3f);
    });

    this.backButton.on('pointerup', () => {
      this.input.enabled = false;
      this.game.music.stopAll();
      this.sound.stopAll();
      this.scene.stop('WinnerScene');
      this.scene.start('LobbyScene');
    });
  }
}
