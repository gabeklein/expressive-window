import React, { FC, CSSProperties } from "react";
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
    React.createElement(component, { style, key, index })

  return (
    <div ref={container} {...rest as any}>
      <div style={{ height: totalSize }}>
        {render.map(Item)}
      </div>
    </div>
  )
}