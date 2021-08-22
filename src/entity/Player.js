import 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, spriteKey, socket) {
    super(scene, x, y, spriteKey);
    this.scene = scene;
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setCollideWorldBounds(true); // player can't walk off camera
    this.facingLeft = false,
    this.flipX = false;
    this.socket = socket;
    this.moveState = {
      x,
      y,
      left: false,
      right: false,
      up: false,
    }
  }

  // Check which controller button is being pushed and execute movement & animation
  update(cursors /* , jumpSound */) {
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
      this.setVelocityX(-250);
      if (this.body.onFloor()) {
        this.play('run', true);
      }
      if(this.socket){
        this.moveState.x = this.x;
        this.moveState.y = this.y;
        this.moveState.left = true;
        this.moveState.right = false;
        this.moveState.up = false;
        this.socket.emit("updatePlayer", this.moveState);
      }
    }

    // Move right
    else if (cursors.right.isDown) {
      if (this.facingLeft) {
        this.flipX = !this.flipX;
        this.facingLeft = false;
      }
      this.setVelocityX(250);

      if (this.body.onFloor()) {
        this.play('run', true);
      }

      if(this.socket){
        this.moveState.x = this.x;
        this.moveState.y = this.y;
        this.moveState.left = false;
        this.moveState.right = true;
        this.moveState.up = false;
        this.socket.emit("updatePlayer", this.moveState);
      }
    }

    // Neutral (no movement)
    else {
      this.setVelocityX(0);
      this.play('idle', true);
      if(this.socket){
        this.moveState.x = this.x;
        this.moveState.y = this.y;
        this.moveState.left = false;
        this.moveState.right = false;
        this.moveState.up = false;
        this.socket.emit("updatePlayer", this.moveState);
      }
    }
  }

  updateJump(cursors /*, jumpSound */) {
    if (cursors.up.isDown && this.body.onFloor()) {
      this.setVelocityY(-550);
      if(this.socket){
        this.moveState.x = this.x;
        this.moveState.y = this.y;
        this.moveState.left = false;
        this.moveState.right = false;
        this.moveState.up = true;
        this.socket.emit("updatePlayer", this.moveState);
      }
      // jumpSound.play();
    }
  }

  updateInAir() {
    if (!this.body.onFloor()) {
      this.anims.stop();
    }
  }

  updateOtherPlayer(moveState){
    if (moveState.left) {
      if (!this.facingLeft) {
        this.flipX = !this.flipX;
        this.facingLeft = true;
      }
      this.setVelocityX(-250);
      if (this.body.onFloor()) {
        this.play('run', true);
      }
      this.setPosition(moveState.x, moveState.y);
    }

    // Move right
    else if (moveState.right) {
      if (this.facingLeft) {
        this.flipX = !this.flipX;
        this.facingLeft = false;
      }
      this.setVelocityX(250);

      if (this.body.onFloor()) {
        this.play('run', true);
      }
      this.setPosition(moveState.x, moveState.y);
    }

    // Neutral (no movement)
    else {
      this.setVelocityX(0);
      this.play('idle', true);
      this.setPosition(moveState.x, moveState.y);
    }
  }
}

