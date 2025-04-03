class LoadingScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScreen' });
    }
    
    preload() {
        // Load any additional assets needed for the loading screen
        this.load.image('catImage', 'assets/images/ui-elements/cat.png');
    }
    
    create() {
        // Set background color to match the opening screen
        this.cameras.main.setBackgroundColor('#2D2B3D');
        
        const { width, height } = this.sys.game.config;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Add cat image in the center
        const cat = this.add.image(centerX, centerY, 'catImage');
        cat.setScale(0.5);
        
        // Add floating animation to the cat
        this.tweens.add({
            targets: cat,
            y: cat.y + 15,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add loading dots animation
        const loadingText = this.add.text(centerX, height * 0.7, 'Loading...', {
            fontSize: '28px',
            fontFamily: '"Poppins", sans-serif',
            color: '#ffffff',
            fontWeight: 800,
            stroke: '#ffffff',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        // Animate the dots
        let dots = 0;
        this.time.addEvent({
            delay: 300,
            callback: () => {
                dots = (dots + 1) % 4;
                loadingText.setText('Loading' + '.'.repeat(dots));
            },
            callbackScope: this,
            loop: true
        });
        
        // Add floating animation to the loading text, similar to the cat
        this.tweens.add({
            targets: loadingText,
            y: loadingText.y + 8,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // For now, we'll just go to the next screen after a delay
        this.time.delayedCall(2000, () => {
            this.scene.start('Gameplay');
        });
    }
} 