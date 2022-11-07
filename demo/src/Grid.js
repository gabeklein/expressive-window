import { Grid, Window } from '../..';

import Birds from './birds';

class Images extends Grid {
  gap = 10;
  columns = 4;
  overscan = 100;
  items = Birds;

  length = this.items.length;
}

const Image = (props) => {
  const {
    index,
    offset,
    column,
    context,
    width,
    size
  } = props;

  const { src } = context.items[index];

  position: absolute;
  top: (offset);
  left: `${column * width}%`;
  width: `${width}%`;
  height: (size);

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

  <this key={index}>
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