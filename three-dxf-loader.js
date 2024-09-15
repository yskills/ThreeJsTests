import * as THREE from 'three';
import { DXFLoader } from 'three-dxf-loader';
import { FontLoader } from 'three/examples/jsm/Addons.js';

class DxfElement {
    /**
     * Creates an instance of DxfElement.
     * @param {THREE.Scene} scene - The Three.js scene to which the DXF entities will be added.
     * @param {string} filePath - The filePath which will be loaded by the DXFLoader. 
    * @param {Object} options - Optional parameters for configuring the DXFLoader.
     * @param {number} options.defaultColor - The default color for DXF entities (default: 0x000000).
     * @param {boolean} options.consumeUnits - Whether to use units from the DXF file (default: true).
     */
    constructor(scene, options = {}) {
        if (!scene) {
            throw new Error("A THREE.Scene instance is required.");
        }
        this.scene = scene;
        this.root = scene;
        this.options = options;
        this.entity = null;
        this.innit();
    }

    async innit() {

        this.loader = new DXFLoader();
        const fontLoader = new FontLoader();
        fontLoader.load("fonts/helvetiker_regular.typeface.json",(font)=>{
            this.loader.setFont(font);
        });

        // // Configure the loader with optional parameters
        // this.defaultColor = this.options.defaultColor || 0x000000;
        this.consumeUnits = this.options.consumeUnits !== undefined ? this.options.consumeUnits : true;

        // this.loader.setDefaultColor(this.defaultColor); // Default color for DXF entities
        this.loader.setConsumeUnits(this.consumeUnits); // Use units from the DXF file

    }

    /**
     * Loads a DXF file and initializes the entity.
     * @param {string} filePath - The path to the DXF file.
     * @returns {Promise} A promise that resolves with the loaded DXF entity or rejects with an error.
     */
    async load(filePath) {
        let scope = this;
        return new Promise((resolve, reject) => {
            this.loader.load(filePath, (data) => {
                if (data && data.entity) {
                    scope.entity = data.entity;
                    resolve(data.entity);
                } else {
                    reject(new Error('No entities found in DXF file.'));
                }
            }, undefined, (error) => {
                reject(error);
            });
        });
    }

    /**
     * Adds the DXF entity to the scene.
     */
    addToScene() {
        if (this.entity) {
            this.root.add(this.entity);
        } else {
            console.error('No DXF entity to add to the scene.');
        }
    }

    /**
     * Removes the DXF entity from the scene.
     */
    removeFromScene() {
        if (this.entity) {
            this.root.remove(this.entity);
        } else {
            console.error('No DXF entity to remove from the scene.');
        }
    }

    /**
     * Moves the DXF entity by the specified x, y, z values.
     * @param {number} x - The x value to move by.
     * @param {number} y - The y value to move by.
     * @param {number} z - The z value to move by.
     */
    move(x, y, z) {
        if (this.entity) {
            this.entity.position.set(x, y, z);
        } else {
            console.error('No DXF entity to move.');
        }
    }
    /**
     * Moves the DXF entity to the origin (0, 0, 0).
     */
    moveToOrigin() {
        if (this.entity) {
            // Calculate the bounding box of the entity
            const boundingBox = new THREE.Box3().setFromObject(this.entity);

            // Calculate the center of the bounding box
            const center = boundingBox.getCenter(new THREE.Vector3());

            // Adjust the position of the entity to move the center to the origin
            this.entity.position.set(
                this.entity.position.x - center.x,
                this.entity.position.y - center.y,
                this.entity.position.z + 100 - center.z
            );

            // Recalculate the bounding box after the position change
            boundingBox.setFromObject(this.entity);

        } else {
            console.error('No DXF entity to move.');
        }
    }
    /**
 * Creates a BoxHelper for the DXF entity and adds it to the scene.
 */
    createBoxHelper() {
        if (this.entity) {
            // Remove any existing BoxHelper
            this.removeBoxHelper();

            // Create a BoxHelper
            this.boxHelper = new THREE.BoxHelper(this.entity, 0xffff00); // Yellow color
            this.root.add(this.boxHelper);
        }
    }
    toggleBoxHelper() {
        if (!this.boxHelper) {
            this.createBoxHelper();
        }
        else {
            this.boxHelper.visible = !this.boxHelper.visible;
        }

    }
    /**
     * Removes the BoxHelper from the scene.
     */
    removeBoxHelper() {
        if (this.boxHelper) {
            this.root.remove(this.boxHelper);
            this.boxHelper = null;
        }
    }
}

export { DxfElement };

class DxfLoaderManager {
    constructor(scene) {
        if (!scene) {
            throw new Error("A THREE.Scene instance is required.");
        }
        this.scene = scene;
        this.elements = [];
        this.elementMap = {};
    }

    /**
     * Loads multiple DXF files and adds their entities to the scene.
     * @param {Array<string>} filePaths - An array of file paths to the DXF files.
     * @returns {Promise} A promise that resolves when all DXF files are loaded.
     */
    async loadFiles(filePaths) {
        const promises = filePaths.map(async filePath => {
            const element = new DxfElement(this.scene);
            const entity = await element.load(filePath);
            this.elements.push(element);
            this.elementMap[entity.uuid] = element;
        });
        return Promise.all(promises);
    }

    /**
     * Adds all DXF elements to the model.
     */
    addElementsToModel() {
        this.elements.forEach(element => {
            element.addToScene();
        });
    }

    /**
     * Moves all DXF elements to the origin (0, 0, 0).
     */
    moveElementsToZero() {
        this.elements.forEach(element => {
            element.moveToOrigin();
        });
    }

    /**
     * Adds a new DXF element to the scene.
     * @param {string} filePath - The path to the DXF file.
     * @param {Object} options - Optional parameters for configuring the DXFLoader.
     * @returns {Promise} A promise that resolves with the loaded DXF entity.
     */
    async addElement(filePath, options = {}) {
        const element = new DxfElement(this.scene, options);
        const entity = await element.load(filePath);
        this.elements.push(element);
        this.elementMap[entity.uuid] = element;
        return entity;
    }

    /**
     * Toggles the visibility of BoxHelpers for all DXF elements.
     */
    toggleBoxHelpers() {
        this.elements.forEach(element => {
            element.toggleBoxHelper();
        });
    }

    /**
     * Removes a specific DXF element by index.
     * @param {number} index - The index of the DXF element to remove.
     */
    removeElementByIndex(index) {
        if (this.elements[index]) {
            this.elements[index].removeFromScene();
            delete this.elementMap[this.elements[index].entity.uuid];
            this.elements.splice(index, 1);
        } else {
            console.error(`No DXF element found at index ${index}`);
        }
    }

    /**
     * Removes a specific DXF element by UUID.
     * @param {string} uuid - The UUID of the DXF element to remove.
     */
    removeElementByUUID(uuid) {
        const element = this.elementMap[uuid];
        if (element) {
            element.removeFromScene();
            const index = this.elements.indexOf(element);
            if (index !== -1) {
                this.elements.splice(index, 1);
            }
            delete this.elementMap[uuid];
        } else {
            console.error(`No DXF element found with UUID ${uuid}`);
        }
    }

    /**
     * Retrieves a DXF element by index.
     * @param {number} index - The index of the DXF element.
     * @returns {DxfElement|null} The DXF element at the specified index or null if not found.
     */
    getElementByIndex(index) {
        return this.elements[index] || null;
    }

    /**
     * Retrieves a DXF element by UUID.
     * @param {string} uuid - The UUID of the DXF element.
     * @returns {DxfElement|null} The DXF element with the specified UUID or null if not found.
     */
    getElementByUUID(uuid) {
        return this.elementMap[uuid] || null;
    }
}

export { DxfLoaderManager };
