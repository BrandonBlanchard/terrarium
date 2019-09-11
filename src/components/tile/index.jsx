import React from 'react';
import './style.scss';

const Tile = (props) => {
    const { tileset, type } = props;
    
    const x = -tileset.spriteSize * tileset[type][0];
    const y = -tileset.spriteSize * tileset[type][1];
    
    const styles = {
        backgroundImage: `url(${tileset.sprite})`,
        'backgroundPosition': `${x}px ${y}px`
    };
    
    return (<div className='tile' style={styles}></div>);
};

export default Tile;
