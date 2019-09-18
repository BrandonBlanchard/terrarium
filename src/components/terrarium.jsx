import React, { useState, useEffect, useRef } from 'react';

import Grid from './grid';
import {
    constructSimpleTerrain,
    getNoiseMap
} from './../utils';
import { 
    refineWaterFormations,
    expandGrassGrowth,
    createLakes,
    spotCleanTerrain
} from '../utils/terrain-refinement';
import { defaultTileset } from '../tileset';
import { TERRAIN_ENUM } from '../constants';

const Terrarium = () => {
    const [width, height] = [84, 49];
    const waterMap = useRef(getNoiseMap());
    const terrainMap = useRef(getNoiseMap());
    const [terrain, setTerrain] = useState(constructSimpleTerrain(width, height, terrainMap.current));
    
    // Component did mount
    useEffect(() => {
        const r1 = createLakes(terrain, width, waterMap.current);
        const r2 = refineWaterFormations(r1, width);
        const r3 = expandGrassGrowth(r2, width);
        const r4 = spotCleanTerrain(r3, width, TERRAIN_ENUM.WATER, 2);
        const r5 = spotCleanTerrain(r4, width, TERRAIN_ENUM.DIRT, 1);
        setTerrain(r5);
    }, []);
    
    const gridProps = {
        terrain,
        width
    };
    
    return (
          <div className='terrarium'>
              <Grid {...gridProps} tileset={defaultTileset}/>
          </div>
    );
};

export default Terrarium;
