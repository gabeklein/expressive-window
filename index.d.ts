import { FC, CSSProperties } from "react";
import VC from "react-use-controller";

declare namespace Virtual {
  interface Item {
    index: number;
    key: number | string;
    start: number
    end: number
  }

  type Axis =
  | ["width", "height"]
  | ["height", "width"]

  interface ComponentProps {
    index: number;
    style: CSSProperties;
  }
  
  interface ContainerProps {
    component: FC<ComponentProps>;
    style?: CSSProperties;
    className?: string;
  } 
}

declare class Virtual<P extends Virtual.Item> extends VC {
  public Window: FC<Virtual.ContainerProps>;
  static Window: FC<Virtual.ContainerProps>;

  /** Current size of virtual collection */
  length: number;

  /** 
   * Amount of padding between container and first item. (In pixels)
   * 
   * Default: 0;
   * */
  paddingStart: number;

  /** 
   * Amount of padding between container and last item. (In pixels)
   * 
   * Default: 0;
   * */
  paddingEnd: number;

  /** 
   * List should scroll horizontally.
   * 
   * Default: false;
   * */
  horizontal: boolean;

  readonly axis: Virtual.Axis;
  readonly visibleRange: [number, number];
  readonly itemsVisible: number;

  /** Apply this reference to container element! */
  readonly container: {
    current: HTMLElement | null;
  }

  /** Index and computed postion of all drawn containers */
  readonly render: P[];

  readonly totalSize: number;

  readonly end: boolean;

  didReachEnd?(): void;

  /** 
   * Convert position index into unique key of a target list item.
   * Useful if items have unique IDs and reshuffling may occure.
   * 
   * May be overridden; returns index argument by default.
   */
  uniqueKey(forIndex: number): string | number;

  /** Programatically scroll to specific offset. */
  gotoOffset(toOffset: number, opts: any): void;

  /** Programatically scroll to specific item by index. */
  gotoIndex(index: number, opts?: any): void;
}

declare namespace Linear {
  interface Row extends Virtual.Item {
    ref: (element: HTMLElement) => void;
    size: number;
  } 
}

declare class Linear extends Virtual<Linear.Row> {
  /**
   * Number of items to render past container bounds
   * 
   * Default: 0;
   * */
  overscan: number;

  /** Determines initial size to allocate before rendering a list element. */
  estimateSize?(forIndex: number): number;

  readonly render: Linear.Row[];
}

declare namespace Grid {
  interface Item extends Virtual.Item {
    start: number;
    end: number;
    column: number;
    offset: number;
    size: [number, number];
  }
}

declare class Grid extends Virtual<Grid.Item> {
  columns: number;
  itemWidth: number;
  itemHeight: number;
}

export {
  Virtual,
  Linear,
  Grid
}