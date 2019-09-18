import { extractIndicesForType, getTileEncoding } from './index';
import { TERRAIN_ENUM, COMPASS } from '../constants';


export const sampleNorth = (i, width, terrain) => {
    const northIndex = Math.max(i - width, -1);
    // If out of range, return dirt as the default
    if(northIndex < 0) { return TERRAIN_ENUM.GRASS; }
    
    return terrain[northIndex];
};

export const sampleSouth = (i, width, terrain) => {
    const southIndex = i + width;
    
    if(southIndex > terrain.length) { return TERRAIN_ENUM.GRASS; }
    
    return terrain[southIndex];
};

export const sampleEast = (i, width, terrain) => {
    const eastIndex = i + 1;
    
    if(eastIndex > terrain.length) { return TERRAIN_ENUM.GRASS; }
    
    return terrain[eastIndex];
};

export const sampleWest = (i, width, terrain) => {
    const westIndex = i - 1;
    if(westIndex < 0) { return TERRAIN_ENUM.GRASS; }
    
    return terrain[westIndex];
}

export const isInbounds = (terrain, index) => {
    if(index < terrain.length && index > 0) {
        return true;
    }
    
    return false;
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
        
        if(adjacentWater < 2) {
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
            if(i > terrain.length) { return acc; }
            if(terrain[i] !== TERRAIN_ENUM.DIRT) { return acc; }
            
            acc.push(i);
            return acc;        
        }, []);
        
        validCandidates.map(i => {
           const adjacentGrass = sampleAdjacentsFor(terrain, width, i, TERRAIN_ENUM.GRASS);
           const adjacentWater = sampleAdjacentsFor(terrain, width, i, TERRAIN_ENUM.WATER);
           terrain[i] = TERRAIN_ENUM.GRASS;
           
           // If next to 2grass, 1 water, or 1 grass and 1 water grow!
           if(adjacentGrass > 2 || adjacentWater > 0) {
               starts.push(i);
           }
        });
    };
    
    return terrain;
};

// Returns a vector moving in the direction of the given compass direction.
export const compassDirectionToVector = (direction, width) => {
    switch(direction) {
        case COMPASS.NORTH:
            return -width;
        case COMPASS.SOUTH:
            return width;
        case COMPASS.EAST:
            return 1;
        case COMPASS.WEST:
            return -1;
        default:
            return 0;
    }
};

// Creates a 3xDistance patch of the given terrain type heading in direction
export const createTractInDirection = (terrain, width, lakeStart, direction, distance, type) => {
    const directionVector = compassDirectionToVector(direction, width);
    const spreadVector = direction === COMPASS.NORTH || direction === COMPASS.SOUTH ? 1 : width;
    
    /* Assuming a direction of east and a distance of 4 this should fill in a section
    *  [ ][ ][ ][ ][ ][ ]
    *  [ ][x][x][x][x][ ]
    *  [ ][x][x][x][x][ ]
    *  [ ][x][x][x][x][ ]
    *  [ ][ ][ ][ ][ ][ ]
    */

    for(let i = 0; i <= distance; i += 1 ) {
        const nextCell = lakeStart + directionVector * i;
        const leftCell = nextCell + spreadVector;
        const rightCell = nextCell - spreadVector;
    
        if (isInbounds(terrain, nextCell)) {
            terrain[nextCell] = type;
        }
        
        if (isInbounds(terrain, leftCell)) {
            terrain[leftCell] = type;
        }
        
        if(isInbounds(terrain, rightCell)) {
            terrain[rightCell] = type;
        }
    }
    
    return terrain;
};

export const createLake = (terrain, width, lakeIndex) => {
    const max = 5;
    // A lake extends between 1 and 4 grid spaces along each cardinal direction (north, west, south, east, respectively)
    const lengthForCardinalDirections = [
        Math.ceil(Math.random() * max),
        Math.ceil(Math.random() * max),
        Math.ceil(Math.random() * max),
        Math.ceil(Math.random() * max)
    ];
    
    const t1 = createTractInDirection(terrain.slice(), width, lakeIndex, COMPASS.NORTH, lengthForCardinalDirections[0], TERRAIN_ENUM.WATER); 
    const t2 = createTractInDirection(t1, width, lakeIndex, COMPASS.EAST, lengthForCardinalDirections[1], TERRAIN_ENUM.WATER);
    const t3 = createTractInDirection(t2, width, lakeIndex, COMPASS.SOUTH, lengthForCardinalDirections[2], TERRAIN_ENUM.WATER);
    const t4 = createTractInDirection(t3, width, lakeIndex, COMPASS.WEST, lengthForCardinalDirections[3], TERRAIN_ENUM.WATER);
    
    return t4;
};

export const createLakes = (terrain, width, waterMap) => {
    const waterSampleSpacing = 2400;
    const widthPlusOne = width + 1;
    const threshold = 0.95;
    
    const lakeSources = terrain.reduce((acc, value, i) => {
        const x = Math.floor(i % widthPlusOne) + Math.floor(i / widthPlusOne);
        const y = Math.floor(i / widthPlusOne) * waterSampleSpacing;
        
        if(waterMap.simplex2(x,y) > threshold) {
            acc.push(i);
        }
        
        return acc;
    }, []);
    
    const terrainWithLakes = lakeSources.reduce((terrainAcc, val) => createLake(terrainAcc, width, val), terrain.slice());
    
    
    return terrainWithLakes;
};

// Changes any tile that does not have at least {threshold} adjacent neighbors
// The tile is replaced so that it matches either the east or west tile.
export const spotCleanTerrain = (terrain, width, typeToRemove, threshold) => {
    const newTerrain = terrain.map((type, i, refinedTerrain) => {
        if(type !== typeToRemove) { return type; }
        
        const adjacentMatches = sampleAdjacentsFor(terrain, width, i, typeToRemove);
        
        if(adjacentMatches < threshold) {
            const tEncoding = getTileEncoding(i, width, terrain).split('');
            
            const occurrenceByIndex = tEncoding.reduce((acc, val) => {
                if (acc[val]) { 
                    acc[val] += 1;
                } else {
                    acc[val] = 1;
                }
                
                return acc;
            }, []);
            
            const { index: newType } = occurrenceByIndex.reduce((acc, val, index) => {
                if(val > acc.val) {
                    return {val, index};
                }
                
                return acc;
            }, { val: -1, index: -1 });
            
            return newType; 
        }
        
        return type;
    });
    
    return newTerrain;
}