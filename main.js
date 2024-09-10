import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { THREEDXFLoader } from './three-dxf-loader';

// Create a basic Three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Set background color

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01,20000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube
const geometry = new THREE.BoxGeometry(20,20,20);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
const boundingBox = new THREE.Box3();
boundingBox.setFromObject(cube);
camera.position.x = boundingBox.min.x;
camera.position.y = boundingBox.min.y;
camera.lookAt(boundingBox.min);

const boxHelper = new THREE.Box3Helper(boundingBox);

scene.add(boxHelper);
scene.add(cube);

// Example usage:
const loader = new THREEDXFLoader();

// Load from URL

await loader.loadFromUrl('Erdkabel/240816_Testdaten_Muffenschächte_L_S.dxf');
loader.addToScene(scene);
loader.addBoxHelper(scene);
// Position the camera
camera.position.z = 30;

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Render loop
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
