// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 390, // iPhone 13/14 width
    height: 844, // iPhone 13/14 height
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        orientation: Phaser.Scale.PORTRAIT
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        OpeningScreen,
        LoadingScreen,
        Gameplay,
        DeathScreen
    ]
};

// Create the game instance
const game = new Phaser.Game(config);

// Add global error handler for debugging
game.events.on('error', (error) => {
    console.error('Phaser Game Error:', error);
});

// Add scene transition logging
game.events.on('scenestart', (scene) => {
    console.log(`Scene started: ${scene.scene.key}`);
});

game.events.on('scenestop', (scene) => {
    console.log(`Scene stopped: ${scene.scene.key}`);
});

// Global game variables
game.globals = {
    score: 0,
    highScore: 0,
    lives: 3
};

// Load high score from local storage if available
window.onload = function() {
    console.log("Game window loaded");
    try {
        const savedHighScore = localStorage.getItem('catfightHighScore');
        if (savedHighScore !== null) {
            game.globals.highScore = parseInt(savedHighScore);
            console.log("Loaded high score:", game.globals.highScore);
        } else {
            console.log("No saved high score found");
        }
    } catch (error) {
        console.error("Error loading high score:", error);
    }
}; 