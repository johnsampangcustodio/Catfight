class Dog extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'dog');
        
        // Add the sprite to the scene
        scene.add.existing(this);
        
        // Enable physics on the sprite
        scene.physics.add.existing(this);
        
        // Set the dog's scale - 25% smaller than original
        this.setScale(0.15); // Down from 0.2
        
        // Movement properties - slower dog for better gameplay
        this.moveSpeed = 100;
        
        // Set random rotation
        this.setRotation(Phaser.Math.FloatBetween(-0.2, 0.2));
    }
    
    // Method to make the dog chase the cat
    chaseCat(cat, speed = null) {
        // Use provided speed or default to moveSpeed
        const chaseSpeed = speed || this.moveSpeed;
        
        // Calculate direction vector
        const dirX = cat.x - this.x;
        const dirY = cat.y - this.y;
        
        // Normalize the direction vector
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        const normX = dirX / length;
        const normY = dirY / length;
        
        // Apply velocity to the dog
        this.body.velocity.x = normX * chaseSpeed;
        this.body.velocity.y = normY * chaseSpeed;
        
        // Face the direction of movement
        this.rotation = Math.atan2(normY, normX);
    }
    
    update() {
        // Less deceleration to maintain momentum longer
        this.body.velocity.x *= 0.99;
        this.body.velocity.y *= 0.99;
    }
} 