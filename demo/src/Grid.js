import { Grid, Window } from '../..';

import Birds from './birds';

class Images extends Grid {
  gap = 10;
  columns = 3;
  overscan = 100;
  items = Birds;

  length = this.items.length;
}

const Image = ({ style, index }) => {
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
  backgroundImage: `url(/birds/${src}.jpg)`;
  overflow: hidden;
  radius: 4;

  <this key={index} style={style}>
    {index}
  </this>
}

const Scrollable = () => {
  Window: {
    overflow: scroll;
    fixed: 50, 10, 10, 10;
    outline: blue;
    padding: 20;
  } 

  <Window for={Images} component={Image} />
}

export default Scrollable;