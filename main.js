import { Scene, Color, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, DirectionalLight, Vector2, Raycaster, Vector3, CircleGeometry, SphereGeometry } from 'three';
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
placer.placeObject(box, -1.4, 2);

// Raycaster for detecting mouse clicks and intersections
const raycaster = new Raycaster();
const mouse = new Vector2();
let isDragging = false;

// Event listener for mouse down to check if cube is clicked
window.addEventListener('mousedown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(box); // Check if the box was clicked

    if (intersects.length > 0) {
        isDragging = true; // Start dragging
        controls.enabled = false; // Disable orbit controls while dragging
    }
});

// Event listener for mouse up to place the cube at the ground location
window.addEventListener('mouseup', (event) => {
    if (isDragging) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersectsGround = raycaster.intersectObject(boden.mesh); // Check against the ground

        if (intersectsGround.length > 0) {
            const newPoint = intersectsGround[0].point; // Get the intersection point on the ground
            placer.placeObject(box, newPoint.x, newPoint.z); // Update cube's position
        }

        isDragging = false; // Stop dragging
        controls.enabled = true; // Re-enable orbit controls
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
