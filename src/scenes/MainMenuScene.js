export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }
    preload() {
        console.log('ayo')
    }
    create() {
        this.add.text(this.scale.width, this.scale.height, "Main Menu Scene", { fontSize : '32px' }).setOrigin(0, 0);
    }
}