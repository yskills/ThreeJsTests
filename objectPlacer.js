import { Box3, DoubleSide, Vector3 } from 'three';
import { Boden } from './boden';
import { PlaneGeometry } from 'three';
import { MeshLambertMaterial } from 'three';
import { Mesh } from 'three';
import { Line } from 'three';
import { BufferGeometry } from 'three';
import { LineBasicMaterial } from 'three';

export class ObjectPlacer {
    constructor(boden, scene) {
        this.boden = boden;  // Reference to the Boden instance
        this.scene = scene;
    }

    placeObject(object, x, y) {
        // Get the bounding box of the object
        let boundingBox = new Box3().setFromObject(object);
        let size = new Vector3();
        boundingBox.getSize(size);

        let halfWidth = size.x / 2;
        let halfDepth = size.z / 2;

        // Get the Z-values at the bottom corners of the object
        const bottomPoints = this.getSamplePoints(x, y, halfWidth, halfDepth);
        const cornerPoints = this.getBottomPoints(x, y, halfWidth, halfDepth)
        // Calculate the surface normal using the points
        const normal = this.calculateNormal(cornerPoints);
        const samplePoints = this.getSamplePoints(x, y, halfWidth, halfDepth);
        // this.visualizeSamplePoints(samplePoints);
        // Align the object's up direction with the surface normal
        const up = new Vector3(0, 0, 1); // The object's current up direction
        const rotationAxis = new Vector3().crossVectors(up, normal).normalize(); // Axis of rotation
        const angle = Math.acos(up.dot(normal)); // Angle to rotate around the axis
        object.rotateOnWorldAxis(rotationAxis, angle);

        boundingBox = new Box3().setFromObject(object);
        size = new Vector3();
        boundingBox.getSize(size);

        halfWidth = size.x / 2;
        halfDepth = size.z / 2;

        // Visualize sample points
        const newSamplePoints = this.getSamplePoints(x, y, halfWidth, halfDepth)
        this.visualizeSamplePoints(newSamplePoints)
        // Get the heights at the bottom points of the object
        const intersectionHeights = bottomPoints.map(point => this.boden.getHeightAt(point.x, point.z));

        // Find the highest intersection point
        const highestIntersectionZ = Math.max(...intersectionHeights);

        // Determine the lowest Z-value of the object's bottom
        const objectLowestZ = boundingBox.min.y;


        // Move the object up to ensure it sits above the ground
        const heightAdjustment = highestIntersectionZ - objectLowestZ;
        object.position.set(x, object.position.y + heightAdjustment, y);

    }
    visualizeSamplePoints(samplePoints) {
        const points = samplePoints.map(point => new Vector3(point.x, point.y, point.z));
        const geometry = new BufferGeometry().setFromPoints(points);

        const material = new LineBasicMaterial({ color: 0xaafff0 }); // Light teal color
        const line = new Line(geometry, material);

        this.scene.add(line); // Add the line to the scene
    }


    // Method to get the Z-values for the bottom corners
    getBottomPoints(x, y, halfWidth, halfDepth) {
        return [
            new Vector3(x - halfWidth, this.boden.getHeightAt(x - halfWidth, y - halfDepth), y - halfDepth),  // Bottom-left
            new Vector3(x + halfWidth, this.boden.getHeightAt(x + halfWidth, y - halfDepth), y - halfDepth),  // Bottom-right
            new Vector3(x - halfWidth, this.boden.getHeightAt(x - halfWidth, y + halfDepth), y + halfDepth),  // Top-left
            new Vector3(x + halfWidth, this.boden.getHeightAt(x + halfWidth, y + halfDepth), y + halfDepth)   // Top-right
        ];
    }

    getSamplePoints(x, y, halfWidth, halfDepth) {
        const samplePoints = [];
        const sampleSpacing = 0.5; // Adjust spacing for density of samples


        for (let i = -halfWidth; i <= halfWidth; i += sampleSpacing) {
            for (let j = -halfDepth; j <= halfDepth; j += sampleSpacing) {
                const Vec = new Vector3(x + i, this.boden.getHeightAt(x + i, y + j), y + j);
                samplePoints.push(Vec);
            }
        }

        return samplePoints;
    }

    // Method to calculate the normal from sampled points
    calculateNormal(points) {
        const normal = new Vector3();
        for (let i = 0; i < points.length - 1; i++) {
            const edge1 = new Vector3().subVectors(points[i + 1], points[i]);
            const edge2 = new Vector3().subVectors(points[(i + 2) % points.length], points[i]);
            const faceNormal = new Vector3().crossVectors(edge1, edge2).normalize();
            normal.add(faceNormal);
        }
        return normal.normalize();  // Average normal
    }

}
