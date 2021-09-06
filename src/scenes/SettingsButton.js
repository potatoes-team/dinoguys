import 'phaser';

export default class SettingsButton extends Phaser.Scene {
  constructor(){
    super('SettingsButton');
    this.firstClick = true;
  }
  create(){
    console.log(this.scene.scene);
    const {width, height} = this.scale
    const settingsButton = this.add.image(width - 40, height - 40, 'settingsButton')
      .setScale(3)
      .setScrollFactor(0)
      .setInteractive();

      // create cursor hover sound
      this.cursorOver = this.sound.add('cursor');
      this.cursorOver.volume = 0.05;

      //create click sound
      this.clickSound = this.sound.add('clickSound');
      this.clickSound.volume = 0.05;

      settingsButton.on('pointerover', () => {
        this.cursorOver.play();
      });
      settingsButton.on('pointerout', () => {
        this.cursorOver.stop();
      });
      settingsButton.on('pointerdown', () => {
        this.clickSound.play();
        settingsButton.setTint(0xc2c2c2);
      })
      settingsButton.on('pointerup', () => {
        settingsButton.clearTint();
        if(this.firstClick){
          this.scene.launch('Settings');
          this.firstClick = false;
        }
        else{
          this.scene.wake('Settings');
        }
      })
  }
}
