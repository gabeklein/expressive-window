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
  key?: number | string;
  start: number
  size: number
  end: number
}