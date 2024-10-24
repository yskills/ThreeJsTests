import { Scene, Color, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, DirectionalLight, Vector2, Raycaster, Vector3 } from 'three';
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

// Add light
const light = new DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10).normalize();
scene.add(light);

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
const boden = new Boden(50, 50, 500, 500);
boden.addToScene(scene);

// Create a cube object
const boxGeometry = new BoxGeometry(5, 5, 5);
const boxMaterial = new MeshBasicMaterial({ color: 0x0000ff });
const box = new Mesh(boxGeometry, boxMaterial);
scene.add(box);

// Place the cube on the ground using ObjectPlacer
const placer = new ObjectPlacer(boden, scene);
placer.placeObject(box, 9, -12);

// Raycaster for detecting mouse clicks
const raycaster = new Raycaster();
const mouse = new Vector2();
let isDragging = false;

// Event listeners for mouse actions
window.addEventListener('mousedown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(box); // Check if the box was clicked

    if (intersects.length > 0) {
        isDragging = true; // Start dragging
        controls.enabled = false; // Disable orbit controls
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false; // Stop dragging
    controls.enabled = true; // Re-enable orbit controls
});

window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Create a raycaster for the Boden
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(boden.mesh); // Check against the ground

        if (intersects.length > 0) {
            const newPoint = intersects[0].point; // Get the new intersection point
            placer.placeObject(box, newPoint.x, newPoint.z); // Update the cube's position based on new intersection
        }
    }
});

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
