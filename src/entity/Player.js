import 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, spriteKey, username, socket, platform) {
    super(scene, x, y, spriteKey);
    this.spriteKey = spriteKey;
    this.username = username;
    this.socket = socket;
    this.scene = scene;
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setCollideWorldBounds(true); // player can't walk off camera
    this.scene.physics.add.collider(this, platform, null, null, this);
    this.facingLeft = false;
    this.flipX = false;
    this.setScale(2.25);
    this.body.setSize(this.width * 0.6);
    this.moveState = {
      x,
      y,
      left: false,
      right: false,
      up: false,
    };
  }

  // move & animate player based on cursors pressed, and broadcast its movements to other players
  update(cursors /* , jumpSound */) {
    this.updateMovement(cursors);
    this.updateJump(cursors /*, jumpSound */);
    this.updateInAir();
  }

  updateMovement(cursors) {
    // player moves left
    if (cursors.left.isDown) {
      if (!this.facingLeft) {
        this.flipX = !this.flipX;
        this.facingLeft = true;
      }
      this.setVelocityX(-250);
      if (this.body.onFloor()) {
        this.play(`run_${this.spriteKey}`, true);
      }
      if (this.socket) {
        this.moveState.x = this.x;
        this.moveState.y = this.y;
        this.moveState.left = true;
        this.moveState.right = false;
        this.moveState.up = false;
        this.socket.emit('updatePlayer', this.moveState);
      }
    }

    // player moves right
    else if (cursors.right.isDown) {
      if (this.facingLeft) {
        this.flipX = !this.flipX;
        this.facingLeft = false;
      }
      this.setVelocityX(250);

      if (this.body.onFloor()) {
        this.play(`run_${this.spriteKey}`, true);
      }

      if (this.socket) {
        this.moveState.x = this.x;
        this.moveState.y = this.y;
        this.moveState.left = false;
        this.moveState.right = true;
        this.moveState.up = false;
        this.socket.emit('updatePlayer', this.moveState);
      }
    }

    // neutral (player not moving)
    else {
      this.setVelocityX(0);
      this.play(`idle_${this.spriteKey}`, true);
      if (this.socket) {
        this.moveState.x = this.x;
        this.moveState.y = this.y;
        this.moveState.left = false;
        this.moveState.right = false;
        this.moveState.up = false;
        this.socket.emit('updatePlayer', this.moveState); // might want to broadcast movement only if the moveState is updated...
      }
    }
  }

  updateJump(cursors /*, jumpSound */) {
    if (cursors.up.isDown && this.body.onFloor()) {
      this.setVelocityY(-550);
      if (this.socket) {
        this.moveState.x = this.x;
        this.moveState.y = this.y;
        this.moveState.left = false;
        this.moveState.right = false;
        this.moveState.up = true;
        this.socket.emit('updatePlayer', this.moveState);
      }
      // jumpSound.play();
    }
  }

  updateInAir() {
    if (!this.body.onFloor()) {
      // this.anims.stop();
    }
  }

  // update opponents movements based on moveState player received from server
  updateOtherPlayer(moveState) {
    // opponent moves left
    if (moveState.left) {
      if (!this.facingLeft) {
        this.flipX = !this.flipX;
        this.facingLeft = true;
      }
      this.setVelocityX(-250);
      if (this.body.onFloor()) {
        this.play(`run_${this.spriteKey}`, true);
      }
      this.setPosition(moveState.x, moveState.y);
    }

    // opponent moves right
    else if (moveState.right) {
      if (this.facingLeft) {
        this.flipX = !this.flipX;
        this.facingLeft = false;
      }
      this.setVelocityX(250);

      if (this.body.onFloor()) {
        this.play(`run_${this.spriteKey}`, true);
      }
      this.setPosition(moveState.x, moveState.y);
    }

    // neutral (opponent not moving)
    else {
      this.setVelocityX(0);
      this.play(`idle_${this.spriteKey}`, true);
      this.setPosition(moveState.x, moveState.y);
    }
  }
}
