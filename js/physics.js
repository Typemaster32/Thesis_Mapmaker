// Global variables for Ammo.js world and physics
let physicsWorld, rigidBodies = [], tmpTrans;


let playerBody;  // Rigid body representing the player/camera

// Create a rigid body for the camera (player)
function createPlayerBody() {
  // Create a capsule shape (for smoother movement)
  const playerShape = new Ammo.btCapsuleShape(0.5, 1.75);  // 0.5 radius, 1.75 height (adjust as needed)
  const startTransform = new Ammo.btTransform();
  startTransform.setIdentity();
  startTransform.setOrigin(new Ammo.btVector3(0, 5, 0));  // Start the player a few units above the ground

  const mass = 1;  // Set a small mass for the player body
  const localInertia = new Ammo.btVector3(0, 0, 0);
  playerShape.calculateLocalInertia(mass, localInertia);

  const motionState = new Ammo.btDefaultMotionState(startTransform);
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, playerShape, localInertia);
  playerBody = new Ammo.btRigidBody(rbInfo);

  playerBody.setFriction(0.9);  // Prevent sliding
  physicsWorld.addRigidBody(playerBody);
}


// Initialize the physics world
function initPhysics() {
  tmpTrans = new Ammo.btTransform();

  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  const broadphase = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();

  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
  physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0)); // Set gravity for the physics world
}

// Create a rigid body for the GLTF model
function createRigidBody(threeObject, physicsShape, mass, position, rotation) {
  const transform = new Ammo.btTransform();
  transform.setIdentity();

  // Set the correct position
  transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

  // Adjust for any 90-degree rotation (you can adjust the axis if necessary)
  const quat = threeObject.quaternion; // Use the quaternion from Three.js object
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

  const motionState = new Ammo.btDefaultMotionState(transform);
  const localInertia = new Ammo.btVector3(0, 0, 0);

  if (mass > 0) {
    physicsShape.calculateLocalInertia(mass, localInertia);
  }

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
  const body = new Ammo.btRigidBody(rbInfo);

  physicsWorld.addRigidBody(body);

  // Attach the physics body to the Three.js object
  threeObject.userData.physicsBody = body;
  rigidBodies.push(threeObject);
}

function updatePhysics(deltaTime) {
  physicsWorld.stepSimulation(deltaTime, 10);

  // Apply player movement based on WASD
  applyPlayerMovement();

  // Synchronize physics bodies and visuals
  for (let i = 0; i < rigidBodies.length; i++) {
    const objThree = rigidBodies[i];
    const objAmmo = objThree.userData.physicsBody;
    if (objAmmo) {
      const ms = objAmmo.getMotionState();
      if (ms) {
        ms.getWorldTransform(tmpTrans);
        const p = tmpTrans.getOrigin();
        const q = tmpTrans.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
    }
  }

  // Update the camera based on the player's physics body
  if (playerBody) {
    const playerTransform = new Ammo.btTransform();
    const ms = playerBody.getMotionState();
    if (ms) {
      ms.getWorldTransform(playerTransform);
      const playerPosition = playerTransform.getOrigin();
      camera.position.set(playerPosition.x(), playerPosition.y() + 1.75, playerPosition.z());
    }
  }
}

function applyPlayerMovement() {
  const moveSpeed = 10;  // Adjust movement speed
  
  // Create a new Ammo.btVector3 to represent force
  const force = new Ammo.btVector3(0, 0, 0);

  // Forward/backward movement (W/S)
  if (keysPressed['w']) {
    const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    force.setValue(forwardVector.x * moveSpeed, 0, forwardVector.z * moveSpeed); // Convert to Ammo vector
  }
  if (keysPressed['s']) {
    const backwardVector = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
    force.setValue(backwardVector.x * moveSpeed, 0, backwardVector.z * moveSpeed); // Convert to Ammo vector
  }

  // Left/right strafing (A/D)
  if (keysPressed['a']) {
    const leftVector = new THREE.Vector3(-1, 0, 0).applyQuaternion(camera.quaternion);
    force.setValue(leftVector.x * moveSpeed, 0, leftVector.z * moveSpeed);  // Convert to Ammo vector
  }
  if (keysPressed['d']) {
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    force.setValue(rightVector.x * moveSpeed, 0, rightVector.z * moveSpeed);  // Convert to Ammo vector
  }

  // Apply force to the player body
  if (playerBody) {
    const currentVelocity = playerBody.getLinearVelocity();
    
    // Apply the force, keeping the y-axis velocity for gravity
    playerBody.setLinearVelocity(new Ammo.btVector3(force.x(), currentVelocity.y(), force.z()));
  }
}