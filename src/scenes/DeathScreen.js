class DeathScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'DeathScreen' });
    }
    
    create() {
        // This will be implemented later
        // For now, just a placeholder
        const { width, height } = this.sys.game.config;
        
        this.add.text(width/2, height/2, 'Death Screen - Coming soon', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Return to opening screen when clicked
        this.input.on('pointerdown', () => {
            this.scene.start('OpeningScreen');
        });
    }
} 