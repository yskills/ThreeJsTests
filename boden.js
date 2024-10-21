import { PlaneGeometry, MeshLambertMaterial, Mesh, DoubleSide, Vector3 } from 'three';

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
    getSurfaceNormal(x, y) {
        // Example implementation to calculate the normal at (x, y)
        // This should return a normalized Vector3 representing the normal at the height of the ground

        const positionAttribute = this.geometry.attributes.position;
        let normal = new Vector3(0, 0, 0);
        let count = 0;

        // Calculate normals based on adjacent vertices (could be further refined)
        for (let i = 0; i < positionAttribute.count; i++) {
            const px = positionAttribute.getX(i);
            const py = positionAttribute.getY(i);
            if (Math.abs(px - x) < 1 && Math.abs(py - y) < 1) {
                const nx = positionAttribute.getX(i); // Placeholder for normal data
                const ny = positionAttribute.getY(i); // Placeholder for normal data
                const nz = positionAttribute.getZ(i); // Placeholder for normal data
                normal.add(new Vector3(nx, ny, nz));
                count++;
            }
        }

        if (count > 0) {
            normal.divideScalar(count).normalize(); // Average and normalize
        }

        return normal; // Should return a normalized Vector3
    }

    addToScene(scene) {
        scene.add(this.mesh);  // Add the ground to the scene
    }
}
