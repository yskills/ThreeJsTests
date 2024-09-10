import DxfParser from 'dxf-parser';
import fs from 'fs/promises'; // Use promises API for cleaner async handling

class DXFParser {
  constructor() {
    this.parser = new DxfParser();
  }

  // Method to load from a URL
  async loadFromUrl(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch the DXF file from the URL: ${url}`);
      }
      const dxfString = await response.text();
      return this.loadFromString(dxfString);
    } catch (error) {
      console.error('Error loading DXF from URL:', error);
      return null;
    }
  }

  // Method to load from a file path
  async loadFromFilePath(filePath) {
    try {
      const dxfString = await fs.readFile(filePath, 'utf-8');
      return this.loadFromString(dxfString);
    } catch (error) {
      console.error(`Error reading DXF file from path: ${filePath}`, error);
      return null;
    }
  }

  // Method to load from a raw DXF string
  loadFromString(dxfString) {
    try {
      const dxfData = this.parser.parseSync(dxfString);
      console.log('DXF data parsed successfully');
      return dxfData;
    } catch (error) {
      console.error('Error parsing DXF string:', error);
      return null;
    }
  }

  // Method to save parsed data to JSON file (optional feature)
  async saveToJsonFile(data, outputPath) {
    try {
      await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
      console.log(`Parsed data saved to ${outputPath}`);
    } catch (error) {
      console.error(`Error writing JSON to file: ${outputPath}`, error);
    }
  }
}

export { DXFParser }

