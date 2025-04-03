class FightScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScreen' });
        console.log("FightScreen constructor called");
    }
    
    preload() {
        console.log("FightScreen preload started");
        // Ensure the cat image is loaded
        this.load.image('catImage', 'assets/images/ui-elements/cat.png');
        console.log("FightScreen preload completed");
    }
    
    create() {
        console.log("FightScreen create started");
        // Set background color to match other screens
        this.cameras.main.setBackgroundColor('#2D2B3D');
        
        const { width, height } = this.sys.game.config;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Create floating particles for ambiance
        this.createParticles(width, height);
        
        // Add high score display in the middle top area
        const highScore = this.game.globals.highScore || 0;
        this.add.text(centerX, height * 0.2, `HI: ${highScore}`, {
            fontSize: '42px',
            fontFamily: '"Montserrat", sans-serif',
            color: '#ffffff',
            align: 'center',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        console.log("High score display created:", highScore);
        
        // Add cat in the center with enhanced visuals
        const cat = this.add.image(centerX, centerY, 'catImage');
        cat.setScale(0.3);
        
        // Add glow effect behind cat
        const glow = this.add.circle(centerX, centerY, 80, 0xFFFFFF, 0.3);
        glow.setDepth(cat.depth - 1);
        
        // Add floating animation to the cat
        this.tweens.add({
            targets: cat,
            y: cat.y + 15,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add scale animation to create breathing effect
        this.tweens.add({
            targets: cat,
            scaleX: cat.scaleX * 1.1,
            scaleY: cat.scaleY * 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Animate glow
        this.tweens.add({
            targets: glow,
            alpha: 0.5,
            scale: 1.2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add title text above cat
        const titleText = this.add.text(centerX, height * 0.35, 'SUMO CAT', {
            fontSize: '48px',
            fontFamily: '"Montserrat", sans-serif',
            color: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Add shine effect to title
        this.time.addEvent({
            delay: 3000,
            callback: () => this.addTextShine(titleText),
            callbackScope: this,
            loop: true
        });
        
        // Add "PRESS TO CONTINUE" text at the center
        const continueText = this.add.text(centerX, centerY + 150, 'PRESS TO CONTINUE', {
            fontSize: '24px',
            fontFamily: '"Montserrat", sans-serif',
            color: '#FAF3E3',
            align: 'center',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Add a pulsing animation to the text
        this.tweens.add({
            targets: continueText,
            alpha: 0.6,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        console.log("Adding pointer down listener to start Gameplay scene");
        
        // Add click/tap functionality to proceed to gameplay
        // Use once instead of on to prevent multiple transitions
        this.input.once('pointerdown', () => {
            console.log("Input detected, starting Gameplay scene");
            
            // Fade out effect
            this.cameras.main.fade(500, 0, 0, 0);
            
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Gameplay');
            });
        });
        
        // Fade in when starting
        this.cameras.main.fadeIn(1000);
        
        console.log("FightScreen create completed");
    }
    
    createParticles(width, height) {
        // Create floating particles
        const particles = this.add.particles('particle');
        particles.createEmitter({
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            scale: { start: 0.1, end: 0.05 },
            alpha: { start: 0.3, end: 0 },
            speed: 20,
            angle: { min: 0, max: 360 },
            lifespan: { min: 4000, max: 8000 },
            quantity: 1,
            frequency: 500,
            blendMode: 'ADD'
        });
    }
    
    addTextShine(textObject) {
        // Create a shine effect that moves across the text
        const shineEffect = this.add.rectangle(
            textObject.x - textObject.width,
            textObject.y,
            textObject.width * 0.3,
            textObject.height * 1.5,
            0xFFFFFF,
            0.7
        );
        
        shineEffect.setBlendMode(Phaser.BlendModes.ADD);
        shineEffect.setRotation(Math.PI / 4);
        
        this.tweens.add({
            targets: shineEffect,
            x: textObject.x + textObject.width,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                shineEffect.destroy();
            }
        });
    }
} 