import Model, { get, ref } from '@expressive/mvc';

interface Direction {
  readonly sizeX: "width" | "height";
  readonly sizeY: "width" | "height";
  readonly fromX: "left" | "top";
  readonly fromY: "left" | "top"; 
  readonly scrollX: "scrollTop" | "scrollLeft";
}

const MODE_DOWN = Object.freeze({
  sizeX: "height",
  sizeY: "width",
  fromX: "top",
  fromY: "left",
  scrollX: "scrollTop"
} as const);

const MODE_RIGHT = Object.freeze({
  sizeX: "width",
  sizeY: "height",
  fromX: "left",
  fromY: "top",
  scrollX: "scrollLeft"
} as const);

export type Frame = [
  offset: number | string,
  size: number | string
]

export interface Item {
  index: number;
  offset: number;
  size: number;
}

export type Type<T extends Controller> =
  ReturnType<T["getItem"]>;

abstract class Controller extends Model {
  /** Reference to the container element. */
  container = ref(this.observeContainer);

  /** Range of indicies visible in window. */
  range = get(() => this.getVisibleRange);

  slice = get(this, state => {
    const [ start, end ] = state.range;
    const items = [];

    if(end > start)
      for(let i = start; i <= end; i++)
        items.push(this.getItem(i));

    return items as Type<this>[];
  });

  DOM = get(this, (state): Direction => {
    return state.horizontal ? MODE_RIGHT : MODE_DOWN;
  })

  /** Space available for visible elements on-axis. */
  areaX = 0;
  /** Space available for visible elements off-axis. */
  areaY = 0;
  /** Current scroll offset. */
  offset = 0;
  /** Total area of scrollable content. */
  size = 0;

  maintain = false;
  horizontal = false;

  abstract getItem(index: number): Item;
  abstract getVisibleRange(): readonly [number, number];

  observeContainer(element: HTMLElement | null){
    if(!element)
      return;
  
    let { maintain, DOM } = this;
    let scrollOffset = 0;
  
    const content = element.firstChild as HTMLDivElement;
  
    const getSize = () => {
      if(maintain)
        window.requestAnimationFrame(getSize);
  
      const outerRect = element.getBoundingClientRect();
      const innerRect = content.getBoundingClientRect();
  
      scrollOffset = outerRect.top - innerRect.top;
  
      this.areaX = outerRect[DOM.sizeX];
      this.areaY = innerRect[DOM.sizeY];
    }
  
    const getOffset = () => {
      this.offset = element[DOM.scrollX] + scrollOffset;
    }
  
    getSize();
    getOffset();
  
    element.addEventListener("scroll", getOffset, {
      capture: false, passive: true
    });
  
    return () => {
      maintain = false;
      element.removeEventListener("scroll", getOffset);
    }
  }
}

export default Controller;