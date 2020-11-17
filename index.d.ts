import VC from "react-use-controller";

export default abstract class VirtualController extends VC {
  /** Current size of virtual collection */
  abstract length: number;

  /**
   * Number of items to render past container bounds
   * 
   * Default: 0;
   * */
  abstract overscan?: number;

  /** 
   * Amount of padding between container and first item. (In pixels)
   * 
   * Default: 0;
   * */
  abstract paddingStart?: number;

  /** 
   * Amount of padding between container and last item. (In pixels)
   * 
   * Default: 0;
   * */
  abstract paddingEnd?: number;

  /** 
   * Flag list should scroll horizontally.
   * 
   * Default: false;
   * */
  abstract horizontal?: boolean;

  /** Determines initial size to allocate before rendering a list element. */
  abstract estimateSize?(forIndex: number): number;

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
  }[]

  /** Programatically scroll to specific offset. */
  scrollToOffset(toOffset: number, opts: any): void;

  /** Programatically scroll to specific item by index. */
  scrollToIndex(index: number, opts?: any): void;
}