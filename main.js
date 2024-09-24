import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DxfLoaderManager } from './three-dxf-loader';
import { DXFParser } from './dxf-parser';

// Create a basic Three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x444444); // Set background color

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

const parser = new  DXFParser();
const dxfManager = new DxfLoaderManager(scene);
const filePaths = [
    // "Erdkabel/7001_Trasse_UTM32_8 Stelling.dxf",
    // "Erdkabel/Alegro_7001TB067-VS 21.dxf",
    // "Erdkabel/Dükerung_skt078.dxf",
    // "Erdkabel/HDD_78-01.dxf",
    // "Erdkabel/HDD_79-01.dxf",
    "Erdkabel/240816_Testdaten_Muffenschächte_L_S.dxf"
];
// parser.loadFromUrl(filePaths[0]);

// Lade alle Dateien über den Manager
await dxfManager.loadFiles(filePaths);
dxfManager.addElementsToModel();
dxfManager.moveElementsToZero();
dxfManager.toggleBoxHelpers();

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
