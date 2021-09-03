import 'phaser';
import eventsCenter from '../utils/EventsCenter';

export default class TransitionScene extends Phaser.Scene {
  constructor() {
    super('TransitionScene');
  }

  create() {
    const { width, height } = this.scale;
    const dinoKeys = ['dino_green', 'dino_yellow', 'dino_red', 'dino'];
    this.dinos = [];

    // create transition message
    this.message = this.add
      .text(width - 100 - 50 * 3.7, height - 100, 'Dino-Teleporting...', {
        fontFamily: 'customFont',
        fontSize: '15px',
        fill: '#fff',
      })
      .setAlpha(0)
      .setOrigin(1, 1);

    // create static dino sprites
    this.randomFrameIdx = 0;
    dinoKeys.forEach((key, i) => {
      const dino = this.add
        .sprite(width - 100 - 50 * i, height - 100, key, 4 + i)
        .setScale(2.25)
        .setAlpha(0)
        .setOrigin(1, 1);
      this.dinos.push(dino);
    });

    // show up message & dinos when transiting to next stage
    eventsCenter.on('startTransition', () => {
      console.log('start transition');
      this.message.setAlpha(1);
      this.getRandomFrameIdx();
      this.dinos.forEach((dino, i) => {
        dino.setAlpha(1);
        dino.setFrame(this.getNewFrame(i));
      });
    });

    // hide message & dinos when next stage is loaded
    eventsCenter.on('stopTransition', () => {
      console.log('stop transition');
      this.message.setAlpha(0);
      this.dinos.forEach((dino) => {
        dino.setAlpha(0);
      });
    });
  }

  getRandomFrameIdx() {
    this.randomFrameIdx = Math.floor(Math.random() * 6);
  }

  // get random index for dinos' frame num
  getNewFrame(i) {
    return 4 + ((i + this.randomFrameIdx) % 6);
  }
}
