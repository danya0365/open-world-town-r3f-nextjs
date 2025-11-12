/**
 * Collision Detection Utilities
 * Utilities for detecting and resolving collisions between players and objects
 */

export interface CircleCollider {
  x: number;
  z: number;
  radius: number;
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
