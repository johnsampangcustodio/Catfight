class Gameplay extends Phaser.Scene {
    constructor() {
        super({ key: 'Gameplay' });
        this.score = 0;
        this.dogs = [];
        this.spawnTimer = null;
        this.isGameActive = true;
        this.ellipseBounds = null;
        this.invulnerable = true; // Player starts invulnerable
        this.invulnerabilityTimer = null;
        this.catIsActive = false;
        this.difficultyTimer = null;
        this.dogSpeedMultiplier = 1.0;
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboText = null;
        this.lives = 3;
    }
    
    preload() {
        console.log("Gameplay scene preload started");
        // Load necessary assets
        this.load.image('catImage', 'assets/images/ui-elements/cat.png');
        this.load.image('dog', 'assets/images/ui-elements/dog.png');
        this.load.image('particle', 'assets/images/ui-elements/particle.png');
        this.load.image('confetti', 'assets/images/ui-elements/particle.png');
        
        // Load sound effects
        this.load.audio('hit', 'assets/audio/hit.mp3');
        this.load.audio('dogOut', 'assets/audio/dogOut.mp3');
        this.load.audio('loseLife', 'assets/audio/loseLife.mp3');
        this.load.audio('score', 'assets/audio/score.mp3');
        console.log("Gameplay scene preload completed");
    }
    
    create() {
        console.log("Gameplay scene create method started");
        
        // Create nice background with gradient
        this.createBackground();
        
        const { width, height } = this.sys.game.config;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Create the arena with visual enhancements
        this.createArena(centerX, centerY, width * 0.7, height * 0.55);
        
        // Create visual elements for atmosphere
        this.createVisualElements(width, height);
        
        // Create the cat player
        this.cat = new Cat(this, centerX, centerY);
        console.log("Cat created at position:", centerX, centerY);
        
        // Track if cat is user-controlled (actively moving)
        this.catIsActive = false;
        
        // Keep track of lives internally instead of using LifeDisplay
        this.lives = 3;
        
        // Create score display at the top with animation
        this.createEnhancedScoreDisplay(centerX, height);
        
        // Add combo counter
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboText = this.add.text(centerX, height * 0.12, '', {
            fontSize: '24px',
            fontFamily: '"Montserrat", sans-serif',
            color: '#2D2B3D',
            fontWeight: 'bold'
        }).setOrigin(0.5).setAlpha(0);
        
        // Simple input handling
        this.setupInputHandling();
        
        // Start spawning dogs after a delay
        this.time.delayedCall(3000, () => {
            console.log("Starting dog spawning");
            this.startDogSpawning();
        });
        
        // Setup brief invulnerability at start
        this.makePlayerInvulnerable(1000);
        
        // Create entrance animation for cat
        this.createEntranceAnimation();
        
        // Setup collisions between cat and dogs
        this.physics.add.collider(this.cat, this.dogs, this.handleCatDogCollision, null, this);
        
        // Increase dog speed slightly over time
        this.setupDifficultyProgression();

        console.log("Gameplay scene create method completed");
    }
    
    createBackground() {
        const { width, height } = this.sys.game.config;
        
        // Create gradient background
        const bgGradient = this.add.graphics();
        bgGradient.fillGradientStyle(0xFCF5E5, 0xFCF5E5, 0xF6EBD6, 0xF6EBD6, 1);
        bgGradient.fillRect(0, 0, width, height);
        
        // Add some decorative elements
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(3, 8);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
            
            const dot = this.add.circle(x, y, size, 0x2D2B3D, alpha);
            
            // Add subtle animation
            this.tweens.add({
                targets: dot,
                alpha: alpha - 0.1,
                scale: 1.2,
                duration: Phaser.Math.Between(2000, 5000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    createArena(centerX, centerY, width, height) {
        // Create sumo ring container with depth layers
        const ringContainer = this.add.container(centerX, centerY);
        
        // Outer shadow (larger than the actual ring)
        const outerShadow = this.add.ellipse(0, 0, width * 1.05, height * 1.05, 0x000000, 0.2);
        outerShadow.setDepth(0);
        ringContainer.add(outerShadow);
        
        // Main ring background - clean simple design
        const mainRing = this.add.ellipse(0, 0, width, height, 0xF9EFD9);
        mainRing.setStrokeStyle(2, 0x2D2B3D, 1);
        mainRing.setDepth(1);
        ringContainer.add(mainRing);
        
        // Subtle inner circle
        const innerCircle = this.add.ellipse(0, 0, width * 0.65, height * 0.65, 0xF2DFB9, 0.5);
        innerCircle.setDepth(1);
        ringContainer.add(innerCircle);
        
        // Add minimalist center mark
        const centerMark = this.add.circle(0, 0, 15, 0x2D2B3D, 0.1);
        centerMark.setStrokeStyle(1, 0x2D2B3D, 0.5);
        centerMark.setDepth(1);
        ringContainer.add(centerMark);
        
        // Add a subtle glow effect
        const glow = this.add.ellipse(0, 0, width * 1.02, height * 1.02, 0xFFFFFF, 0.1);
        glow.setDepth(0);
        ringContainer.add(glow);
        
        // Subtle animation for the glow
        this.tweens.add({
            targets: glow,
            scaleX: 1.03,
            scaleY: 1.03,
            alpha: 0.05,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Store ellipse bounds for collision checking
        this.ellipseBounds = {
            x: centerX,
            y: centerY,
            radiusX: width / 2,
            radiusY: height / 2
        };
        
        // Add very subtle bounce animation to the ring
        this.tweens.add({
            targets: ringContainer,
            scaleX: 1.005,
            scaleY: 1.005,
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createRingShineEffect() {
        const { radiusX, radiusY, x, y } = this.ellipseBounds;
        const startAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const arcSize = Phaser.Math.FloatBetween(0.3, 0.7);
        
        const shineGraphics = this.add.graphics();
        shineGraphics.lineStyle(3, 0xFFFFFF, 0.3);
        shineGraphics.beginPath();
        shineGraphics.arc(x, y, radiusX * 0.99, startAngle, startAngle + arcSize);
        shineGraphics.strokePath();
        
        // Animate the shine and then remove it
        this.tweens.add({
            targets: shineGraphics,
            alpha: 0,
            duration: 2000,
            ease: 'Sine.easeOut',
            onComplete: () => {
                shineGraphics.destroy();
            }
        });
    }
    
    createVisualElements(width, height) {
        // Create some decorative elements outside the ring
        const decorCount = 8;
        for (let i = 0; i < decorCount; i++) {
            const angle = (i / decorCount) * Math.PI * 2;
            const distance = Math.max(width, height) * 0.6;
            const x = width/2 + Math.cos(angle) * distance;
            const y = height/2 + Math.sin(angle) * distance;
            
            // Create circular decoration
            const circle = this.add.circle(x, y, Phaser.Math.Between(10, 25), 0x2D2B3D, 0.2);
            
            // Add subtle animation
            this.tweens.add({
                targets: circle,
                scale: 1.2,
                duration: 3000 + i * 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    createEnhancedScoreDisplay(centerX, height) {
        // Create score display at the top
        this.scoreDisplay = new ScoreDisplay(this, centerX, height * 0.05);
        this.scoreDisplay.scoreText.setFontFamily('"Montserrat", sans-serif');
        this.scoreDisplay.scoreText.setFontSize('32px');
        this.scoreDisplay.scoreText.setFontStyle('bold');
        this.scoreDisplay.scoreText.setText('SCORE : 0');
        
        // Add glow effect to score
        const scoreGlow = this.add.graphics();
        this.scoreGlow = scoreGlow;
    }
    
    setupInputHandling() {
        this.input.on('pointerdown', (pointer) => {
            if (this.isGameActive) {
                console.log("Pointer down at:", pointer.x, pointer.y);
                this.cat.moveToward(pointer.x, pointer.y);
                this.catIsActive = true;
                
                // Reset active state after a short delay
                this.time.delayedCall(300, () => {
                    this.catIsActive = false;
                });
            } else {
                console.log("Pointer down ignored - game not active");
            }
        });
        
        // Continuous movement with pointer
        this.input.on('pointermove', (pointer) => {
            if (this.isGameActive && pointer.isDown) {
                this.cat.moveToward(pointer.x, pointer.y);
                this.catIsActive = true;
            }
        });
    }
    
    createEntranceAnimation() {
        const { width, height } = this.sys.game.config;
        
        // Create a spotlight effect first
        const spotlight = this.add.circle(width/2, height/2, 100, 0xFFFFFF, 0.3);
        spotlight.setBlendMode(Phaser.BlendModes.ADD);
        spotlight.setScale(0);
        
        // Grow the spotlight
        this.tweens.add({
            targets: spotlight,
            scale: 2,
            alpha: 0.5,
            duration: 800,
            ease: 'Quad.out'
        });
        
        // Start cat off-screen with dramatic entrance
        this.cat.y = height + 200;
        this.cat.alpha = 0;
        this.cat.setScale(0.1);
        
        // Animate entrance with shadow
        this.time.delayedCall(400, () => {
            // Cat shadow grows first as indicator
            if (this.cat.shadow) {
                this.cat.shadow.alpha = 0;
                this.cat.shadow.setScale(3);
                
                this.tweens.add({
                    targets: this.cat.shadow,
                    alpha: 0.5,
                    scale: 1,
                    duration: 600,
                    ease: 'Back.out'
                });
            }
            
            // Then cat leaps into the ring
            this.time.delayedCall(300, () => {
                this.tweens.add({
                    targets: this.cat,
                    y: height / 2,
                    alpha: 1,
                    scale: 0.25,
                    duration: 1000,
                    ease: 'Back.out(1.7)',
                    onComplete: () => {
                        // Create impact effect
                        const impact = this.add.circle(this.cat.x, this.cat.y + 20, 60, 0xFFFFFF, 0.7);
                        impact.setBlendMode(Phaser.BlendModes.ADD);
                        
                        // Create dust ring
                        const dustRing = this.add.circle(this.cat.x, this.cat.y, 80, 0xE5C89C, 0.7);
                        dustRing.setStrokeStyle(8, 0xE5C89C, 0.5);
                        
                        // Animate both effects
                        this.tweens.add({
                            targets: [impact, dustRing],
                            scale: 2,
                            alpha: 0,
                            duration: 700,
                            ease: 'Quad.out',
                            onComplete: () => {
                                impact.destroy();
                                dustRing.destroy();
                                spotlight.destroy();
                            }
                        });
                        
                        // Add bounce effect to the cat
                        this.cat.addBounceEffect();
                        
                        // Shake camera
                        this.cameras.main.shake(300, 0.015);
                        
                        // Add "FIGHT!" text that appears and fades
                        const fightText = this.add.text(width/2, height/2 - 100, 'FIGHT!', {
                            fontSize: '64px',
                            fontFamily: '"Montserrat", sans-serif',
                            color: '#2D2B3D',
                            fontWeight: 'bold',
                            stroke: '#FFFFFF',
                            strokeThickness: 6
                        }).setOrigin(0.5).setScale(0);
                        
                        // Animate the fight text
                        this.tweens.add({
                            targets: fightText,
                            scale: 1,
                            duration: 400,
                            ease: 'Back.out(1.8)',
                            onComplete: () => {
                                // Hold then fade
                                this.time.delayedCall(800, () => {
                                    this.tweens.add({
                                        targets: fightText,
                                        scale: 1.5,
                                        alpha: 0,
                                        duration: 500,
                                        ease: 'Quad.out',
                                        onComplete: () => fightText.destroy()
                                    });
                                });
                            }
                        });
                    }
                });
            });
        });
    }
    
    setupDifficultyProgression() {
        // Simple difficulty increase
        this.difficultyTimer = this.time.addEvent({
            delay: 15000, // 15 seconds
            callback: () => {
                if (this.dogSpeedMultiplier < 1.5) { // Cap maximum speed
                    this.dogSpeedMultiplier += 0.1;
                }
            },
            loop: true
        });
    }
    
    spawnDog(position, edgeFactor = null) {
        const { width, height } = this.sys.game.config;
        let x, y;
        
        // Calculate spawn points based on arena bounds
        const radiusX = this.ellipseBounds.radiusX;
        const radiusY = this.ellipseBounds.radiusY;
        const centerX = this.ellipseBounds.x;
        const centerY = this.ellipseBounds.y;
        
        // Adjust factors for spawn positions relative to the ellipse
        const topFactor = 0.85; // Closer to edge of arena (0 = center, 1 = edge)
        const bottomFactor = 0.85;
        const leftFactor = 0.85;
        const rightFactor = 0.85;
        
        switch(position) {
            case 'top':
                x = centerX;
                y = centerY - radiusY * (edgeFactor || topFactor);
                break;
            case 'right':
                x = centerX + radiusX * (edgeFactor || rightFactor);
                y = centerY;
                break;
            case 'bottom':
                x = centerX;
                y = centerY + radiusY * (edgeFactor || bottomFactor);
                break;
            case 'left':
                x = centerX - radiusX * (edgeFactor || leftFactor);
                y = centerY;
                break;
        }
        
        // Create the dog
        const dog = new Dog(this, x, y);
        
        // Random size variation - 25% smaller than original
        const randomScale = Phaser.Math.FloatBetween(0.1125, 0.1875);
        dog.setScale(randomScale);
        
        this.dogs.push(dog);
        
        // Setup physics
        this.physics.add.existing(dog);
        dog.body.setCollideWorldBounds(true);
        
        return dog;
    }
    
    startDogSpawning() {
        // Initial dogs - spawn with specific factors to place at arena edge
        this.spawnDog('top', 0.9);
        this.spawnDog('bottom', 0.9);
        
        // Spawn more dogs periodically
        this.spawnTimer = this.time.addEvent({
            delay: 3000, // 3 seconds between spawns
            callback: () => {
                if (this.isGameActive && this.dogs.length < 6) {
                    // Choose random spawn position
                    const positions = ['top', 'right', 'bottom', 'left'];
                    const randomPosition = positions[Phaser.Math.Between(0, 3)];
                    this.spawnDog(randomPosition);
                }
            },
            loop: true
        });
    }
    
    makePlayerInvulnerable(duration) {
        this.invulnerable = true;
        
        // Visual indicator - flash the cat
        this.invulnerabilityTimer = this.time.addEvent({
            delay: 150,
            callback: () => {
                this.cat.alpha = this.cat.alpha === 1 ? 0.5 : 1;
            },
            repeat: duration / 150 - 1
        });
        
        // End invulnerability after duration
        this.time.delayedCall(duration, () => {
            this.invulnerable = false;
            this.cat.alpha = 1; // Ensure visibility is reset
        });
    }
    
    handleCatDogCollision(cat, dog) {
        try {
            // Skip collision if player is invulnerable
            if (this.invulnerable) return;
            
            // Calculate direction from cat to dog
            const dirX = dog.x - cat.x;
            const dirY = dog.y - cat.y;
            
            // Normalize the direction
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            const normX = dirX / length;
            const normY = dirY / length;
            
            // Simple sumo mechanics - if cat is moving, it pushes the dog
            const catSpeed = Math.sqrt(cat.body.velocity.x * cat.body.velocity.x + cat.body.velocity.y * cat.body.velocity.y);
            
            if (catSpeed > 10) {
                // Play hit sound
                this.sound.play('hit', { volume: 0.4 });
                
                // Cat pushes dog with strong force
                dog.body.velocity.x = normX * 1200;
                dog.body.velocity.y = normY * 1200;
                
                // Add spin for visual effect
                dog.setAngularVelocity(300);
                
                // Minimal camera shake
                this.cameras.main.shake(50, 0.004);
                
                // Cat gets minimal recoil
                cat.body.velocity.x = -normX * 20;
                cat.body.velocity.y = -normY * 20;
                
                // Prevent overlap - push dog away from cat
                cat.x -= normX * 10;
                cat.y -= normY * 10;
                dog.x += normX * 30;
                dog.y += normY * 30;
            } else {
                // Dog pushes cat
                cat.body.velocity.x = normX * 150;
                cat.body.velocity.y = normY * 150;
                
                // Dogs get small recoil
                dog.body.velocity.x = -normX * 100;
                dog.body.velocity.y = -normY * 100;
                
                // Minimal camera effect
                this.cameras.main.shake(40, 0.003);
                
                // Prevent overlap - push cat away
                cat.x += normX * 10;
                cat.y += normY * 10;
                dog.x -= normX * 10;
                dog.y -= normY * 10;
                
                // End game immediately instead of using lives system
                        this.endGame();
                return;
            }
        } catch (error) {
            console.error("Error in handleCatDogCollision:", error);
        }
    }
    
    updateScore(points = 10, x = null, y = null) {
        // Update combo system
        this.comboCount++;
        
        // Clear existing combo timer if it exists
        if (this.comboTimer) {
            this.comboTimer.remove();
        }
        
        // Set combo timer to reset after 2 seconds of no points
        this.comboTimer = this.time.delayedCall(2000, () => {
            this.comboCount = 0;
            this.comboText.setAlpha(0);
        });
        
        // Apply combo bonus
        const comboBonus = Math.min(this.comboCount - 1, 10); // Cap at 10x bonus
        const totalPoints = points + comboBonus * 5;
        
        // Update and show combo text if combo is active
        if (this.comboCount > 1) {
            this.comboText.setText(`COMBO x${this.comboCount}!`);
            this.comboText.setAlpha(1);
            
            // Pulse effect on combo text
            this.tweens.add({
                targets: this.comboText,
                scale: 1.3,
                duration: 200,
                yoyo: true,
                ease: 'Back.out'
            });
        }
        
        // Update score
        this.score += totalPoints;
        this.scoreDisplay.updateScore(this.score);
        this.scoreDisplay.scoreText.setText(`SCORE : ${this.score}`);
        
        // Add glow effect to score
        this.tweens.add({
            targets: this.scoreDisplay.scoreText,
            scale: 1.1,
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeOut'
        });
        
        // Play score sound with slight pitch variation based on combo
        const pitchModifier = 1 + (this.comboCount * 0.05);
        this.sound.play('score', { 
            volume: 0.3,
            rate: Math.min(pitchModifier, 1.5)
        });
        
        // Show floating score text if coordinates provided
        if (x !== null && y !== null) {
            // Show points with combo bonus notation
            let pointText = `+${points}`;
            if (comboBonus > 0) {
                pointText = `+${points} +${comboBonus * 5}`;
            }
            
            const scoreText = this.add.text(x, y, pointText, {
                fontSize: '24px',
                fontFamily: '"Montserrat", sans-serif',
                color: '#2D2B3D',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            
            // Add floating animation
            this.tweens.add({
                targets: scoreText,
                y: y - 70,
                alpha: 0,
                scale: 1.5,
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    scoreText.destroy();
                }
            });
            
            // Add confetti particles for higher combos
            if (this.comboCount > 2) {
                const particles = this.add.particles('confetti');
                const emitter = particles.createEmitter({
                    x: x,
                    y: y,
                    speed: { min: 50, max: 150 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 0.1, end: 0 },
                    lifespan: 1000,
                    quantity: this.comboCount * 2,
                    blendMode: 'ADD'
                });
                
                // Stop emitting after a short time
                this.time.delayedCall(300, () => {
                    emitter.stop();
                    // Clean up particles after they're done
                    this.time.delayedCall(1000, () => {
                        particles.destroy();
                    });
                });
            }
        }
    }
    
    endGame() {
        // Make sure we only end the game once
        if (!this.isGameActive) {
            console.log("endGame called but game is already inactive");
            return;
        }
        
        console.log("Game over! Setting up end game state");
        this.isGameActive = false;
        
        try {
            // Clear all input listeners - but keep the basic input system intact
            this.input.off('pointerdown');
            this.input.off('pointermove');
            console.log("Input listeners cleared");
            
            // Stop the cat movement and physics
            if (this.cat && this.cat.body) {
                this.cat.body.setVelocity(0, 0);
                this.cat.body.setAcceleration(0, 0);
                console.log("Cat movement stopped");
            } else {
                console.log("Warning: Cat or cat.body is null/undefined");
            }
            
            // Display game over message
            const { width, height } = this.sys.game.config;
            
            // Create game over text
            const gameOverText = this.add.text(width/2, height/2, 'GAME OVER', {
                fontSize: '48px',
                fontFamily: '"Montserrat", sans-serif',
                color: '#2D2B3D',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            
            // Add animation
            this.tweens.add({
                targets: gameOverText,
                scale: 1.2,
                duration: 500,
                yoyo: true,
                repeat: 1
            });
            
            // Save high score
            if (this.score > this.game.globals.highScore) {
                this.game.globals.highScore = this.score;
                localStorage.setItem('catfightHighScore', this.score);
                console.log("New high score saved:", this.score);
                
                // Display new high score
                this.add.text(width/2, height/2 + 60, 'NEW HIGH SCORE!', {
                    fontSize: '32px',
                    fontFamily: '"Montserrat", sans-serif',
                    color: '#2D2B3D',
                    fontWeight: 'bold'
                }).setOrigin(0.5);
            }
            
            // Show final score
            this.add.text(width/2, height/2 + 120, `SCORE: ${this.score}`, {
                fontSize: '36px',
                fontFamily: '"Montserrat", sans-serif',
                color: '#2D2B3D',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            
            // Add tap to restart message
            const restartText = this.add.text(width/2, height - 100, 'Tap to play again', {
                fontSize: '24px',
                fontFamily: '"Montserrat", sans-serif',
                color: '#2D2B3D'
            }).setOrigin(0.5);
            
            // Make it blink
            this.tweens.add({
                targets: restartText,
                alpha: 0.5,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
            
            // Clean up all dogs
            console.log("Cleaning up dogs, count:", this.dogs.length);
            this.dogs.forEach((dog, index) => {
                if (dog && dog.active) {
                    console.log(`Destroying dog ${index}`);
                    dog.destroy();
                }
            });
            this.dogs = [];
            
            // Stop all timers
            if (this.spawnTimer) {
                this.spawnTimer.remove();
                console.log("Spawn timer stopped");
            }
            if (this.difficultyTimer) {
                this.difficultyTimer.remove();
                console.log("Difficulty timer stopped");
            }
            if (this.invulnerabilityTimer) {
                this.invulnerabilityTimer.remove();
                console.log("Invulnerability timer stopped");
            }
            
            // Disable physics for the cat
            if (this.cat && this.cat.body) {
                this.physics.world.disable(this.cat);
                console.log("Cat physics disabled");
            }
            
            // Reset any pending callbacks
            const pendingCallbacks = this.time.removeAllEvents();
            console.log(`All time events removed: ${pendingCallbacks} pending callbacks`);
            
            // Simple restart mechanism - refresh the entire website
            this.time.delayedCall(1500, () => {
                // Add a one-time click event to restart
                this.input.once('pointerdown', () => {
                    console.log("Game over - refreshing website");
                    window.location.reload();
                });
            });
        } catch (error) {
            console.error("Critical error in endGame:", error);
        }
    }
    
    update() {
        if (!this.isGameActive) return;
        
        try {
            // Update cat only if actively moving
            if (this.catIsActive) {
            this.cat.update();
            } else {
                // When not actively being controlled, gradually slow down
                if (this.cat && this.cat.body) {
                    // Apply more drag when not actively moving
                    this.cat.body.velocity.x *= 0.95;
                    this.cat.body.velocity.y *= 0.95;
                    
                    // Stop completely if moving very slowly
                    if (Math.abs(this.cat.body.velocity.x) < 5 && Math.abs(this.cat.body.velocity.y) < 5) {
                        this.cat.body.velocity.x = 0;
                        this.cat.body.velocity.y = 0;
                    }
                }
            }
            
            // Prevent cat from leaving the arena
            if (this.cat && this.ellipseBounds) {
                // Calculate where the cat is relative to the center of the ellipse
                const dx = (this.cat.x - this.ellipseBounds.x) / this.ellipseBounds.radiusX;
                const dy = (this.cat.y - this.ellipseBounds.y) / this.ellipseBounds.radiusY;
                const distanceSquared = dx * dx + dy * dy;
                
                // If cat is too close to or outside the boundary
                if (distanceSquared > 0.85) {
                    // Calculate normalized direction toward center
                    const angle = Math.atan2(dy, dx);
                    const pushForce = Math.min(distanceSquared - 0.85, 0.2) * 100;
                    
                    // Push cat back toward center with a force proportional to how far out it is
                    if (this.cat.body) {
                        this.cat.body.velocity.x -= Math.cos(angle) * pushForce;
                        this.cat.body.velocity.y -= Math.sin(angle) * pushForce;
                    }
                }
                
                // Hard boundary - if cat somehow gets completely outside
                if (this.isOutsideEllipse(this.cat)) {
                    // Play life lost sound
                    this.sound.play('loseLife', { volume: 0.4 });
                    
                    // End game immediately
                    this.endGame();
                    return;
                }
            }
            
            // Update dogs and check for ring-outs
            const dogsToRemove = [];
            
            for (let i = 0; i < this.dogs.length; i++) {
                const dog = this.dogs[i];
                
                // Skip dogs being removed
                if (!dog || !dog.active || dog.isBeingRemoved) continue;
                
                // Apply chase behavior
                const baseSpeed = dog.moveSpeed;
                dog.chaseCat(this.cat, baseSpeed * this.dogSpeedMultiplier);
                dog.update();
                
                // Check if dog is outside the ring
                if (this.isOutsideEllipse(dog)) {
                    // Add score for pushing dog out
                    this.updateScore(25, dog.x, dog.y);
                    
                    // Queue dog for removal
                    dogsToRemove.push(dog);
                }
                
                // Check for overlap with cat (outside collision system)
                const dx = dog.x - this.cat.x;
                const dy = dog.y - this.cat.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = (dog.width * dog.scaleX + this.cat.width * this.cat.scaleX) * 0.4;
                
                // If they're too close, push them apart
                if (distance < minDistance && !this.invulnerable) {
                    const pushScale = (minDistance - distance) / minDistance;
                    const pushX = dx * pushScale;
                    const pushY = dy * pushScale;
                    
                    // Push dog away
                    dog.x += pushX * 1.5;
                    dog.y += pushY * 1.5;
                }
            }
            
            // Remove dogs that left the ring
            dogsToRemove.forEach(dog => {
                if (dog && !dog.isBeingRemoved) {
                this.removeDog(dog);
                }
            });
        } catch (error) {
            console.error("Error in update:", error);
        }
    }
    
    createRespawnEffect(x, y) {
        // Simple respawn circle
        const respawnCircle = this.add.circle(x, y, 30, 0xFFFFFF, 0.5);
        
        // Animation for respawn effect
        this.tweens.add({
            targets: respawnCircle,
            scale: 0,
            alpha: 0,
            duration: 500,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                respawnCircle.destroy();
            }
        });
    }
    
    isOutsideEllipse(sprite) {
        // Check if sprite is outside elliptical boundary
        const dx = (sprite.x - this.ellipseBounds.x) / this.ellipseBounds.radiusX;
        const dy = (sprite.y - this.ellipseBounds.y) / this.ellipseBounds.radiusY;
        return (dx * dx + dy * dy) > 1;
    }
    
    removeDog(dog) {
        // Mark dog as being removed to prevent multiple removal attempts
        if (dog.isBeingRemoved) return;
        dog.isBeingRemoved = true;
        
        // Make the dog appear defeated
        dog.setTint(0x999999);
        
        // Play sound effect
        this.sound.play('dogOut', { volume: 0.4 });
        
        // Create flying text effect with bigger, more dynamic styling
        const flyText = this.add.text(dog.x, dog.y - 20, 'OUT!', {
            fontSize: '24px',
            fontFamily: '"Montserrat", sans-serif',
            color: '#2D2B3D',
            fontWeight: 'bold',
            stroke: '#FFFFFF',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Animate the OUT text with more dynamic movement
        this.tweens.add({
            targets: flyText,
            y: dog.y - 100,
            alpha: 0,
            scale: 2,
            rotation: Phaser.Math.FloatBetween(-0.2, 0.2),
            duration: 1200,
            ease: 'Back.easeOut',
            onComplete: () => {
                flyText.destroy();
            }
        });
        
        // Create impact shockwave
        const shockwave = this.add.circle(dog.x, dog.y, 10, 0xFFFFFF, 0.7);
        this.tweens.add({
            targets: shockwave,
            scale: 10,
            alpha: 0,
            duration: 800,
            ease: 'Quad.out',
            onComplete: () => {
                shockwave.destroy();
            }
        });
        
        // Add spin and bounce effect to the dog - more exaggerated
        this.tweens.add({
            targets: dog,
            angle: dog.angle + Phaser.Math.Between(-720, 720), // More spins
            y: dog.y - 30, // Add some lift
            duration: 600,
            ease: 'Quad.out',
            onComplete: () => {
                // Add falling effect
                this.tweens.add({
                    targets: dog,
                    y: dog.y + 100,
                    duration: 400,
                    ease: 'Bounce.In'
                });
            }
        });
        
        // Wait exactly 1 second before fading out
        this.time.delayedCall(1000, () => {
            // Create a more spectacular particle explosion
            const particles = this.add.particles('particle');
            
            // Add a tinted ring of particles
            particles.createEmitter({
                x: dog.x,
                y: dog.y,
                speed: { min: 40, max: 180 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.1, end: 0 },
                tint: [ 0xFFFFFF, 0x999999, 0xCCCCCC ],
                lifespan: 800,
                quantity: 30,
                blendMode: 'ADD'
            });
            
            // Add a second emitter for sparkles
            particles.createEmitter({
                x: dog.x,
                y: dog.y,
                speed: { min: 60, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.05, end: 0 },
                tint: 0xFFFFFF,
                lifespan: 1000,
                quantity: 15,
                blendMode: 'ADD'
            });
            
            // Add small shake to the camera
            this.cameras.main.shake(100, 0.008);
            
            // Simple fadeout animation with rotation and shrinking
        this.tweens.add({
            targets: dog,
            alpha: 0,
                scale: 0,
                angle: dog.angle + 180,
            duration: 300,
                ease: 'Back.easeIn',
            onComplete: () => {
                // Remove dog from array
                const index = this.dogs.indexOf(dog);
                if (index > -1) {
                    this.dogs.splice(index, 1);
                }
                
                // Destroy the dog sprite
                dog.destroy();
                    
                    // Clean up particles after they're done
                    this.time.delayedCall(1000, () => {
                        particles.destroy();
                    });
                }
            });
        });
    }

    // Replace the references to lifeDisplay.loseLife() with our own life management
    loseLife() {
        this.lives--;
        console.log("Life lost. Remaining lives:", this.lives);
        
        // Add a visual flash indicator when losing a life
        this.cameras.main.flash(300, 255, 0, 0, 0.3);
        
        return this.lives;
    }
} 