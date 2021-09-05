import MainMenuSceneConfig from '../utils/MainMenuSceneConfig';

export default class AboutScene extends Phaser.Scene {
	constructor() {
		super('AboutScene');
	}
	preload() {
		this.load.image('githublogo', 'assets/backgrounds/github.png');
		this.load.image('linkedinlogo', 'assets/backgrounds/linkedin.png');
	}
	create() {
		const { height, width } = this.scale;
		// using mainMenuConfig
		const mainMenuConfig = new MainMenuSceneConfig(this);

		// setting the blue background
		const background = this.add.image(0, 0, 'main-menu-background').setOrigin(0);
		background.alpha = 0.3;

		const aboutLabel = mainMenuConfig.createAboutLabel('Back', 1060, 670, {
			bgColor: 0x949398,
			strokeColor: 0x000000,
			textColor: '#000',
			fontSize: '14px',
			fixedWidth: 200,
			fixedHeight: 15,
			isBackground: true,
		});
		// handle cursorOver sound
		this.cursorOver = this.sound.add('cursor');
		this.cursorOver.volume = 0.05;

		// handle label events, on pointerdown launch next scene
		mainMenuConfig.handleLabelEvents(aboutLabel, 'about', this.cursorOver);

		// name of the title
		this.add
			.text(width * 0.5, height * 0.1, 'Dinoguys: The Jurassic Adventure', {
				fontFamily: 'customFont',
				fontSize: '36px',
			})
			.setOrigin(0.5, 0.5)
			.setColor('#D9B48FFF');

		// name of the team
		this.add
			.text(width * 0.5, height * 0.25, 'TEAM POTATOES:', { fontFamily: 'customFont', fontSize: '30px' })
			.setOrigin(0.5, 0.5)
			.setColor('#D9B48FFF');

		// name of the team members
		this.add
			.text(width * 0.08, height * 0.35, 'Michael Orman', {
				fontFamily: 'customFont',
				fontSize: '22px',
				stroke: '#D9B48FFF',
				strokeThickness: 1,
			})
			.setOrigin(0, 0.5);

		this.add
			.text(width * 0.6, height * 0.35, 'Jaehoon Jung', {
				fontFamily: 'customFont',
				fontSize: '22px',
				stroke: '#D9B48FFF',
				strokeThickness: 1,
			})
			.setOrigin(0, 0.5);

		this.add
			.text(width * 0.08, height * 0.52, 'Chukwudi Ikem', {
				fontFamily: 'customFont',
				fontSize: '22px',
				stroke: '#D9B48FFF',
				strokeThickness: 1,
			})
			.setOrigin(0, 0.5);

		this.add
			.text(width * 0.54, height * 0.52, 'Hsin-Hua (Angie) Lin', {
				fontFamily: 'customFont',
				fontSize: '22px',
				stroke: '#D9B48FFF',
				strokeThickness: 1,
			})
			.setOrigin(0, 0.5);

		// shameless plugs -> githublogo linkedinlogo
		const teamButtons = [];
		// michael orman buttons
		teamButtons.push(
			this.add
				.image(width * 0.15, height * 0.42, 'githublogo')
				.setInteractive()
				.setScale(0.1)
				.setOrigin(0, 0.5)
		);
		teamButtons.push(
			this.add
				.image(width * 0.2, height * 0.42, 'linkedinlogo')
				.setInteractive()
				.setScale(0.1)
				.setOrigin(0, 0.5)
		);
		// chukwudi buttons
		teamButtons.push(
			this.add
				.image(width * 0.15, height * 0.59, 'githublogo')
				.setInteractive()
				.setScale(0.1)
				.setOrigin(0, 0.5)
		);
		teamButtons.push(
			this.add
				.image(width * 0.2, height * 0.59, 'linkedinlogo')
				.setInteractive()
				.setScale(0.1)
				.setOrigin(0, 0.5)
		);
		// jae buttons
		teamButtons.push(
			this.add
				.image(width * 0.67, height * 0.42, 'githublogo')
				.setInteractive()
				.setScale(0.1)
				.setOrigin(0, 0.5)
		);
		teamButtons.push(
			this.add
				.image(width * 0.72, height * 0.42, 'linkedinlogo')
				.setInteractive()
				.setScale(0.1)
				.setOrigin(0, 0.5)
		);
		//angie buttons
		teamButtons.push(
			this.add
				.image(width * 0.67, height * 0.59, 'githublogo')
				.setInteractive()
				.setScale(0.1)
				.setOrigin(0, 0.5)
		);
		teamButtons.push(
			this.add
				.image(width * 0.72, height * 0.59, 'linkedinlogo')
				.setInteractive()
				.setScale(0.1)
				.setOrigin(0, 0.5)
		);

		// this.add
		// 	.text(width * 0.005, height * 0.4, ' linkedin.com/in/michaelorman61/ ', {
		// 		fontFamily: 'customFont',
		// 		fontSize: '16px',
		// 		stroke: '#D9B48FFF',
		// 		strokeThickness: 1,
		// 	})
		// 	.setOrigin(0, 0.5);

		// this.add
		// 	.text(width * 0.005, height * 0.53, ' linkedin.com/in/chukwudiikem/', {
		// 		fontFamily: 'customFont',
		// 		fontSize: '16px',
		// 		stroke: '#D9B48FFF',
		// 		strokeThickness: 1,
		// 	})
		// .setOrigin(0, 0.5);
		// this.add
		// 	.text(width * 0.505, height * 0.4, ' linkedin.com/in/jaehoon-jungg/ ', {
		// 		fontFamily: 'customFont',
		// 		fontSize: '16px',
		// 		stroke: '#D9B48FFF',
		// 		strokeThickness: 1,
		// 	})
		// 	.setOrigin(0, 0.5);

		// this.add
		// 	.text(width * 0.505, height * 0.53, ' linkedin.com/in/hhlin83/ ', {
		// 		fontFamily: 'customFont',
		// 		fontSize: '16px',
		// 		stroke: '#D9B48FFF',
		// 		strokeThickness: 1,
		// 	})
		// 	.setOrigin(0, 0.5);

		// special accreditation
		this.add
			.text(width * 0.5, height * 0.68, 'PROJECT MANAGERS:', { fontFamily: 'customFont', fontSize: '30px' })
			.setOrigin(0.5, 0)
			.setColor('#D9B48FFF');

		// credit to pm
		this.add
			.text(width * 0.5, height * 0.78, 'Isaac Easton, Gary Kertis, Sarah Zhao, and Tori Weaver', {
				fontFamily: 'customFont',
				fontSize: '22px',
				stroke: '#D9B48FFF',
				strokeThickness: 1,
			})
			.setOrigin(0.5, 0)
			.setAlign('center');
	}

	openLink(stringParam) {
		const url = `https://www.linkedin.com/in/${stringParam}/`;
		const s = window.open(url, '_blank');
		if (s && s.focus) s.focus();
		else if (!s) {
			window.location.href = url;
		}
	}
}
