export default {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1500 },
      debug: true,
    },
  },
  render: {
    pixelArt: true,
  },
};
