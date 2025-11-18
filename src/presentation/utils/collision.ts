/**
 * Collision Detection Utilities
 * Utilities for detecting and resolving collisions between players and objects
 */

export interface CircleCollider {
  x: number;
  z: number;
  radius: number;
}

export interface BoxCollider {
  x: number; // Center position
  z: number; // Center position
  width: number; // Size in x-axis
  depth: number; // Size in z-axis
}

/**
 * Check if two circles collide
 */
export function checkCircleCollision(
  circle1: CircleCollider,
  circle2: CircleCollider
): boolean {
  const dx = circle1.x - circle2.x;
  const dz = circle1.z - circle2.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  const minDistance = circle1.radius + circle2.radius;

  return distance < minDistance;
}

/**
 * Check if a circle collides with a box (AABB)
 */
export function checkCircleBoxCollision(
  circle: CircleCollider,
  box: BoxCollider
): boolean {
  // Find the closest point on the box to the circle
  const halfWidth = box.width / 2;
  const halfDepth = box.depth / 2;
  
  const closestX = Math.max(box.x - halfWidth, Math.min(circle.x, box.x + halfWidth));
  const closestZ = Math.max(box.z - halfDepth, Math.min(circle.z, box.z + halfDepth));
  
  // Calculate distance between circle center and closest point
  const dx = circle.x - closestX;
  const dz = circle.z - closestZ;
  const distanceSquared = dx * dx + dz * dz;
  
  return distanceSquared < circle.radius * circle.radius;
}

/**
 * Resolve collision between two circles by pushing them apart
 * Returns the new position for circle1
 */
export function resolveCircleCollision(
  circle1: CircleCollider,
  circle2: CircleCollider
): { x: number; z: number } {
  const dx = circle1.x - circle2.x;
  const dz = circle1.z - circle2.z;
  const distance = Math.sqrt(dx * dx + dz * dz);

  // Prevent division by zero
  if (distance === 0) {
    return {
      x: circle1.x + circle1.radius,
      z: circle1.z,
    };
  }

  const minDistance = circle1.radius + circle2.radius;
  const overlap = minDistance - distance;

  // Calculate push direction (normalized)
  const pushX = (dx / distance) * overlap;
  const pushZ = (dz / distance) * overlap;

  return {
    x: circle1.x + pushX,
    z: circle1.z + pushZ,
  };
}

/**
 * Resolve collision between a circle and a box
 * Returns the new position for the circle
 */
export function resolveCircleBoxCollision(
  circle: CircleCollider,
  box: BoxCollider
): { x: number; z: number } {
  // Find the closest point on the box to the circle
  const halfWidth = box.width / 2;
  const halfDepth = box.depth / 2;
  
  const closestX = Math.max(box.x - halfWidth, Math.min(circle.x, box.x + halfWidth));
  const closestZ = Math.max(box.z - halfDepth, Math.min(circle.z, box.z + halfDepth));
  
  // Calculate vector from closest point to circle center
  const dx = circle.x - closestX;
  const dz = circle.z - closestZ;
  const distance = Math.sqrt(dx * dx + dz * dz);
  
  // If circle center is inside the box
  if (distance === 0) {
    // Push out in the direction of the shortest distance to edge
    const distToLeft = Math.abs(circle.x - (box.x - halfWidth));
    const distToRight = Math.abs(circle.x - (box.x + halfWidth));
    const distToTop = Math.abs(circle.z - (box.z - halfDepth));
    const distToBottom = Math.abs(circle.z - (box.z + halfDepth));
    
    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
    
    if (minDist === distToLeft) {
      return { x: box.x - halfWidth - circle.radius, z: circle.z };
    } else if (minDist === distToRight) {
      return { x: box.x + halfWidth + circle.radius, z: circle.z };
    } else if (minDist === distToTop) {
      return { x: circle.x, z: box.z - halfDepth - circle.radius };
    } else {
      return { x: circle.x, z: box.z + halfDepth + circle.radius };
    }
  }
  
  // Push circle out along the vector from closest point
  const overlap = circle.radius - distance;
  const pushX = (dx / distance) * overlap;
  const pushZ = (dz / distance) * overlap;
  
  return {
    x: circle.x + pushX,
    z: circle.z + pushZ,
  };
}
