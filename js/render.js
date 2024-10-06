let scene, camera, renderer, controls;
let clock = new THREE.Clock();

function init() {
  const container = document.getElementById('container');

  // Initialize Three.js scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 5);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Initialize physics world
  initPhysics();
  createPlayerBody();
  // Load the GLTF model
  const loader = new THREE.GLTFLoader();
  loader.load('./assets/backroom6.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Generate a simple box collision shape for demonstration
    model.traverse((child) => {
      if (child.isMesh) {
        const boxShape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1));  // Example: adjust size accordingly
        createRigidBody(child, boxShape, 0, child.position);  // Mass = 0 for static objects
      }
    });
  });

  window.addEventListener('resize', onWindowResize, false);
}

// Handle window resizing
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

const keysPressed = {};

// Listen for keydown events (WASD movement)
window.addEventListener('keydown', (event) => {
  keysPressed[event.key] = true;
});

window.addEventListener('keyup', (event) => {
  keysPressed[event.key] = false;
});

let rotationSpeed = 0.002;

window.addEventListener('mousemove', (event) => {
  if (controls.isLocked) {
    const deltaX = event.movementX * rotationSpeed;
    const deltaY = event.movementY * rotationSpeed;
    
    // Update camera rotation
    camera.rotation.y -= deltaX;
    camera.rotation.x -= deltaY;
  }
});

// Start the application
init();
animate();