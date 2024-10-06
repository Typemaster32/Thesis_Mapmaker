let scene, camera, renderer, controls;
let transformAux1;
let clock = new THREE.Clock();

// Ammo.js physics variables

// Initialize the scene and physics world
function init() {
  const container = document.getElementById('container');

  // Set up Three.js scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 5);  // Set the camera position

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Initialize Ammo.js physics world
  initPhysics();

  // Load the GLTF model and add a physics body
  const loader = new THREE.GLTFLoader();
  loader.load('./assets/backroom6.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Create a rigid body for the model (example uses a box shape)
    createRigidBody(model, new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1)), 1, model.position);
  });

  window.addEventListener('resize', onWindowResize, false);
}

// Initialize the physics world
function initPhysics() {
  tmpTrans = new Ammo.btTransform();
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  const broadphase = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();

  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
  physicsWorld.setGravity(new Ammo.btVector3(0, 9.82, 0)); // Set gravity
}

// Create a rigid body for the GLTF model
function createRigidBody(threeObject, physicsShape, mass, position) {
  // Create Ammo.js rigid body
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
  const motionState = new Ammo.btDefaultMotionState(transform);

  const localInertia = new Ammo.btVector3(0, 0, 0);
  if (mass > 0) {
    physicsShape.calculateLocalInertia(mass, localInertia);
  }

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
  const body = new Ammo.btRigidBody(rbInfo);

  // Add the rigid body to the physics world
  physicsWorld.addRigidBody(body);

  // Store the rigid body for future updates
  threeObject.userData.physicsBody = body;
  rigidBodies.push(threeObject);
}

// Synchronize the visual model with the physics body
function updatePhysics(deltaTime) {
  // Step the physics world
  physicsWorld.stepSimulation(deltaTime, 10);

  // Update the position and rotation of the visual object based on the physics simulation
  for (let i = 0; i < rigidBodies.length; i++) {
    const objThree = rigidBodies[i];
    const objAmmo = objThree.userData.physicsBody;
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

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Render loop
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  updatePhysics(deltaTime);

  controls.update();
  renderer.render(scene, camera);
}

// Start the application
init();
animate();