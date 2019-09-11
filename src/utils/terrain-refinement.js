import { extractIndicesForType } from './index';
import { TERRAIN_ENUM } from '../constants';


export const sampleNorth = (i, width, terrain) => {
    const northIndex = Math.max(i - width, -1);
    // If out of range, return dirt as the default
    if(northIndex < 0) { return TERRAIN_ENUM.DIRT; }
    
    return terrain[northIndex];
};

export const sampleSouth = (i, width, terrain) => {
    const southIndex = i + width;
    
    if(southIndex > terrain.length) { return TERRAIN_ENUM.DIRT; }
    
    return terrain[southIndex];
};

export const sampleEast = (i, width, terrain) => {
    const eastIndex = i + 1;
    
    if(eastIndex > terrain.length) { return TERRAIN_ENUM.DIRT; }
    
    return terrain[eastIndex];
};

export const sampleWest = (i, width, terrain) => {
    const westIndex = i - 1;
    if(westIndex < 0) { return TERRAIN_ENUM.DIRT; }
    
    return terrain[westIndex];
}

export const sampleAdjacentsFor = (terrain, width, currentIndex, terrainType) => {
    const n = sampleNorth(currentIndex, width, terrain) === terrainType;
    const e = sampleEast(currentIndex, width, terrain) === terrainType;
    const s = sampleSouth(currentIndex, width, terrain) === terrainType;
    const w = sampleWest(currentIndex, width, terrain) === terrainType;
    return n + e + s + w;
};

export const refineWaterFormations = (terrain, width) => {
    // Water without 2 adjacent water, becomes dirt.
    const refinedTerrain = terrain.map((tile, i) => {
        const adjacentWater = sampleAdjacentsFor(terrain, width, i, TERRAIN_ENUM.WATER);
        
        if(adjacentWater < 1) {
            return TERRAIN_ENUM.DIRT;
        }
        
        return tile;
    });
    
    return refinedTerrain;
};


// Grow additional grass if:
    // 2 adjacent tiles are grass
    // 1 adjacent is grass and another is water.
export const expandGrassGrowth = (terrain, width) => {
    const starts = extractIndicesForType(terrain, TERRAIN_ENUM.GRASS);

    while(starts.length > 0) {
        const source = starts.pop();
        
        const candidates = [
            source - width,
            source + 1,
            source + width,
            source - 1
        ];
        
        const validCandidates = candidates.reduce((acc, i) => {
            // If a candidate is out of range or not growable soil, skip.
            if(i > terrain.length || i < 0) { return acc; }
            if(terrain[i] !== TERRAIN_ENUM.DIRT) { return acc; }
            
            acc.push(i);
            return acc;        
        }, []);
        
        validCandidates.map(i => {
           const adjacentGrass = sampleAdjacentsFor(terrain, width, i, TERRAIN_ENUM.GRASS);
           const adjacentWater = sampleAdjacentsFor(terrain, width, i, TERRAIN_ENUM.WATER);
           
           if(adjacentGrass > 2 || (adjacentGrass > 0 && adjacentWater > 0)) {
               terrain[i] = TERRAIN_ENUM.GRASS;
               starts.push(i);
           }
        });
    };
    
    return terrain;
};