class LifeDisplay {
    constructor(scene, x, y, startingLives = 3) {
        this.scene = scene;
        this.lives = startingLives;
        this.lifeCircles = [];
        this.circleRadius = 25;
        this.spacing = 80;
        this.pulseTweens = [];
        
        // Create life circles
        this.createLifeCircles(x, y);
    }
    
    // Create visual representation of lives as circles
    createLifeCircles(x, y) {
        for (let i = 0; i < this.lives; i++) {
            // Create a container for each life indicator
            const container = this.scene.add.container(x, y + (i * this.spacing));
            
            // Add glow effect behind the circle
            const glow = this.scene.add.circle(0, 0, this.circleRadius * 1.5, 0x4D4B5D, 0.3);
            
            // Create the main circle
            const circle = this.scene.add.circle(0, 0, this.circleRadius, 0x2D2B3D);
            
            // Add inner highlight
            const highlight = this.scene.add.circle(
                -this.circleRadius * 0.3, 
                -this.circleRadius * 0.3, 
                this.circleRadius * 0.3, 
                0xFFFFFF, 
                0.4
            );
            
            // Add all elements to the container
            container.add(glow);
            container.add(circle);
            container.add(highlight);
            
            // Add pulsing animation
            const pulseTween = this.scene.tweens.add({
                targets: container,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 1500 + (i * 300), // Staggered timing
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Add a second subtle animation for the glow
            this.scene.tweens.add({
                targets: glow,
                alpha: 0.5,
                scale: 1.2,
                duration: 2000 + (i * 400), // Different timing for variety
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Store the container and tween
            this.lifeCircles.push(container);
            this.pulseTweens.push(pulseTween);
        }
    }
    
    // Update the lives display
    updateLives(lives) {
        // Remove extra circles if lives decreased
        while (this.lifeCircles.length > lives) {
            const container = this.lifeCircles.pop();
            const tween = this.pulseTweens.pop();
            
            // Stop the tween
            if (tween) tween.stop();
            
            // Create explosion effect
            this.createExplosionEffect(container.x, container.y);
            
            // Destroy the container with animation
            this.scene.tweens.add({
                targets: container,
                scale: 0,
                alpha: 0,
                duration: 300,
                ease: 'Back.easeIn',
                onComplete: () => {
                    container.destroy();
                }
            });
        }
        
        // Add circles if lives increased
        const x = this.lifeCircles.length > 0 ? this.lifeCircles[0].x : 40;
        const startY = this.lifeCircles.length > 0 ? 
            this.lifeCircles[0].y : 
            this.scene.sys.game.config.height * 0.2;
            
        while (this.lifeCircles.length < lives) {
            const index = this.lifeCircles.length;
            
            // Create a container for the new life
            const container = this.scene.add.container(x, startY + (index * this.spacing));
            container.setScale(0); // Start small for grow animation
            
            // Add glow effect
            const glow = this.scene.add.circle(0, 0, this.circleRadius * 1.5, 0x4D4B5D, 0.3);
            
            // Create the main circle
            const circle = this.scene.add.circle(0, 0, this.circleRadius, 0x2D2B3D);
            
            // Add inner highlight
            const highlight = this.scene.add.circle(
                -this.circleRadius * 0.3, 
                -this.circleRadius * 0.3, 
                this.circleRadius * 0.3, 
                0xFFFFFF, 
                0.4
            );
            
            // Add all elements to the container
            container.add(glow);
            container.add(circle);
            container.add(highlight);
            
            // Grow animation for new life
            this.scene.tweens.add({
                targets: container,
                scale: 1,
                duration: 400,
                ease: 'Back.easeOut'
            });
            
            // Add pulsing animation after grow animation
            const pulseTween = this.scene.tweens.add({
                targets: container,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 1500 + (index * 300),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: 400 // Wait for grow animation
            });
            
            // Add glow animation
            this.scene.tweens.add({
                targets: glow,
                alpha: 0.5,
                scale: 1.2,
                duration: 2000 + (index * 400),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: 400
            });
            
            // Store the container and tween
            this.lifeCircles.push(container);
            this.pulseTweens.push(pulseTween);
        }
        
        this.lives = lives;
        return this.lives;
    }
    
    // Create an explosion effect when losing a life
    createExplosionEffect(x, y) {
        // Create particles for explosion
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.1, end: 0 },
            tint: 0xFF0000, // Red tint for losing life
            lifespan: 600,
            quantity: 20
        });
        
        // Stop emitting after a short time
        this.scene.time.delayedCall(100, () => {
            emitter.stop();
            
            // Clean up particles after they're done
            this.scene.time.delayedCall(600, () => {
                particles.destroy();
            });
        });
    }
    
    // Remove one life
    loseLife() {
        if (this.lives > 0) {
            const container = this.lifeCircles[this.lifeCircles.length - 1];
            
            // Create explosion effect
            if (container) {
                this.createExplosionEffect(container.x, container.y);
                
                // Stop the tween
                const tween = this.pulseTweens.pop();
                if (tween) tween.stop();
                
                // Animate the circle disappearing
                this.scene.tweens.add({
                    targets: container,
                    scale: 0,
                    alpha: 0,
                    duration: 300,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        container.destroy();
                        this.lifeCircles.pop();
                    }
                });
            }
            
            this.lives--;
        }
        
        return this.lives;
    }
    
    // Set visibility of the life display
    setVisible(visible) {
        this.lifeCircles.forEach(container => {
            container.setVisible(visible);
        });
    }
} 