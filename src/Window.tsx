import { Provider } from '@expressive/mvc';
import React, { CSSProperties, FC, ReactNode } from 'react';

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
    children,
    ...rest
  } = props;

  const { 
    scrollArea,
    container,
    visible,
    axis: [ direction ],
    get: controller
  } = (Model as any).use();

  return (
    <Provider of={controller}>
      <div ref={container} {...rest}>
        <div style={{ position: "relative", [direction]: scrollArea }}>
          {children}
          {visible.map((p: any) => <Component {...p} />)}
        </div>
      </div>
    </Provider>
  )
}