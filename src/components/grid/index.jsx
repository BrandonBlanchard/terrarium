import React from 'react';

import Tile from '../tile/index';

import './style.scss';

const Grid = (props) => {
    const { terrain, width, tileset } = props;
    
    const map = terrain.reduce((acc, val, i) => {
         acc.push(<Tile width={width} index={i} type={val} {...props}  key={i} />);
         
         return acc;
    }, []);
    
    const gridStyles = {
        gridTemplateColumns: `repeat(${width}, 1fr)`
    };
    
    return (
        <div className='grid' style={gridStyles}>
            { map }
        </div>  
    );
};

export default Grid;