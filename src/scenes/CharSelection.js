import 'phaser';
import PlayerConfig from '../utils/PlayerConfig';

export default class CharSelection extends Phaser.Scene {
  constructor() {
    super('CharSelection')
  }

  create() {
    const playerConfig = new PlayerConfig(this);
    playerConfig.createDinoAnimations('dino');
    playerConfig.createDinoAnimations('dino_red');
    playerConfig.createDinoAnimations('dino_yellow');
    playerConfig.createDinoAnimations('dino_green');

    const width = this.game.config.width;
    const height = this.game.config.height;
    const dino = this.dino = this.add.sprite(width * 0.2, height / 2, 'dino')
    .setScale(7);
    const dino_red = this.dino_red = this.add.sprite(width * 0.4, height / 2, 'dino_red')
    .setScale(7);
    const dino_yellow = this.dino_yellow = this.add.sprite(width * 0.6, height / 2, 'dino_yellow')
    .setScale(7);
    const dino_green = this.dino_green = this.add.sprite(width * 0.8, height / 2, 'dino_green')
    .setScale(7);

    dino.on('pointerover', function(pointer) {
      console.log('Pointer is over blue dino')
      dino.play('run_dino', true)
    })
    dino_red.on('pointerover', function(pointer) {
      console.log('Pointer is over red dino')
      dino_red.play('run_dino_red', true)
    })
    dino_yellow.on('pointerover', function(pointer) {
      console.log('Pointer is over yellow dino')
      dino_yellow.play('run_dino_yellow', true)
    })
    dino_green.on('pointerover', function(pointer) {
      console.log('Pointer is over green dino')
      dino_green.play('run_dino_green', true)
    })
  }
}