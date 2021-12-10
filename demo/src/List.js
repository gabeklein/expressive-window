import { Grid, Window } from "../..";

class List extends Grid {
  gap = 10;
  columns = 3;
  itemHeight = 40;
  overscan = 100;
  length = 100;

  extend(){
    const rows = [];
    let index = this.cache.length;
    let cursor = this.scrollArea;

    if(!this.areaY)
      return;

    while(index < this.length){
      const key = this.uniqueKey(index);
      const end = cursor + this.itemHeight;
  
      rows.push({
        index,
        key,
        start: cursor,
        end
      });

      cursor = end;
      index++;
    }

    return rows;
  }
}

const Item = ({ index, start }) => do {
  top: (start);
  left: 0;
  right: 0;
  height: 40;
  alignItems: center;
  radius: 5;
  padding: 0, 20;
  boxSizing: border-box;
  position: absolute;
  flexAlign: center;

  if(index % 2 !== 0)
    background: 0xf9f9f9;

  <this>Hello #{index}</this>
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