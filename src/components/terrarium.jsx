import React, { useState, useEffect } from 'react';

import Grid from './grid';
import { constructSimpleTerrain } from './../utils';
import { 
    refineWaterFormations,
    expandGrassGrowth
} from '../utils/terrain-refinement';
import { defaultTileset } from '../tileset';

const Terrarium = () => {
    const [width, height] = [84, 49];
    const [terrain, setTerrain] = useState(constructSimpleTerrain(width, height));
    
    // Component did mount
    useEffect(() => {
        const r1 = refineWaterFormations(terrain);
        const r2 = expandGrassGrowth(r1, width)
        setTerrain(r2);
    }, []);
    
    console.log(terrain);
    
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
