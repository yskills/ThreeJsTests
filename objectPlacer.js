import { Box3, Vector3 } from 'three';
import { Boden } from './boden';

export class ObjectPlacer {
    constructor(boden) {
        this.boden = boden;  // Reference to the Boden instance
    }

    placeObject(object, x, y) {
        // Get the Z-value for the given (x, y)
        const z = this.boden.getHeightAt(x, y);

        // Calculate the bounding box of the object
        const boundingBox = new Box3().setFromObject(object);
        const size = new Vector3();
        boundingBox.getSize(size);

        // Half the height of the object to adjust the position correctly
        const halfHeight = size.y / 2;

        // Place the object at (x, y, z), adjusting for its height
        object.position.set(x, z + halfHeight, y);

        // Calculate the bottom surface of the object based on its bounding box
        const bottomVertices = [
            new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z), // Bottom-left-back
            new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z), // Bottom-left-front
            new Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z), // Bottom-right-back
            new Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z)  // Bottom-right-front
        ];

        // Calculate the average normal based on the bottom vertices
        const normal = this.getAverageNormal(bottomVertices);

        // Align the object with the normal vector if one was found
        if (normal.length() > 0) {
            const up = new Vector3(0, 1, 0); // Y is typically up
            const quaternion = new Vector3().crossVectors(up, normal).normalize();
            const angle = Math.acos(up.dot(normal));

            // Rotate the object to align it with the normal
            object.quaternion.setFromAxisAngle(quaternion, angle);
        }
    }

    // New method to calculate the average normal based on provided vertices
    getAverageNormal(vertices) {
        const normals = [];
        for (const vertex of vertices) {
            // Retrieve normal for the vertex from Boden
            const normal = this.boden.getSurfaceNormal(vertex.x, vertex.y);
            if (normal) {
                normals.push(normal);
            }
        }

        // Average the normals
        const averageNormal = new Vector3();
        for (const normal of normals) {
            averageNormal.add(normal);
        }
        return averageNormal.normalize(); // Normalize to ensure it's a unit vector
    }
}
