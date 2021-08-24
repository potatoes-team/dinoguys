export default class SpriteRunningInLoadingScene extends Phaser.Scene {
    constructor() {
        super('SpriteRunningInLoadingScene');
    }
    init(data){
        this.config = data.config;
    }
    preload() {
        console.log('I exist');
    }
}