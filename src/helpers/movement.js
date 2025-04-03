// Basic movement helper functions

/**
 * Calculate a random position inside a circle
 * @param {number} centerX - The x coordinate of the circle center
 * @param {number} centerY - The y coordinate of the circle center
 * @param {number} minRadius - The minimum distance from center
 * @param {number} maxRadius - The maximum distance from center
 * @returns {object} - {x, y} coordinates
 */
function getRandomPositionInCircle(centerX, centerY, minRadius, maxRadius) {
    const angle = Math.random() * Math.PI * 2;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return { x, y };
}

/**
 * Calculate the distance between two points
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} - The distance between the points
 */
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Limit a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} - The clamped value
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
} 