import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';

import InputTextPlugin from 'phaser3-rex-plugins/plugins/inputtext-plugin';
import BBCodeTextPlugin from 'phaser3-rex-plugins/plugins/bbcodetext-plugin';
import TextEditPlugin from 'phaser3-rex-plugins/plugins/textedit-plugin.js';

export default {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 1500 },
			debug: false,
		},
	},
	render: {
		pixelArt: true,
	},
	parent: 'phaser-container',
	dom: {
		createContainer: true,
	},
	plugins: {
		scene: [
			{
				key: 'rexUI',
				plugin: UIPlugin,
				mapping: 'rexUI',
			},
		],
		global: [
			{
				key: 'rexInputTextPlugin',
				plugin: InputTextPlugin,
				start: true,
			},
			{
				key: 'rexBBCodeTextPlugin',
				plugin: BBCodeTextPlugin,
				start: true,
			},
			{
				key: 'rexTextEdit',
				plugin: TextEditPlugin,
				start: true,
			},
		],
	},
};
