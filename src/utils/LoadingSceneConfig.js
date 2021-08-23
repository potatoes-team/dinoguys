import PlayerConfig from "./PlayerConfig";
export default class LoadingSceneConfig extends PlayerConfig {
	constructor(scene, key) {
		super(scene, key);
	}
	
}

// LoadingSceneConfig inherits the PlayerConfig
// MOTIVATION: Examine line 25 of the LoadingScene
// const config = new LoadingSceneConfig(this, 'loadingdino');

// Suppose in FgScene we wish to utilize PlayerScene's createAnimation method.
// It would not make sense to reference LoadingSceneConfig (semantically incorrect) in order to do that, we can just instantiate a new object on the
// PlayerConfig class like.
// const config = new PlayerConfig(this, 'keyOfSpriteSheet')
// obj.createAnimations()

// Using this will allow us to remove the entire createAnimations defintion in FgScene as to clean up the code and prevent multiple createAnimation() declarations.