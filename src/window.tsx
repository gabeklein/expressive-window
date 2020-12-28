import React, { FC, CSSProperties } from "react";
import Control, { Item } from "./base";

interface ComponentProps {
  index: number;
  style: CSSProperties;
  className?: string;
}

interface ContainerProps {
  control: Control<any>;
  component: ItemComponent;
  style?: CSSProperties;
  className?: string;
}

type ItemComponent = FC<ComponentProps>;

export function WindowContainer(
  props: ContainerProps, context: Control<any>){

  const { totalSize, container, render } = context.tap();
  const { component, ...rest } = props;
  const Component = ItemHoc(component);

  return (
    <div ref={container} {...rest as any}>
      <div style={{ height: totalSize }}>
        {render.map(Component)}
      </div>
    </div>
  )
}

export function ItemHoc(Component: ItemComponent){
  return ({ index, key, start }: Item) => (
    <Component
      index={index}
      key={key || index}
      style={{
        top: start,
        position: "absolute",
        width: "100%"
      }} 
    />
  )
}