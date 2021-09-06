import 'phaser';

export default class Settings extends Phaser.Scene {
  constructor(){
    super('Settings');
  }

  create(){
    const { width, height } = this.scale;
    const midPanel = width / 2 - 48
    const volumeButtonPos = width / 2

    const panel = this.add.image(width / 2, height / 2, 'settings-panel')
    panel.setScale(1.4);

    this.add.text(midPanel - 60, 55, 'Settings', {
      fontSize: '30px',
      fontFamily: 'customFont'
    })

    const closeButton = this.add.image(width / 2 + 280, 67, 'closeButton')
    .setScale(3)
    .setScrollFactor(0)
    .setInteractive();

    // create cursor hover sound
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

    //create click sound
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

    closeButton.on('pointerover', () => {
      closeButton.setTint(0xc2c2c2)
      this.cursorOver.play();
    });
    closeButton.on('pointerout', () => {
      this.cursorOver.stop();
      closeButton.clearTint()
    });
    closeButton.on('pointerdown', () => {
      this.clickSound.play();
      closeButton.setTint(0x3f3f3f);
    })
    closeButton.on('pointerup', () => {
      closeButton.clearTint();
      this.scene.sleep();
    })
    // volume rocker for music
    this.add.text(midPanel, 150, 'Music', {
      fontSize: '20px',
      fontFamily: 'customFont',
      align: 'center'
    })
		const musicVolumeUp = this.add.text(width / 2 + 105, 205, '+', {
      fontSize: '40px',
      fontFamily: 'customFont',
    }).setStroke('#000', 3);
		const music = this.add.image(volumeButtonPos, 225, 'volumeUnmute')
    .setScale(3)
    .setScrollFactor(0);
		const musicVolumeDown = this.add.text(width / 2 - 140, 205, '-',{
      fontSize: '40px',
      fontFamily: 'customFont',
    }).setStroke('#000', 3);

		musicVolumeUp.setInteractive();
		musicVolumeUp.on('pointerup', () => {
			this.game.music.volume += 0.25;
			console.log(this.game.music.volume)
      musicVolumeUp.clearTint();
		});
    musicVolumeUp.on('pointerover', () => {
      musicVolumeUp.setTint(0xc2c2c2)
      this.cursorOver.play();
    });
    musicVolumeUp.on('pointerout', () => {
      musicVolumeUp.clearTint();
      this.cursorOver.stop();
    });
    musicVolumeUp.on('pointerdown', () => {
      this.clickSound.play();
      musicVolumeUp.setTint(0x3f3f3f);
    })

		musicVolumeDown.setInteractive();
		musicVolumeDown.on('pointerup', () => {
			if(this.game.music.volume > 0){
				this.game.music.volume -= 0.25;
			}
      musicVolumeDown.clearTint();
		});
    musicVolumeDown.on('pointerover', () => {
      musicVolumeDown.setTint(0xc2c2c2)
      this.cursorOver.play();
    });
    musicVolumeDown.on('pointerout', () => {
      musicVolumeDown.clearTint();
      this.cursorOver.stop();
    });
    musicVolumeDown.on('pointerdown', () => {
      this.clickSound.play();
      musicVolumeDown.setTint(0x3f3f3f);
    });

		music.setInteractive();
		music.on('pointerup', () => {
			if(this.game.music.mute){
				this.game.music.setMute(false);
        music.setTexture('volumeUnmute');
				console.log(this.game.music.mute)
			} else {
				this.game.music.setMute(true);
        music.setTexture('volumeMute');
				console.log(this.game.music.mute)
			}
		});
    music.on('pointerover', () => {
      music.setTint(0xc2c2c2);
      this.cursorOver.play();
    });
    music.on('pointerout', () => {
      music.clearTint();
      this.cursorOver.stop();
    });
    music.on('pointerdown', () => {
      this.clickSound.play();
    })

    // volume rocker for sfx
    this.add.text(midPanel + 20, 300, 'SFX', {
      fontSize: '20px',
      fontFamily: 'customFont',
      align: 'center'
    })
    const sfxVolumeUp = this.add.text(width / 2 + 105, 355, '+', {
      fontSize: '40px',
      fontFamily: 'customFont',
    }).setStroke('#000', 3);
		const sfx = this.add.image(volumeButtonPos, 375, 'volumeUnmute')
    .setScale(3)
    .setScrollFactor(0);
		const sfxVolumeDown = this.add.text(width / 2 - 140, 355, '-',{
      fontSize: '40px',
      fontFamily: 'customFont',
    }).setStroke('#000', 3);

		sfxVolumeUp.setInteractive();
		sfxVolumeUp.on('pointerup', () => {
			this.game.sfx.volume += 0.5;
			console.log(this.game.sfx.volume)
      sfxVolumeUp.clearTint();
		});
    sfxVolumeUp.on('pointerover', () => {
      sfxVolumeUp.setTint(0xc2c2c2)
      this.cursorOver.play();
    });
    sfxVolumeUp.on('pointerout', () => {
      sfxVolumeUp.clearTint()
      this.cursorOver.stop();
    });
    sfxVolumeUp.on('pointerdown', () => {
      this.clickSound.play();
      sfxVolumeUp.setTint(0x3f3f3f);
    })

		sfxVolumeDown.setInteractive();
		sfxVolumeDown.on('pointerup', () => {
			if(this.game.sfx.volume > 0){
				this.game.sfx.volume -= 0.5;
			}
			console.log(this.game.sfx.volume)
      sfxVolumeDown.clearTint();
		});
    sfxVolumeDown.on('pointerover', () => {
      sfxVolumeDown.setTint(0xc2c2c2)
      this.cursorOver.play();
    });
    sfxVolumeDown.on('pointerout', () => {
      sfxVolumeDown.clearTint();
      this.cursorOver.stop();
    });
    sfxVolumeDown.on('pointerdown', () => {
      this.clickSound.play();
      sfxVolumeDown.setTint(0x3f3f3f);
    })

		sfx.setInteractive();
		sfx.on('pointerup', () => {
			if(this.game.sfx.mute){
				this.game.sfx.setMute(false);
        sfx.setTexture('volumeUnmute');
				console.log(this.game.sfx.mute)
			} else {
				this.game.sfx.setMute(true);
        sfx.setTexture('volumeMute');
				console.log(this.game.sfx.mute)
			}
		});
    sfx.on('pointerover', () => {
      sfx.setTint(0xc2c2c2)
      this.cursorOver.play();
    });
    sfx.on('pointerout', () => {
      sfx.clearTint();
      this.cursorOver.stop();
    });
    sfx.on('pointerdown', () => {
      this.clickSound.play();
    })

    // volume rocker for buttons
    this.add.text(midPanel - 15, 455, 'Buttons', {
      fontSize: '20px',
      fontFamily: 'customFont',
      align: 'center'
    })
    const buttonVolumeUp = this.add.text(width / 2 + 105, 505, '+', {
      fontSize: '40px',
      fontFamily: 'customFont',
    }).setStroke('#000', 3);
		const button = this.add.image(volumeButtonPos, 525, 'volumeUnmute')
    .setScale(3)
    .setScrollFactor(0);
		const buttonVolumeDown = this.add.text(width / 2 - 140, 505, '-',{
      fontSize: '40px',
      fontFamily: 'customFont',
    }).setStroke('#000', 3);

		buttonVolumeUp.setInteractive();
		buttonVolumeUp.on('pointerup', () => {
			this.game.sound.volume += 0.25;
			console.log(this.game.sound.volume)
      buttonVolumeUp.clearTint();
		});
    buttonVolumeUp.on('pointerover', () => {
      buttonVolumeUp.setTint(0xc2c2c2);
      this.cursorOver.play();
    });
    buttonVolumeUp.on('pointerout', () => {
      buttonVolumeUp.clearTint();
      this.cursorOver.stop();
    });
    buttonVolumeUp.on('pointerdown', () => {
      this.clickSound.play();
      buttonVolumeUp.setTint(0x3f3f3f);
    })


		buttonVolumeDown.setInteractive();
		buttonVolumeDown.on('pointerup', () => {
			if(this.game.sound.volume > 0){
				this.game.sound.volume -= 0.25;
			}
			console.log(this.game.sound.volume)
      buttonVolumeDown.clearTint();
		});
    buttonVolumeDown.on('pointerover', () => {
      buttonVolumeDown.setTint(0xc2c2c2);
      this.cursorOver.play();
    });
    buttonVolumeDown.on('pointerout', () => {
      buttonVolumeDown.clearTint();
      this.cursorOver.stop();
    });
    buttonVolumeDown.on('pointerdown', () => {
      this.clickSound.play();
      buttonVolumeDown.setTint(0x3f3f3f);
    })

		button.setInteractive();
		button.on('pointerup', () => {
			if(this.game.sound.mute){
				this.game.sound.setMute(false);
        button.setTexture('volumeUnmute');
				console.log(this.game.sound.mute)
			} else {
				this.game.sound.setMute(true);
        button.setTexture('volumeMute');
				console.log(this.game.sound.mute)
			}
		});
    button.on('pointerover', () => {
      button.setTint(0xc2c2c2);
      this.cursorOver.play();
    });
    button.on('pointerout', () => {
      button.clearTint();
      this.cursorOver.stop();
    });
    button.on('pointerdown', () => {
      this.clickSound.play();
    })
  }
}
