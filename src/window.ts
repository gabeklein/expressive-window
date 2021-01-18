import { FC, CSSProperties, createElement as create, ReactNode, useCallback } from "react";
import Control, { Item } from "./controller";

interface ComponentProps {
  index: number;
  style: CSSProperties;
}

interface ContainerProps {
  component: FC<ComponentProps>;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function WindowContainer(
  props: ContainerProps, context: Control<Item>){

  const { totalSize, container, render, axis: [x] } = context.tap();
  const { component, children, ...rest } = props;
  const Child = useCallback((props: any) => {
    return component(props, context); 
  }, [component]);

  return (
    create("div", { ref: container, ...rest },
      create("div", { style: { [x]: totalSize } },
        children,
        render.map(props => 
          create(Child, props))
      ))
  )
}