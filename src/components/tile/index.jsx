import React from 'react';
import './style.scss';

import { getTileEncoding } from '../../utils';
import { TERRAIN_ENUM } from '../../constants';

const Tile = (props) => {
    const { 
        tileset,
        type,
        index,
        width,
        terrain 
    } = props;
    
    const encoding = getTileEncoding(index, width, terrain);
    
    const styles = {
        background: `url(/tilesets/rpg/${encoding}.png), url(${tileset[type]})`
    };
    
    return (<div className='tile' style={styles}></div>);
};

export default Tile;
