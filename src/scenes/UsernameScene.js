export default class UsernameScene extends Phaser.Scene{
    constructor(){
        super('UsernameScene');
    }
    preload() {}
    create() {
        this.add.text(this.scale.width / 2, this.scale.height / 2, "Username Scene", { fontSize : '32px' }).setOrigin(.5, .5);
    }
} 