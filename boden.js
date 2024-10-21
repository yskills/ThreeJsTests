import { PlaneGeometry, MeshLambertMaterial, Mesh, DoubleSide } from 'three';

export class Boden {
    constructor(sizeX, sizeY, subdivisionsX, subdivisionsY) {
        // Create a PlaneGeometry with subdivisions
        this.geometry = new PlaneGeometry(sizeX, sizeY, subdivisionsX, subdivisionsY);
        this.material = new MeshLambertMaterial({ color: 0x00ff00, side: DoubleSide, wireframe: true });
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.rotation.x = Math.PI / 2;  // Set the ground horizontal

        // Simulate an uneven surface (you can adjust this as needed)
        for (let i = 0; i < this.geometry.attributes.position.count; i++) {
            let x = this.geometry.attributes.position.getX(i);
            let y = this.geometry.attributes.position.getY(i);
            let z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 5;  // Example wave surface

                this.geometry.attributes.position.setZ(i, z);
        }

        // Update the geometry
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeVertexNormals();
    }

    // Method to get the height (Z-value) at a given X, Y position
    getHeightAt(x, y) {
        const vertices = this.geometry.attributes.position.array;
        let closestZ = null; // Initialize as null
        let closestDistance = Infinity;

        for (let i = 0; i < vertices.length; i += 3) {
            const vx = vertices[i];
            const vy = vertices[i + 1];
            const vz = vertices[i + 2];
            const dist = Math.sqrt((vx - x) ** 2 + (vy - y) ** 2);

            if (dist < closestDistance) {
                closestDistance = dist;
                closestZ = -vz; // Update closest Z
            }
        }

        return closestZ !== null ? closestZ : 0; // Return closest Z or default to 0 if not found
    }


    addToScene(scene) {
        scene.add(this.mesh);  // Add the ground to the scene
    }
}
