import { AmmoPhysics } from 'three/addons/physics/AmmoPhysics.js';
import * as THREE from 'three';

let physics, world, playerBody, cameraCollider;

export async function initPhysics(scene) {
  physics = await AmmoPhysics();
  
  // Create a physics world and add it to the scene
  world = physics.addPhysicsWorld(scene);

  return world;
}

export function createPlayerBody(camera) {
  // Create a dynamic body for the player (camera)
  const radius = 0.5;
  const height = 1.6;

  const playerShape = new THREE.CylinderGeometry(radius, radius, height, 8);
  playerBody = physics.addCylinder(camera.position, playerShape, 1, 0.1, 1);

  // Lock rotation so the player does not tip over
  playerBody.setAngularFactor(0, 0, 0);

  // Create a camera collider for detecting walls
  cameraCollider = physics.addSphere(camera.position, 0.2, 1);
  
  return playerBody;
}

export function addRigidBodyToModel(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      const shape = physics.addConvexHull(child.geometry);
      physics.addRigidBody(child, shape);
    }
  });
}

export function updatePhysics(deltaTime) {
  physics.update(deltaTime);

  // Sync player (camera) body with camera position
  playerBody.setPosition(cameraCollider.position);
}