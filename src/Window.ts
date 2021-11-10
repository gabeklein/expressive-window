import { Provider } from '@expressive/mvc';
import { createElement, CSSProperties, FC, ReactNode } from 'react';

import Control from './Core';

interface ComponentProps {
  index: number;
  style: CSSProperties;
}

interface ContainerProps {
  for: typeof Control | Control;
  component: FC<ComponentProps>;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export default function Window(props: ContainerProps){
  const {
    for: Model,
    component: Component,
    children = [],
    ...rest
  } = props;

  const { 
    scrollArea,
    container,
    visible,
    axis: [ direction ],
    get: controller
  } = (Model as any).use();

  const content = visible.map((props: any) => createElement(Component, props));
  const style = { [direction]: scrollArea, position: "relative" };

  return (
    createElement(Provider, { of: controller }, 
      createElement("div", { ref: container, ...rest },
        createElement("div", { style }, children, content)
      )
    )
  )
}