import { FC, CSSProperties } from "react";
import VC from "react-use-controller";

declare namespace Core {
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

declare abstract class Core<P extends Core.Item> extends VC {
  public Window: FC<Core.ContainerProps>;
  static Window: FC<Core.ContainerProps>;

  /** Current size of virtual collection */
  length: number;

  /** 
   * Amount of padding between container and its items.
   * Follows standard CSS convention.
   * 
   * (In pixels) Default is zero.
   * */
  padding: [number, number?, number?, number?];

  /** 
   * List should scroll horizontally instead.
   * 
   * Default is to vertically scroll.
   * */
  horizontal: boolean;

  readonly axis: Core.Axis;
  readonly visibleOffset: [number, number];
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

declare namespace Dynamic {
  interface Row extends Core.Item {
    ref: (element: HTMLElement) => void;
    size: number;
  } 
}

declare class Dynamic extends Core<Dynamic.Row> {
  /**
   * Number of items to render past container bounds
   * 
   * Default: 0;
   * */
  overscan: number;

  /** Determines initial size to allocate before rendering a list element. */
  estimateSize?(forIndex: number): number;

  readonly render: Dynamic.Row[];
}

declare namespace Virtual {
  interface Item extends Core.Item {
    start: number;
    end: number;
    column: number;
    offset: number;
    size: [number, number];
  }
}

declare class Virtual extends Core<Virtual.Item> {
  columns: number;
  gap: number;
  itemWidth: number;
  itemHeight: number;
}

declare namespace Justified {
  interface Item extends Core.Item {
    offset: number;
    row: number;
    column: number;
    size: [number, number];
  }

  type Input =
    | { aspect: number; }
    | { width: number; height: number; };
}

declare class Justified extends Core<Justified.Item> {
  items: Justified.Input;
  rowSize: number;
  gap: number;
  chop: boolean;
}

export {
  Core,
  Dynamic,
  Virtual,
  Justified
}