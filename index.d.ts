import VC from "react-use-controller";

export default class VirtualController extends VC {
  /** Current size of virtual collection */
  length: number;

  /**
   * Number of items to render past container bounds
   * 
   * Default: 0;
   * */
  overscan: number;

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
   * Flag list should scroll horizontally.
   * 
   * Default: false;
   * */
  horizontal: boolean;

  /** Determines initial size to allocate before rendering a list element. */
  estimateSize?(forIndex: number): number;

  /** Apply this reference to container element! */
  readonly containerRef: {
    current: HTMLElement | null;
  }

  /** Index and computed postion of all drawn containers */
  readonly render: {
    index: number;
    start: number;
    size: number;
    end: number;
    measureRef: (element: HTMLElement) => void;
  }[];

  readonly totalSize: number;

  /** Programatically scroll to specific offset. */
  scrollToOffset(toOffset: number, opts: any): void;

  /** Programatically scroll to specific item by index. */
  scrollToIndex(index: number, opts?: any): void;
}