class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloaderScene' });
    }
    
    preload() {
        // Create loading graphics
        const { width, height } = this.sys.game.config;
        const loadingText = this.add.text(width/2, height/2 - 50, 'Loading...', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Create a loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x444444, 0.8);
        progressBox.fillRect(width/2 - 160, height/2 - 25, 320, 50);
        
        // Loading progress event
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width/2 - 150, height/2 - 15, 300 * value, 30);
        });
        
        // Loading complete event
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
        
        // Add error handling with more detailed logging
        this.load.on('loaderror', (fileObj) => {
            console.error('Error loading asset:', fileObj.key);
            console.error('Source path:', fileObj.src);
            console.error('Type:', fileObj.type);
        });
        
        // Try multiple loading approaches to ensure the images load
        
        // Approach 1: Basic relative path
        this.load.image('cat', 'assets/images/cat.png');
        this.load.image('dog', 'assets/images/dog.png');
        
        // Approach 2: Try with ./
        this.load.image('cat2', './assets/images/cat.png');
        this.load.image('dog2', './assets/images/dog.png');
        
        // Approach 3: Try with full path calculated from document location
        try {
            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            console.log("Base URL:", baseUrl);
            
            this.load.image('cat3', baseUrl + '/assets/images/cat.png');
            this.load.image('dog3', baseUrl + '/assets/images/dog.png');
        } catch (e) {
            console.error("Error with approach 3:", e);
        }
        
        // Approach 4: Provide inline fallback images
        // Simple white cat silhouette as data URI
        const catDataURI = 'data:image/png;base64,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';
        this.textures.addBase64('catFallback', catDataURI);
        
        // Simple dog silhouette as data URI
        const dogDataURI = 'data:image/png;base64,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';
        this.textures.addBase64('dogFallback', dogDataURI);
    }
    
    create() {
        // Extensive debug logging
        console.log('PreloaderScene create function reached');
        
        // Check all versions of the textures
        console.log('Cat texture exists:', this.textures.exists('cat'));
        console.log('Cat2 texture exists:', this.textures.exists('cat2'));
        console.log('Cat3 texture exists:', this.textures.exists('cat3'));
        console.log('CatFallback texture exists:', this.textures.exists('catFallback'));
        
        // Pick the first texture that exists
        let catKey = null;
        let dogKey = null;
        
        // Check all cat textures in order of preference
        if (this.textures.exists('cat')) {
            catKey = 'cat';
        } else if (this.textures.exists('cat2')) {
            catKey = 'cat2';
        } else if (this.textures.exists('cat3')) {
            catKey = 'cat3';
        } else {
            catKey = 'catFallback';
        }
        
        // Check all dog textures in order of preference
        if (this.textures.exists('dog')) {
            dogKey = 'dog';
        } else if (this.textures.exists('dog2')) {
            dogKey = 'dog2';
        } else if (this.textures.exists('dog3')) {
            dogKey = 'dog3';
        } else {
            dogKey = 'dogFallback';
        }
        
        console.log('Using cat texture:', catKey);
        console.log('Using dog texture:', dogKey);
        
        // If we're using a different key than 'cat', copy it to the standard key
        if (catKey !== 'cat') {
            this.textures.addKey('cat', this.textures.get(catKey));
        }
        
        // If we're using a different key than 'dog', copy it to the standard key
        if (dogKey !== 'dog') {
            this.textures.addKey('dog', this.textures.get(dogKey));
        }
        
        // Start the opening screen
        this.scene.start('OpeningScreen');
    }
} 