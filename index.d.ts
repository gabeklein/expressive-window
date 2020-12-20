import React from "react";
import VC from "react-use-controller";

declare namespace VirtualController {
  interface ComponentProps {
    index: number;
    style: React.CSSProperties;
    className?: string;
  }
  
  interface ContainerProps {
    Item: React.FunctionComponent<ComponentProps>;
    style?: React.CSSProperties;
    className?: string;
  }
}

declare class VirtualController extends VC {
  public Window: React.FunctionComponent<VirtualController.ContainerProps>;
  static Window: React.FunctionComponent<VirtualController.ContainerProps>;

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

  readonly visibleRange: [number, number];
  readonly itemsVisible: number;

  /** Determines initial size to allocate before rendering a list element. */
  estimateSize?(forIndex: number): number;

  /** 
   * Convert position index into unique key of a target list item.
   * Useful if items have unique IDs and reshuffling may occure.
   * 
   * May be overridden; returns index argument by default.
   */
  uniqueKey(forIndex: number): string | number;

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

  readonly end: boolean;

  didReachEnd?(): void;

  /** Programatically scroll to specific offset. */
  scrollToOffset(toOffset: number, opts: any): void;

  /** Programatically scroll to specific item by index. */
  scrollToIndex(index: number, opts?: any): void;
}

export default VirtualController;