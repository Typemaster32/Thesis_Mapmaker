import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as Ammo from 'ammo.js';


let scene, camera, renderer, controls;

let clock = new THREE.Clock();

function init() {
  // Initialize Three.js scene
  scene = new THREE.Scene();

  // Camera initialization
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 5);

  // Initialize renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Initialize PointerLockControls after the camera is created
  controls = new PointerLockControls(camera, document.body);
  document.addEventListener('click', () => controls.lock());

  // Lights
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // GLTF Model Loading
  const loader = new GLTFLoader();
  loader.load('./assets/backroom6.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);
  });

  // Handle window resizing
  window.addEventListener('resize', onWindowResize, false);
}

function animate() {
  const deltaTime = clock.getDelta();

  // Update physics world
  // updatePhysics(deltaTime);s

  requestAnimationFrame(animate);

  // Update movement based on keys pressed
  updateMovement();

  // Render scene
  renderer.render(scene, camera);
}
const movingSpeed = 0.1
function updateMovement() {
  if (keysPressed.w) controls.moveForward(movingSpeed);
  if (keysPressed.a) controls.moveRight(-movingSpeed);
  if (keysPressed.s) controls.moveForward(-movingSpeed);
  if (keysPressed.d) controls.moveRight(movingSpeed);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Key press states
const keysPressed = { w: false, a: false, s: false, d: false };

// Capture WASD keydown/keyup events
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
      keysPressed.w = true;
      break;
    case 'KeyA':
      keysPressed.a = true;
      break;
    case 'KeyS':
      keysPressed.s = true;
      break;
    case 'KeyD':
      keysPressed.d = true;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
      keysPressed.w = false;
      break;
    case 'KeyA':
      keysPressed.a = false;
      break;
    case 'KeyS':
      keysPressed.s = false;
      break;
    case 'KeyD':
      keysPressed.d = false;
      break;
  }
});




const cameraBoxShape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1));

Ammo().then( function ( AmmoLib ) {
  Ammo = AmmoLib; // Assign the library
  init(); // Call your initialization functions
});

function initPhysics() {
  const gravityConstant = -9.8;
  collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  broadphase = new Ammo.btDbvtBroadphase();
  solver = new Ammo.btSequentialImpulseConstraintSolver();
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
  physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
}

function createRigidBody(object, shape, mass) {
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  const position = object.position;
  transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
  const quaternion = object.quaternion;
  transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

  const motionState = new Ammo.btDefaultMotionState(transform);
  const localInertia = new Ammo.btVector3(0, 0, 0);
  shape.calculateLocalInertia(mass, localInertia);

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
  const body = new Ammo.btRigidBody(rbInfo);
  object.userData.physicsBody = body;
  physicsWorld.addRigidBody(body);

  return body;
}

function updatePhysics(deltaTime) {
  physicsWorld.stepSimulation(deltaTime, 10);

  // Update the positions of the objects based on the physics world
  rigidBodies.forEach((object) => {
      const physicsBody = object.userData.physicsBody;
      const motionState = physicsBody.getMotionState();
      if (motionState) {
          motionState.getWorldTransform(transformAux1);
          const origin = transformAux1.getOrigin();
          const rotation = transformAux1.getRotation();
          object.position.set(origin.x(), origin.y(), origin.z());
          object.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
  });
}

// Start the application
init();
animate();


