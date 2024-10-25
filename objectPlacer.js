import { Box3, Vector3, BufferGeometry, Line, LineBasicMaterial, Points, PointsMaterial, Mesh, MeshLambertMaterial } from 'three';
import Delaunator from 'delaunator';  // For Delaunay triangulation if needed
import { Matrix, EigenvalueDecomposition } from 'ml-matrix';  // Import ml-matrix for eigen decomposition
import { Quaternion } from 'three';

export class ObjectPlacer {
  constructor(boden, scene) {
    this.boden = boden;  // Boden instance for terrain height
    this.scene = scene;  // Scene for visualization


    // Store original rotation values (in radians)
    this.originalRotation = new Vector3();  // Adjust based on your object's rotation type
  }

  // Places the object at the given (x, y) on the terrain
  async placeObject(object, x, y) {
    //make object look up
    // Reset rotation to original
    object.rotation.set(this.originalRotation.x, this.originalRotation.y, this.originalRotation.z);

    // Set initial object position
    object.position.set(x, object.position.y, y);

    // Get bounding box of the object to calculate size
    const boundingBox = new Box3().setFromObject(object);
    const size = new Vector3();
    boundingBox.getSize(size);

    const halfWidth = size.x / 2;
    const halfDepth = size.z / 2;

    // Collect sample points from the terrain
    const samplePoints = await this.getSamplePoints(x, y, halfWidth, halfDepth);

    // Compute the best-fit plane for the sample points
    const { normal, centroid } = await this.computeBestFitPlane(samplePoints);

    // Align the object to the best-fit plane
    this.alignObjectToPlane(object, normal, centroid);

    // Optionally, visualize the sample points
    this.visualizeSamplePoints(samplePoints);
  }


  // Computes the best-fit plane for a set of 3D points
  async computeBestFitPlane(samplePoints) {
    // Compute the centroid (average position) of the points
    let centroid = new Vector3();
    samplePoints.forEach(point => centroid.add(point));
    centroid.divideScalar(samplePoints.length);

    // Center the points around the centroid
    const centeredPoints = samplePoints.map(point => point.clone().sub(centroid));

    // Compute covariance matrix from centered points
    let covarianceMatrix = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; // 3x3 matrix
    centeredPoints.forEach(p => {
      covarianceMatrix[0][0] += p.x * p.x;
      covarianceMatrix[0][1] += p.x * p.y;
      covarianceMatrix[0][2] += p.x * p.z;
      covarianceMatrix[1][1] += p.y * p.y;
      covarianceMatrix[1][2] += p.y * p.z;
      covarianceMatrix[2][2] += p.z * p.z;
    });
    covarianceMatrix[1][0] = covarianceMatrix[0][1];
    covarianceMatrix[2][0] = covarianceMatrix[0][2];
    covarianceMatrix[2][1] = covarianceMatrix[1][2];

    // Perform eigenvalue decomposition using ml-matrix
    const matrix = new Matrix(covarianceMatrix);
    var e = new EigenvalueDecomposition(matrix);
    var realEigenValues = e.realEigenvalues;
    var eigenVectors = e.eigenvectorMatrix.data;

    // Get the normal vector as the eigenvector with the smallest eigenvalue
    const minIndex = realEigenValues.indexOf(Math.min(...realEigenValues));
    let normal = new Vector3(
      eigenVectors[0][minIndex],
      eigenVectors[1][minIndex],
      eigenVectors[2][minIndex]
    ).normalize();

    // Ensure normal points upwards by checking y-component
    if (normal.y < 0) normal.negate();

    return { normal, centroid };
  }


  // Aligns the object to the plane defined by the given normal and centroid
  alignObjectToPlane(object, normal, centroid) {
    // Object's original up vector
    const upVector = new Vector3(0, 1, 0);

    // Get the bounding box of the object to adjust its height properly
    const boundingBox = new Box3().setFromObject(object);
    const size = new Vector3();
    boundingBox.getSize(size);

    // Compute quaternion to rotate object up vector to align with plane normal
    const quaternion = new Quaternion().setFromUnitVectors(upVector, normal);

    // Apply the rotation to the object
    object.quaternion.premultiply(quaternion);

    // Calculate the offset to move the object along the normal
    // Offset is calculated using the normal vector scaled by half the height of the object
    const offset = normal.clone().normalize().multiplyScalar(size.y / 2);
    // Set the object's position to the centroid plus the calculated offset
    object.position.copy(centroid).add(offset);
  }


  // Visualize the sample points in the scene (optional)
  visualizeSamplePoints(samplePoints) {
    const geometry = new BufferGeometry().setFromPoints(samplePoints);
    const points = new Points(geometry, new PointsMaterial({ color: 0x99ccff, size: 1 }));
    this.scene.add(points);
  }

  // Generate sample points across the object's bottom surface based on terrain height
  async getSamplePoints(x, y, halfWidth, halfDepth) {
    const samplePoints = [];
    const sampleSpacing = 0.5;  // Adjust for density of sample points

    for (let i = -halfWidth; i <= halfWidth; i += sampleSpacing) {
      for (let j = -halfDepth; j <= halfDepth; j += sampleSpacing) {
        const samplePoint = new Vector3(
          x + i,
          this.boden.getHeightAt(x + i, y + j),  // Query height from the Boden class
          y + j
        );
        samplePoints.push(samplePoint);
      }
    }

    return samplePoints;
  }
}
