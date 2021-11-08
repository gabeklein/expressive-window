import { Justified, Window } from '../..';

import Birds from './birds';

export class Grid extends Justified {
  items = Birds;
  rowSize = 300;
  gap = 10;
  overscan = 150;
  padding = [20, 20, 20, 20];

  getLength(){
    return this.items.length;
  }
}

const Image = ({ style, index }) => do {
  const { items } = Grid.tap();
  const { src } = items[index] || {};

  position: absolute;
  flexAlign: center;
  textAlign: center;
  font: 20;
  color: 0x777;
  backgroundColor: pink;
  backgroundPosition: center;
  backgroundSize: cover;
  backgroundImage: `url(${src})`;
  overflow: hidden;
  radius: 4;

  <this key={index} style={style}>
    {index}
  </this>
}

const Scrollable = () => do {
  Window: {
    overflow: scroll;
    fixed: 50, 10, 10, 10;
    outline: blue;
  } 

  <Window for={Grid} component={Image} />
}

export default Scrollable;