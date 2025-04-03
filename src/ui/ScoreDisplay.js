class ScoreDisplay {
    constructor(scene, x, y) {
        this.scene = scene;
        this.score = 0;
        this.highScore = scene.game.globals.highScore || 0;
        
        // Create the score text with modern styling
        this.scoreText = scene.add.text(x, y, 'SCORE : 0', {
            fontSize: '32px',
            fontFamily: '"Montserrat", sans-serif',
            color: '#2D2B3D',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    // Update the score display
    updateScore(score) {
        this.score = score;
        this.scoreText.setText(`SCORE : ${score}`);
    }
    
    // Set visibility of the score display
    setVisible(visible) {
        this.scoreText.setVisible(visible);
    }
} 