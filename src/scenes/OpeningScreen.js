class OpeningScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'OpeningScreen' });
    }
    
    preload() {
        // Use a different key name to avoid conflict with the Cat class
        this.load.image('catImage', 'assets/images/ui-elements/cat.png');
        
        // Also load with 'cat' key for the Cat class
        this.load.image('cat', 'assets/images/ui-elements/cat.png');
        
        // Load Google Fonts
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }
    
    create() {
        // Load modern fonts
        this.loadFonts();
        
        // Set game to portrait mode
        const { width, height } = this.sys.game.config;
        
        // Set dark purple background
        this.cameras.main.setBackgroundColor('#2D2B3D');
        
        // Add high score display in the top right
        const highScore = this.game.globals.highScore || 0;
        this.add.text(width - 50, 70, `HI : ${highScore}`, {
            fontSize: '40px',
            fontFamily: '"Montserrat", sans-serif',
            color: '#ffffff',
            align: 'right',
            fontWeight: 'bold'
        }).setOrigin(1, 0.5);
        
        // Add cat image in the top-left portion, matching the screenshot
        const cat = this.add.image(width * 0.015, height * 0.4, 'catImage');
        cat.setScale(1.25);
        // Rotate the cat to face right
        cat.setAngle(25);
        
        // Make the cat animation more subtle
        this.tweens.add({
            targets: cat,
            y: cat.y + 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
            
        // Use a rounded rectangle for the CATFIGHT button, placed more toward bottom center
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = 200;
        const buttonY = 500; // Move button closer to cat
        
        // Create button with the light purple color and rounded corners
        const button = this.add.graphics();
        button.fillStyle(0xC2C1D1, 1); // Light purple color like in the mockup
        button.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 55);
        
        // Add "CATFIGHT" text with gray color
        const catfightText = this.add.text(buttonX, buttonY, 'CATFIGHT', {
            fontSize: '36px',
            fontFamily: '"Raleway", sans-serif',
            color: '#4A4A6A', // Dark gray text
            align: 'center',
            fontWeight: 'bold',
            letterSpacing: 3
        }).setOrigin(0.5);
        
        // Add floating animation to the button (same as cat)
        this.tweens.add({
            targets: [button, catfightText],
            y: '+=10', // Move up and down by 10px
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Make button interactive
        const buttonZone = this.add.zone(buttonX, buttonY, buttonWidth, buttonHeight)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Gameplay');
            })
            .on('pointerover', () => {
                button.clear();
                button.fillStyle(0xD0D0E0, 1); // Lighter on hover
                button.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 55);
            })
            .on('pointerout', () => {
                button.clear();
                button.fillStyle(0xC2C1D1, 1); // Back to normal
                button.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 55);
            });
    }
    
    loadFonts() {
        // Use WebFont to load modern fonts
        if (window.WebFont) {
            window.WebFont.load({
                google: {
                    families: ['Montserrat:700', 'Poppins:400,600', 'Raleway:600']
                }
            });
        }
    }
} 