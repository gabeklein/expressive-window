type Alignment = 
  | "center" 
  | "start" 
  | "end" 
  | "auto";

type Axis =
  | ["width", "height"]
  | ["height", "width"]

interface ItemStats {
  index: number
  start: number
  size: number
  end: number
  ref: (element: HTMLElement) => void;
}