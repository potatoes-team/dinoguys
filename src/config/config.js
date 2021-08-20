export default {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
};
