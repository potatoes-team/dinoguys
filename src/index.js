/** @type {import("../typings/phaser")} */
/* The above loads the phaser.d.ts file so that VSCode has autocomplete for the Phaser API.
If you experience problems with autocomplete, try opening the phaser.d.ts file and scrolling up and down in it.
That may fix the problem -- some weird quirk with VSCode. A new typing file is released with
every new release of Phaser. Make sure it's up-to-date!

At some point, the typings will
be officially added to the official release so that all you'll have to do is do:

npm install @types/phaser

But this hasn't happened yet!
*/

import 'phaser';
import io from 'socket.io-client';
import config from './config/config';
import LobbyScene from './scenes/LobbyScene';
import WaitingScene from './scenes/WaitingScene';
import FgScene from './scenes/FgScene';
import LoadingScene from './scenes/LoadingScene';
import MainMenuScene from './scenes/MainMenuScene';
import SpriteLoaderScene from './scenes/SpriteLoaderScene';

class Game extends Phaser.Game {
  constructor() {
    // add the config file to the game
    super(config);

    // connect to socket
    this.socket = io();

    // add all the scenes
    this.scene.add('LobbyScene', LobbyScene);
    this.scene.add('FgScene', FgScene);
    this.scene.add('WaitingScene', WaitingScene);

    // start the game with the mainscene
    this.scene.start('LobbyScene', { socket: this.socket });
  }
}

// create new instance of game
window.onload = function () {
	window.game = new Game();
};
