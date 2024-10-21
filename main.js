import { Scene, Color, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, DirectionalLight } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Boden } from './boden';
import { ObjectPlacer } from './objectPlacer.js';

// Initialize the scene
const scene = new Scene();
scene.background = new Color(0x444444);

// Create and position the camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 20000);
camera.position.set(30, 30, 50);
camera.lookAt(0, 0, 0);

// Set up the renderer
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Create the Boden (ground)
const boden = new Boden(50, 50, 10, 10);  // Ground of size 50x50 with 10x10 subdivisions
boden.addToScene(scene);

// Create a cube object
const boxGeometry = new BoxGeometry(5, 5, 5);
const boxMaterial = new MeshBasicMaterial({ color: 0x0000ff });
const box = new Mesh(boxGeometry, boxMaterial);
scene.add(box);

// Place the cube on the ground using ObjectPlacer
const placer = new ObjectPlacer(boden);
placer.placeObject(box, 10, -10);  // Place the box at (10, 10)

// Render loop
function animate() {
    requestAnimationFrame(animate);

    // Update the controls
    controls.update();

    // Render the scene
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
