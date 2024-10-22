import { Box3, Vector3, BufferGeometry, Line, LineBasicMaterial, Float32BufferAttribute, Mesh, MeshLambertMaterial, DoubleSide } from 'three';
import Delaunator from 'delaunator';  // For Delaunay triangulation
import { Points } from 'three';
import { PointsMaterial } from 'three';

export class ObjectPlacer {
    constructor(boden, scene) {
        this.boden = boden;  // Boden instance for terrain height
        this.scene = scene;  // js scene for visualization
    }

    // Places the object at the given (x, y) and gathers sample points across its bottom surface
    placeObject(object, x, y) {
        // Set object position first (without adjustment)
        object.position.set(x, object.position.y, y);

        // Get the bounding box of the object to calculate its size
        const boundingBox = new Box3().setFromObject(object);
        const size = new Vector3();
        boundingBox.getSize(size);

        const halfWidth = size.x / 2;
        const halfDepth = size.z / 2;

        // Get all the sample points across the bottom surface
        const samplePoints = this.getSamplePoints(x, y, halfWidth, halfDepth);

        // Visualize the sample points
        this.visualizeSamplePoints(samplePoints);

        // Further height adjustments or calculations will follow (not done here yet)
        // This can be added after visualizing.
    }

    // Visualizes the sample points using lines (connects them with lines for clarity)
    visualizeSamplePoints(samplePoints) {
        var geom = new BufferGeometry().setFromPoints(samplePoints);
        var cloud = new Points(
          geom,
          new PointsMaterial({ color: 0x99ccff, size: 2 })
        );
        // this.scene.add(cloud);
        
        // triangulate x, z
        var indexDelaunay = Delaunator.from(
          samplePoints.map(v => {
            return [v.x, v.z];
          })
        );
        
        var meshIndex = []; // delaunay index => js index
        for (let i = 0; i < indexDelaunay.triangles.length; i++){
          meshIndex.push(indexDelaunay.triangles[i]);
        }
        
        geom.setIndex(meshIndex); // add js index to the existing geometry
        geom.computeVertexNormals();
        var mesh = new Mesh(
          geom, // re-use the existing geometry
          new MeshLambertMaterial({ color: "green", wireframe: false })
        );
        this.scene.add(mesh);
        
    }

    // Generate sample points across the bottom surface of the object
    getSamplePoints(x, y, halfWidth, halfDepth) {
        const samplePoints = [];
        const sampleSpacing = 1;  // Adjust this for density of points
        for (let i = -halfWidth; i <= halfWidth; i += sampleSpacing) {
            for (let j = -halfDepth; j <= halfDepth; j += sampleSpacing) {
                // Get height for each sample point based on Boden terrain
                const samplePoint = new Vector3(x + i, this.boden.getHeightAt(x + i, y + j), y + j);
                samplePoints.push(samplePoint);
            }
        }
        return samplePoints;
    }
}
