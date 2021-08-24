export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }
    preload() {
        console.log('ayo')
    }
    create() {
        this.add.text(this.scale.width / 2, this.scale.height / 2, "Main Menu Scene", { fontSize : '32px' }).setOrigin(.5, .5);
    }
}