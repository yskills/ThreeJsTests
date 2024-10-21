import { Box3, Vector3 } from 'three';

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
    }
}
