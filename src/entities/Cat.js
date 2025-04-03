class Cat extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'catImage');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Basic setup - scale handled by Gameplay scene now
        this.setScale(0.1875); // 25% smaller than original 0.25
        
        // Enhanced physics settings for smoother movement
        this.body.setDamping(true);
        this.body.setDrag(0.8, 0.8); // Slightly less drag for more fluid movement
        this.body.setBounce(0.3, 0.3); // More bounce for playful feel
        this.body.setMass(10.5); // Increased by 50% from 7 for more strength
        this.body.setCircle(this.width * 0.35); // Better collision circle
        
        // Movement properties
        this.moveSpeed = 380; // Slightly faster base speed
        this.lastPointerPosition = { x: x, y: y };
        this.movementThreshold = 5; // Minimum distance to trigger movement
        this.bounceTimer = null;
        this.lastBounceTime = 0;
        
        // Visual enhancements
        this.createShadow();
        this.createMovementTrail();
        this.createBounceDust();
        
        // Add subtle scale animation for "breathing" effect
        scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * 1.05,
            scaleY: this.scaleY * 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createShadow() {
        // Add shadow beneath cat
        this.shadow = this.scene.add.ellipse(
            this.x, 
            this.y + 15, 
            this.width * 0.7, 
            this.height * 0.3, 
            0x000000, 
            0.3
        );
        this.shadow.setDepth(this.depth - 1);
    }
    
    createMovementTrail() {
        // Add particle trail for movement
        this.trailParticles = this.scene.add.particles('catImage');
        this.trailEmitter = this.trailParticles.createEmitter({
            scale: { start: 0.04, end: 0.01 },
            alpha: { start: 0.3, end: 0 },
            speed: 30,
            lifespan: 400,
            blendMode: 'ADD',
            tint: 0xFFFFFF,
            on: false
        });
    }
    
    createBounceDust() {
        // Add dust particles for bouncing
        this.dustParticles = this.scene.add.particles('particle');
        this.dustEmitter = this.dustParticles.createEmitter({
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            speed: { min: 20, max: 60 },
            angle: { min: 0, max: 360 },
            lifespan: 600,
            on: false,
            quantity: 8
        });
    }
    
    moveToward(targetX, targetY) {
        // Store the target position
        this.lastPointerPosition = { x: targetX, y: targetY };
        
        // Calculate direction to target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only move if target is beyond threshold distance
        if (distance > this.movementThreshold) {
            // Calculate normalized direction
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Get current speed and direction
            const currentSpeed = Math.sqrt(this.body.velocity.x * this.body.velocity.x + 
                                         this.body.velocity.y * this.body.velocity.y);
            const targetSpeed = this.moveSpeed;
            
            // Add small random variation to movement for organic feel
            const variationX = Phaser.Math.FloatBetween(-0.05, 0.05);
            const variationY = Phaser.Math.FloatBetween(-0.05, 0.05);
            
            // Blend current and target velocity with variation for smoother, more organic movement
            const blendFactor = 0.18; // Slightly more responsive
            
            // Apply blended velocity with spring physics
            this.body.velocity.x += ((dirX + variationX) * targetSpeed - this.body.velocity.x) * blendFactor;
            this.body.velocity.y += ((dirY + variationY) * targetSpeed - this.body.velocity.y) * blendFactor;
            
            // Apply slight squash and stretch based on acceleration
            const acceleration = Math.abs(this.body.velocity.x - this.body.prev.x) + 
                               Math.abs(this.body.velocity.y - this.body.prev.y);
            
            if (acceleration > 10) {
                // Calculate stretch direction
                const moveAngle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
                
                // Apply slight squash and stretch effect - using current scale as base
                const baseScale = 0.1875; // 25% smaller than original 0.25
                this.scaleX = baseScale * (1 + Math.cos(moveAngle) * 0.15);
                this.scaleY = baseScale * (1 + Math.sin(moveAngle) * 0.15);
                
                // Reset scale after a short delay
                if (this.scaleTween) this.scaleTween.stop();
                this.scaleTween = this.scene.tweens.add({
                    targets: this,
                    scaleX: baseScale,
                    scaleY: baseScale,
                    duration: 200,
                    ease: 'Back.out'
                });
            }
            
            // Rotate cat to face movement direction with slight lag for smoother feel
            const angle = Math.atan2(dy, dx);
            const rotationSpeed = 0.15; // How quickly to turn
            
            // Calculate shortest rotation path
            let angleDiff = angle - this.rotation;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // Apply smooth rotation
            this.rotation += angleDiff * rotationSpeed;
            
            // Activate the trail particles when moving fast
            if (currentSpeed > 50) {
                this.trailEmitter.setPosition(this.x, this.y);
                this.trailEmitter.on = true;
            }
            
            // Add bounce effect on direction change
            const now = this.scene.time.now;
            if (now - this.lastBounceTime > 500 && acceleration > 30) {
                this.lastBounceTime = now;
                this.addBounceEffect();
            }
        }
    }
    
    addBounceEffect() {
        // Create a small impact effect
        this.dustEmitter.setPosition(this.x, this.y + 15);
        this.dustEmitter.explode();
        
        // Add a small camera shake
        this.scene.cameras.main.shake(50, 0.003);
        
        // Add a small scale bounce
        const baseScale = 0.1875; // 25% smaller than original 0.25
        this.scene.tweens.add({
            targets: this,
            scaleX: baseScale * 1.2, // 0.225
            scaleY: baseScale * 0.8, // 0.15
            duration: 50,
            yoyo: true,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // Then bounce back with spring effect
                this.scene.tweens.add({
                    targets: this,
                    scaleX: baseScale,
                    scaleY: baseScale,
                    duration: 200,
                    ease: 'Back.out(1.5)'
                });
            }
        });
    }
    
    update() {
        // Update shadow position
        if (this.shadow) {
            this.shadow.x = this.x;
            this.shadow.y = this.y + 15;
        }
        
        // Update trail particles
        if (this.trailEmitter) {
            // Only emit particles when moving fast enough
            const speed = Math.sqrt(this.body.velocity.x * this.body.velocity.x + 
                                   this.body.velocity.y * this.body.velocity.y);
                                   
            if (speed > 50) {
                this.trailEmitter.setPosition(this.x, this.y);
                // Vary particle count based on speed
                this.trailEmitter.setQuantity(Math.min(8, speed / 50));
                // Vary particle speed based on cat speed
                this.trailEmitter.setSpeed(Math.min(50, speed * 0.3));
            } else {
                this.trailEmitter.on = false;
            }
            
            // Spin the cat a bit when sliding but not actively moving
            if (!this.scene.catIsActive && speed > 30) {
                this.rotation += 0.05; // Add a fun spin effect when sliding
                
                // Add occasional dust particles when sliding
                if (Phaser.Math.Between(0, 20) === 0) {
                    this.dustEmitter.setPosition(this.x, this.y + 15);
                    this.dustEmitter.explode(Math.ceil(speed / 60));
                }
            }
        }
        
        // Add bounce effect when hitting the boundary
        if (this.body.blocked.up || this.body.blocked.down || 
            this.body.blocked.left || this.body.blocked.right) {
            this.addBounceEffect();
        }
    }
} 