import 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, spriteKey) {
    super(scene, x, y, spriteKey);
    // Store reference of scene passed to constructor
    this.scene = scene;
    // Add player to scene and enable physics
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setCollideWorldBounds(true); // player can't walk off camera
    // this.setActive(true);
  }

  // Check which controller button is being pushed and execute movement & animation
  update(cursors /* jumpSound */) {
    this.updateMovement(cursors);
    this.updateJump(cursors /*, jumpSound */);
    this.updateInAir();
  }

  updateMovement(cursors) {
    // Move left
    if (cursors.left.isDown) {
      if (!this.facingLeft) {
        this.flipX = !this.flipX;
        this.facingLeft = true;
      }
      this.setVelocityX(-360);
      if (this.body.blocked.down) {
        this.play('run', true);
      }
    }

    // Move right
    else if (cursors.right.isDown) {
      if (this.facingLeft) {
        this.flipX = !this.flipX;
        this.facingLeft = false;
      }
      this.setVelocityX(360);

      if (this.body.blocked.down) {
        this.play('run', true);
      }
    }

    // Neutral (no movement)
    else {
      this.setVelocityX(0);
      this.play('idle');
    }
  }

  updateJump(cursors /*, jumpSound */) {
    if (cursors.up.isDown && this.body.blocked.down) {
      this.setVelocityY(-800);
      // jumpSound.play();
    }
  }

  updateInAir() {
    if (!this.body.blocked.down) {
      this.play('run');
    }
  }
}
