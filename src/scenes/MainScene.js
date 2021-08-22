import 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  init(data) {
    this.socket = data.socket;
  }

  create() {
    // this.scene.launch('BgScene');
    this.scene.start('FgScene', { socket: this.socket });
  }
}
