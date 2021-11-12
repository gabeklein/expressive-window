import { FC, CSSProperties } from "react";
import Model from "@expressive/mvc";

declare namespace Window {
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

declare const Window: FC<Window.ContainerProps>;

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
}

declare abstract class Core extends Model {

  /** Current size of virtual collection */
  length: number;

  /** Spacing between items displayed */
  gap: number;

  /**
   * Still render items an amount of pixels above and below viewport.
   * 
   * Useful to prevent unnecessary reloading of elements breifly out of view.
   * 
   * Default: 0;
   * */
  overscan: number;

  /** 
   * List should scroll horizontally instead.
   * 
   * Default is to vertically scroll.
   * */
  horizontal: boolean;

  size: [number, number];

  readonly offset: number;

  readonly axis: Core.Axis;
  readonly visibleOffset: [number, number];
  readonly visibleRange: [number, number];
  readonly visibleFrame: [number, number];

  readonly scrollArea: number;

  /** Apply this reference to container element! */
  readonly container: {
    current: HTMLElement | null;
  }

  readonly measurements: Core.Item[];

  /** Index and computed postion of all drawn containers */
  readonly visible: this["measurements"];

  readonly end: boolean;

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
  interface Item extends Core.Item {
    ref: (element: HTMLElement) => void;
    size: number;
  } 
}

declare class Dynamic extends Core {
  /** Determines initial size to allocate before rendering a list element. */
  estimateSize?(forIndex: number): number;

  readonly measurements: Dynamic.Item[];
  readonly render: Dynamic.Item[];
}

declare namespace Grid {
  interface Item extends Core.Item {
    start: number;
    end: number;
    column: number;
  }
}

declare class Grid extends Core {
  readonly measurements: Grid.Item[];
  columns: number;
  height: number;
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

declare class Justified extends Core {
  readonly rows: number;

  readonly measurements: Justified.Item[];
  items: Justified.Input[];
  rowSize: number;
  chop: boolean;

  extend(): boolean;
}

export {
  Core,
  Dynamic,
  Grid,
  Justified,
  Window
}