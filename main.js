import * as THREE from 'three';
import { DXFLoader } from 'three-dxf-loader';

// Create a basic Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up the DXF loader
const loader = new DXFLoader();
loader.setDefaultColor(0x000000); // Set default color for DXF entities
loader.setConsumeUnits(true); // Use units from the DXF file

// Load the DXF file
loader.load('sample.dxf', (data) => {
    if (data && data.entity) {
        scene.add(data.entity);
    }
}, undefined, (error) => {
    console.error('Error loading DXF file:', error);
});

// Position the camera
camera.position.z = 5;

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
