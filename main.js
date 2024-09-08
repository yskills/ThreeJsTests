import * as THREE from 'three';
import { DXFLoader } from 'three-dxf-loader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import DxfParser from 'dxf-parser';

// Create a basic Three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Set background color

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube
const geometry = new THREE.BoxGeometry();
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


// Set up the DXF loader
// Suppose we have a font in our application 

// const fontLoader = new FontLoader();

// loader.setDefaultColor(0x000000); // Set default color for DXF entities
// loader.setConsumeUnits(true); // Use units from the DXF file
// fontLoader.load("./fonts/helvetiker_regular.typeface.json",(font)=>{
//     loader.setFont(font);
// });
// Load the DXF file

fetch('./Erdkabel/240816_Testdaten_Muffenschächte_L_S.dxf')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();  // Get the file content as text
  })
  .then(data => {
    console.log(data);  // Full string content of the DXF file
    let font = 'fonts/helvetiker_regular.typeface.json';

    // Get all the geometry generated by the viewer
    let dxf =  new DXFViewer().getFromFile(data, font);

    // Add the geometry to the scene
    scene.addDXF(dxf);


    console.log(dxf);  // Parsed DXF data
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
// loader.load('./Erdkabel/240816_Testdaten_Muffenschächte_L_S.dxf', (data) => {
//     if (data && data.entity) {
//         const entity = data.entity;

//         const boundingBox = new THREE.Box3();
//         boundingBox.setFromObject(entity);    
//         const center = new THREE.Vector3(-boundingBox.min.x, -boundingBox.min.y,0);
//         entity.position.set(center.x, center.y);
//         boundingBox.setFromObject(entity); 
//         camera.lookAt(center);
//         const boxHelper = new THREE.Box3Helper(boundingBox);
//         scene.add(data.entity, boxHelper);
//     }
// }, undefined, (error) => {
//     console.error('Error loading DXF file:', error);
// });

// Position the camera
camera.position.z = 5;

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
