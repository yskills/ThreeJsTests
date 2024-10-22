import { PlaneGeometry, MeshLambertMaterial, Mesh, DoubleSide, Vector3 } from 'three';

export class Boden {
    constructor(sizeX, sizeY, subdivisionsX, subdivisionsY) {
        // Create a PlaneGeometry with subdivisions
        this.geometry = new PlaneGeometry(sizeX, sizeY, subdivisionsX, subdivisionsY);
        this.material = new MeshLambertMaterial({ color: 0xaaaa00, side: DoubleSide, wireframe: true });
        this.mesh = new Mesh(this.geometry, this.material);

        // Rotate the plane
        this.mesh.rotation.x = Math.PI / 3;  // Set the ground horizontal

        // Initialize the geometry with a simulated uneven surface
        this.updateSurface();

        // Update the geometry
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeVertexNormals();
    }

    // Update the vertex positions to create an uneven surface
    updateSurface() {
        const vertices = this.geometry.attributes.position.array;

        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 10;  // Example wave surface
            vertices[i + 2] = z;  // Update Z value directly
        }
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
            const vertice = new Vector3(vx, vy, vz)
            vertice.applyEuler(this.mesh.rotation);

            const dist = Math.sqrt((vertice.x - x) ** 2 + (vertice.z - y) ** 2);

            if (dist < closestDistance) {
                closestDistance = dist;
                closestZ = vertice.y; // Update closest Z
            }
        }

        return closestZ !== null ? closestZ : 0; // Return closest Z or default to 0 if not found
    }

    getPointAt(x, y) {
        const vertices = this.geometry.attributes.position.array;
        let closestZ = new Vector3(x, 0, y); // Initialize as null
        let closestDistance = Infinity;

        for (let i = 0; i < vertices.length; i += 3) {
            const vx = vertices[i];
            const vy = vertices[i + 1];
            const vz = vertices[i + 2];
            const dist = Math.sqrt((vx - x) ** 2 + (vy - y) ** 2);

            if (dist < closestDistance) {
                closestDistance = dist;
                closestZ.y = -vz; // Update closest Z
            }
        }

        return closestZ !== null ? closestZ : 0; // Return closest Z or default to 0 if not found
    }

    addToScene(scene) {
        scene.add(this.mesh);  // Add the ground to the scene
    }
}
