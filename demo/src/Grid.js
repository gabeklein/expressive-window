import { Grid, Window } from '../..';

import Birds from './birds';

class Images extends Grid {
  gap = 10;
  columns = 3;
  itemHeight = 150
  overscan = 100;
  items = Birds;

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