import { Noise } from 'noisejs';
import { TERRAIN_COUNT } from '../constants';

export const constructDirtTerrain = (width, height) => new Float32Array(width * height).fill(0);

export const constructSimpleTerrain = (width, height)  => {
    const sampleSpacing = 2048;
    const terrain = new Float32Array(width * height);
    const noise = new Noise(Math.random());
    const widthPlusOne = width + 1;
    
    terrain.map((val, i) => {
        const x = Math.floor(i % widthPlusOne) + Math.floor(i / widthPlusOne);
        const y = Math.floor(i / widthPlusOne) * sampleSpacing;
        
        const rawTerrainVal = Math.abs(noise.simplex2(x, y));
        terrain[i] = (rawTerrainVal * TERRAIN_COUNT).toFixed(0);
    });
    
    return terrain;
};

// Returns a list of indices where the terrain type is targetType
export const extractIndicesForType = (terrain, targetType) => terrain.reduce((acc, tile, i) => { 
    if(tile === targetType) {
        acc.push(i)
    }
    
    return acc;
}, []);