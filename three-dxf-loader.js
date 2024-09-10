import * as THREE from 'three';
import { DXFParser } from './dxf-parser'; // Import your custom DXFParser

class THREEDXFLoader {
    constructor() {
        this.parser = new DXFParser(); // Use your DXF parser
        this.group  = new THREE.Group();
        this.boxHelper = null;  // Initialize BoxHelper
      }
      
    addToScene(scene) {
        if (this.group) {
            scene.add(this.group);
        } else {
            console.warn('No group to add to the scene. Make sure to load and parse the DXF first.');
        }
    }
    addBoxHelper(scene) {
        if (!this.boxHelper) {
          // Create BoxHelper if it doesn't exist
          this.boxHelper = new THREE.BoxHelper(this.group, 0xffff00);  // yellow color
          scene.add(this.boxHelper);
        }
      }
      removeBoxHelper(scene) {
        if (this.boxHelper) {
          scene.remove(this.boxHelper);
          this.boxHelper = null;  // Clear the reference
        }
      }
      
    async loadFromFilePath(filePath) {
        const dxfData = await this.parser.loadFromFilePath(filePath);
        if (dxfData) {
            return this.parseDXF(dxfData);
        }
        return null;
    }

    async loadFromUrl(url) {
        const dxfData = await this.parser.loadFromUrl(url);
        if (dxfData) {
            return this.parseDXF(dxfData);
        }
        return null;
    }

    parseDXF(dxfData) {

        // Loop through all DXF entities and handle different types
        dxfData.entities.forEach((entity) => {
            let obj3D;

            switch (entity.type) {
                case 'LINE':
                    obj3D = this.createLine(entity);
                    break;
                case 'CIRCLE':
                    obj3D = this.createCircle(entity);
                    break;
                case '3DFACE':
                    obj3D = this.create3DFace(entity);
                    break;
                // Add handling for more DXF entity types like ARC, POLYLINE, etc.
                default:
                    console.warn(`Unsupported DXF entity type: ${entity.type}`);
                    break;
            }

            if (obj3D) {
                this.group.add(obj3D); // Add the object to the group
            }
        });

        return this.group; // Return the group to add it to the scene
    }

    createLine(entity) {
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z),
            new THREE.Vector3(entity.vertices[1].x, entity.vertices[1].y, entity.vertices[1].z),
        ]);
        return new THREE.Line(geometry, material);
    }

    createCircle(entity) {
        const geometry = new THREE.CircleGeometry(entity.radius, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const circle = new THREE.Mesh(geometry, material);
        circle.position.set(entity.center.x, entity.center.y, entity.center.z);
        return circle;
    }

    create3DFace(entity) {
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z),
            new THREE.Vector3(entity.vertices[1].x, entity.vertices[1].y, entity.vertices[1].z),
            new THREE.Vector3(entity.vertices[2].x, entity.vertices[2].y, entity.vertices[2].z),
        ]);

        if (entity.vertices[3]) {
            geometry.setFromPoints([
                ...geometry.attributes.position.array,
                new THREE.Vector3(entity.vertices[3].x, entity.vertices[3].y, entity.vertices[3].z),
            ]);
        }

        return new THREE.Mesh(geometry, material);
    }
}

export { THREEDXFLoader };
