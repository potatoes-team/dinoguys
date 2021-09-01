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
    this.setCollideWorldBounds(this.scene.stageKey === 'WaitingScene');
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
    this.startFlyMode = this.startFlyMode.bind(this);
  }

  // move & animate player based on cursors pressed, and broadcast its movements to other players
  update(cursors /* , jumpSound */) {
    this.updateMovement(cursors);
    this.updateJump(cursors /*, jumpSound */);
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
      if (
        this.socket &&
        (this.moveState.left || this.moveState.right || this.moveState.up)
      ) {
        this.moveState.x = this.x;
        this.moveState.y = this.y;
        this.moveState.left = false;
        this.moveState.right = false;
        this.moveState.up = false;
        this.socket.emit('updatePlayer', this.moveState);
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

  respawn() {
    this.scene.hurt = true;
    this.setVelocity(0, 0);
    this.setX(this.scene.startPoint.x);
    this.setY(this.scene.startPoint.y - 80);
    this.play(`hurt_${this.scene.charSpriteKey}`, true);
    this.scene.time.addEvent({
      delay: 800,
      callback: () => {
        this.scene.hurt = false;
      },
    });
  }

  launchToAir() {
    this.body.setAllowGravity(false);
    this.setVelocity(0, 0);
    this.play(`idle_${this.spriteKey}`, true);
    // this.setAngle(this.flipX ? -20 : 20);
    this.scene.tweens.add({
      targets: this,
      y: '-=100',
      angle: this.flipX ? -20 : 20,
      ease: 'Sine.easeInOut',
      duration: 1000,
      onComplete: this.startFlyMode,
    });
  }

  startFlyMode() {
    this.isFlying = false;
    this.tween = this.scene.tweens.add({
      targets: this,
      y: '+=10',
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  fly(cursors) {
    const flySpeed = 250;
    const rotateAngle = 20;

    // player flies horizontally
    if (cursors.right.isDown) {
      this.setVelocityX(flySpeed);
      this.setAngle(rotateAngle);
      this.flipX = false;
      this.startMoving();
    } else if (cursors.left.isDown) {
      this.setVelocityX(-flySpeed);
      this.setAngle(-rotateAngle);
      this.flipX = true;
      this.startMoving();
    } else {
      this.setVelocityX(0);
    }

    // player flies up
    if (cursors.up.isDown) {
      this.setVelocityY(-flySpeed);
      this.startMoving();
    } else if (cursors.down.isDown) {
      this.setVelocityY(flySpeed);
      this.startMoving();
    } else {
      this.setVelocityY(0);
    }

    // player not flying at all
    if (
      !cursors.right.isDown &&
      !cursors.left.isDown &&
      !cursors.up.isDown &&
      !cursors.down.isDown
    ) {
      this.stopMoving();
    }
  }

  startMoving() {
    if (!this.isFlying) {
      this.tween.stop();
      this.isFlying = true;
      this.play(`run_${this.spriteKey}`, true);
    }
  }

  stopMoving() {
    if (this.isFlying) {
      this.tween.data[0].start = this.y;
      this.tween.restart();
      this.isFlying = false;
      this.play(`idle_${this.spriteKey}`, true);
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
