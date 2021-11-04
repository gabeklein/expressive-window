import { Provider } from '@expressive/mvc';
import { createElement, CSSProperties, FC, ReactNode } from 'react';

import Control from './controller';

interface ComponentProps {
  index: number;
  style: CSSProperties;
}

interface ContainerProps {
  for: typeof Control;
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
    totalSize,
    container,
    visible,
    axis: [ direction ],
    get: controller
  } = (Model as any).use();

  const content = visible.map((props: any) => createElement(Component, props));
  const style = { [direction]: totalSize };

  return (
    createElement("div", { ref: container, ...rest },
      createElement(Provider, { of: controller }, 
        createElement("div", { style }, children, content)
      )
    )
  )
}