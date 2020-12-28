type Alignment = 
  | "center" 
  | "start" 
  | "end" 
  | "auto";

type Axis =
  | ["width", "height"]
  | ["height", "width"]

interface Position {
  index: number;
  key: number | string;
  start: number
  end: number
}