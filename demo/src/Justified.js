import { Justified, Window } from '../..';

import Birds from './birds';

export class Images extends Justified {
  items = Birds;
  rowSize = 300;
  overscan = 150;
  gap = 10;

  getLength(){
    return this.items.length;
  }
}

const Image = ({ style, index }) => do {
  const { items } = Images.tap();
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
    padding: 20;
  } 

  <Window for={Images} component={Image} />
}

export default Scrollable;