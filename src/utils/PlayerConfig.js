export default class PlayerConfig {
	constructor(scene) {
		// In this file. Think of scene IS the global 'this' object from LoadingScene.js
		// this.scene === this from any Scene file.
		this.scene = scene;
	}
	createAnimations(key) {
		// player animations
		const { scene } = this;
		scene.anims.create({
			key: 'idle',
			frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
			frameRate: 6,
			repeat: -1,
		});
		scene.anims.create({
			key: 'run',
			frames: scene.anims.generateFrameNumbers(key, { start: 4, end: 9 }),
			frameRate: 20,
			repeat: -1,
		});
		scene.anims.create({
			key: 'hurt',
			frames: scene.anims.generateFrameNumbers(key, { start: 13, end: 16 }),
			frameRate: 10,
			repeat: -1,
		});
	}
}
