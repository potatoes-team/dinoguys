import PlayerConfig from "./PlayerConfig";
export default class LoadingSceneConfig extends PlayerConfig {
	constructor(scene) {
		// Remember, scene is referring to the entire global this object in LoadingScene.js
		// We are going to pass call the constructor of PlayerConfig 
		// By class inheritance. When we passed in 'this' in new LoadingSceneConfig(this), 
		// our actual LoadingScene became the 'this' object in  LoadingSceneConfig (and PlayerConfig because of super)
		super(scene);
	}
	generateRandomHint(){
		const { width, height } = this.scale;
		const messages = ['Message 1', 'Message 2', 'Message 3', 'Message 4', 'Message 5', 'Message 6'];
		const randomIndex = Math.floor(Math.random() * messages.length);
		if(!this.textState) {
			this.textState = this.add.text(width / 2, height * .9, `Hint: ${messages[randomIndex]}`, { fontSize: '15px' }).setOrigin(0.5);
		} else {
			this.textState.setText(`Hint: ${messages[randomIndex]}`);
		}
	}
	startMessageLoop() {
		const { scene, generateRandomHint } = this;
		scene.messageLoop = scene.time.addEvent({
			callback: generateRandomHint,
			delay: 5000,
			callbackScope: scene,
			loop: true
		})
	}
	stopMessageLoop() {
		const { scene } = this;
		scene.messageLoop.destroy();
	}
}

// LoadingSceneConfig inherits the PlayerConfig
// MOTIVATION: Examine line 25 of the LoadingScene
// const config = new LoadingSceneConfig(this);
// config.createAnimations('loadingdino');

// Suppose in FgScene we wish to utilize PlayerScene's createAnimation method.
// It would not make sense to reference LoadingSceneConfig (semantically incorrect) in order to do that, we can just instantiate a new object on the
// PlayerConfig class like.
// const config = new PlayerConfig(this)
// config.createAnimations('keyOfSpriteSheet')

// Using this will allow us to remove the entire createAnimations defintion in FgScene as to clean up the code and prevent multiple createAnimation() declarations.

// Yet we also want to utilize LoadingSceneConfig as there are methods in that class that are not available in PlayerConfig, but by inheritance, LoadingSceneConfig
// has every method defined in PlayerConfig.