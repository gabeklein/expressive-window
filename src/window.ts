import { FC, CSSProperties, createElement as create } from "react";
import Control, { Item } from "./base";

interface ComponentProps {
  index: number;
  style: CSSProperties;
}

interface ContainerProps {
  component: FC<ComponentProps>;
  style?: CSSProperties;
  className?: string;
}

export function WindowContainer(
  props: ContainerProps, context: Control<any>){

  const { totalSize, container, render } = context.tap();
  const { component, ...rest } = props;

  const Item = ({ style, index, key = index }: Item) =>
    create(component, { style, key, index })

  return (
    create("div", { ref: container, ...rest },
      create("div", { style: { height: totalSize }},
        render.map(Item)))
  )
}