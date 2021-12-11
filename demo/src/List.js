import { Fixed, Window } from "../..";

class List extends Fixed {
  itemHeight = 40;
  overscan = 100;
  length = 100;
}

const Item = ({ index, offset, size }) => do {
  position: absolute;
  left: 0;
  right: 0;
  top: (offset);
  height: (size);
  alignItems: center;
  radius: 5;
  padding: 0, 20;
  boxSizing: border-box;
  flexAlign: center;

  if(index % 2 !== 0)
    background: 0xf9f9f9;

  <this>Hello #{index + 1}</this>
}

const Scrollable = () => do {
  Window: {
    overflow: scroll;
    fixed: 50, 10, 10, 10;
    outline: blue;
    padding: 20;
  } 

  <Window for={List} component={Item} />
}

export default Scrollable;