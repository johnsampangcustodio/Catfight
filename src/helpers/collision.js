// Collision and boundary checking utilities

/**
 * Check if a sprite is outside of a circular boundary
 * @param {Phaser.GameObjects.Sprite} sprite - The sprite to check
 * @param {number} centerX - The x coordinate of the circle center
 * @param {number} centerY - The y coordinate of the circle center
 * @param {number} radius - The radius of the circle
 * @returns {boolean} - true if the sprite is outside the circle
 */
function isOutsideCircle(sprite, centerX, centerY, radius) {
    const distanceSquared = Math.pow(sprite.x - centerX, 2) + Math.pow(sprite.y - centerY, 2);
    return distanceSquared > Math.pow(radius, 2);
}

/**
 * Handle collision between cat and dog
 * @param {Cat} cat - The cat sprite
 * @param {Dog} dog - The dog sprite
 */
function handleCatDogCollision(cat, dog) {
    // Simple implementation for now
    const dirX = dog.x - cat.x;
    const dirY = dog.y - cat.y;
    
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    const normX = dirX / length;
    const normY = dirY / length;
    
    dog.body.velocity.x = normX * 150;
    dog.body.velocity.y = normY * 150;
} 