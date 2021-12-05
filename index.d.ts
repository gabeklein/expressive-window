import { FC, CSSProperties, ReactNode, ReactElement } from "react";
import Model from "@expressive/mvc";

type Alignment = "center" | "start" | "end" | "auto";
type Item<T> = T extends { ["cache"]: (infer U)[] } ? U : never;
type value = string | number;

declare namespace Window {
  type Type = Core | typeof Core;
  type Class = new (...args: any[]) => any;
  type Instance<E> = E extends Class ? InstanceType<E> : E extends Model ? E : never;

  /**
   * Props for component `C` passable to `<Window for={T} component={C}>`,
   * where T is an extension of model `Core`.
   **/
  type RowProps<T extends Core> = Item<T> & { context: T };

  type RenderProps<T extends Core> =
    | { component: FC<RowProps<T>> }
    | { render: (info: Item<T>, index: number) => ReactNode }
  
  type Props<T extends Type> =
    & {
      for: T;
      children?: ReactNode;
      style?: CSSProperties;
      className?: string;
    }
    & RenderProps<Instance<T>>
}

declare function Window<T extends Window.Type>(props: Window.Props<T>): ReactElement<typeof props>;

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

  /**
   * Keys [on-axis, off-axis] given current state of this.horizontal.
   */
  readonly axis: Core.Axis;

  /** Space available for visible elements on-axis. */
  readonly areaX: number;

  /** Space available for visible elements off-axis. */
  readonly areaY: number;

  /** Total area of scrollable content. */
  readonly scrollArea: number;

  /** Current scroll offset. */
  readonly offset: number;

  /** Range of pixel offset visible in window. */
  readonly frame: [number, number];

  /** Range of indicies visible in window. */
  readonly range: [number, number];


  /** Apply this reference to container element! */
  readonly container: {
    current: HTMLElement | null;
  }

  readonly cache: Core.Item[];

  /** Logic to generate a new row. */
  extend(): this["cache"] | undefined;

  /** Index and computed postion of all drawn containers */
  readonly visible: this["cache"];

  /** Index equal to length is currently visible. */
  readonly end: boolean;

  protected observeContainer(element: HTMLElement): (() => void) | undefined;
  protected getVisible(): this["cache"];
  protected getVisibleRange(): [number, number];
  protected locate(index: number): Item<this> | undefined;

  protected scrollTo(offset: number): void;

  protected findItem(align: Alignment, index: number): number | undefined;

  protected position(size: [value, value], offset: [value, value]): Readonly<{
    width: value;
    height: value;
    left: value;
    top: value;
  }>

  /** Programatically scroll to specific offset. */
  gotoOffset(toOffset: number, opts: any): void;

  /** Programatically scroll to specific item by index. */
  gotoIndex(index: number, opts?: any): void;

  /** 
   * Convert position index into unique key of a target list item.
   * Useful if items have unique IDs and reshuffling may occure.
   * 
   * May be overridden; returns index argument by default.
   */
  uniqueKey(forIndex: number): string | number;
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

  readonly cache: Dynamic.Item[];
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
  readonly cache: Grid.Item[];

  /** Number of columns to break elements into. */
  columns: number;

  /** Row height. */
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
  readonly cache: Justified.Item[];

  /** Number of rows generated so far. */
  readonly rows: number;

  items: Justified.Input[];

  /** Minimum row-height used to while filling row. */
  rowSize: number;

  /** Hide final row of elements if not full. */
  chop: boolean;
}

export {
  Core,
  Dynamic,
  Grid,
  Justified,
  Window
}