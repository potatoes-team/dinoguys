import 'phaser';

export default class Settings extends Phaser.Scene {
  constructor(){
    super('Settings');
  }

  create(){
    const { width, height } = this.scale;
    // volume rocker for music
		const musicVolumeUp = this.add.text(width / 2 + 50, this.height, '+');
		const music = this.add.text(width / 2, 0, 'mute');
		const musicVolumeDown = this.add.text(width / 2 - 30, 0, '-');

		musicVolumeUp.setInteractive();
		musicVolumeUp.on('pointerup', () => {
			this.game.music.volume += 0.25;
			console.log(this.game.music.volume)
		});

		musicVolumeDown.setInteractive();
		musicVolumeDown.on('pointerup', () => {
			if(this.game.music.volume > 0){
				this.game.music.volume -= 0.25;
			}
			console.log(this.game.music.volume)
		});

		music.setInteractive();
		music.on('pointerup', () => {
			if(this.game.music.mute){
				this.game.music.setMute(false);
				console.log(this.game.music.mute)
			} else {
				this.game.music.setMute(true);
				console.log(this.game.music.mute)
			}
		});

    // volume rocker for sfx
    const sfxVolumeUp = this.add.text(width / 2 + 50, 20, '+');
		const sfx = this.add.text(width / 2, 20, 'mute');
		const sfxVolumeDown = this.add.text(width / 2 - 30, 20, '-');

		sfxVolumeUp.setInteractive();
		sfxVolumeUp.on('pointerup', () => {
			this.game.sfx.volume += 0.5;
			console.log(this.game.sfx.volume)
		});

		sfxVolumeDown.setInteractive();
		sfxVolumeDown.on('pointerup', () => {
			if(this.game.sfx.volume > 0){
				this.game.sfx.volume -= 0.5;
			}
			console.log(this.game.sfx.volume)
		});

		sfx.setInteractive();
		sfx.on('pointerup', () => {
			if(this.game.sfx.mute){
				this.game.sfx.setMute(false);
				console.log(this.game.sfx.mute)
			} else {
				this.game.sfx.setMute(true);
				console.log(this.game.sfx.mute)
			}
		});

    // volume rocker for buttons
    const buttonVolumeUp = this.add.text(width / 2 + 50, 40, '+');
		const button = this.add.text(width / 2, 40, 'mute');
		const buttonVolumeDown = this.add.text(width / 2 - 30, 40, '-');

		buttonVolumeUp.setInteractive();
		buttonVolumeUp.on('pointerup', () => {
			this.game.sound.volume += 0.25;
			console.log(this.game.sound.volume)
		});

		buttonVolumeDown.setInteractive();
		buttonVolumeDown.on('pointerup', () => {
			if(this.game.sound.volume > 0){
				this.game.sound.volume -= 0.25;
			}
			console.log(this.game.sound.volume)
		});

		button.setInteractive();
		button.on('pointerup', () => {
			if(this.game.sound.mute){
				this.game.sound.setMute(false);
				console.log(this.game.sound.mute)
			} else {
				this.game.sound.setMute(true);
				console.log(this.game.sound.mute)
			}
		});
  }
}
