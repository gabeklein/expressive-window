import { Virtual, Window } from '@expressive/window';

import Birds from './birds';

class Grid extends Virtual {
  gap = 10;
  columns = 3;
  itemHeight = 150
  overscan = 100;
  items = Birds;
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