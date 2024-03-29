import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { Dynamic } from '../src';
import { Container, Inner, VirtualRow } from './components';

describe.skip('adjustment', () => {
  class Window extends Dynamic {
    length = 100;
  }

  it('will reset cache if size, estimateSize change', async () => {
    const virtual = Window.create();

    virtual.length = 101;
    const keys = await virtual.requestUpdate();

    expect(keys).toMatchObject(["length", "cache"]);
  })
})

describe.skip('scrolling', () => {
  class Window extends Dynamic {
    length = 1000;
    overscan = 5;
    estimateSize = () => 35;
    goto50 = () => this.gotoIndex(50);
  }

  const Test = () => {
    const {
      goto50,
      container,
      totalSize,
      visible
    } = Window.use();
  
    return (
      <>
        <button onClick={goto50} data-testid="gotoRow50">
          Goto 50
        </button>
        <Container ref={container}>
          <Inner height={totalSize}>
            {visible.map(info =>
              <VirtualRow {...info} />
            )}
          </Inner>
        </Container>
      </>
    )
  }
  
  it('should render new rows', async () => {
    const rendered = render(<Test />);
  
    await waitFor(() => {
      rendered.getByText('Row 1');
    })
  
    act(() => {
      const container = rendered.getByTestId("gotoRow50");
      fireEvent.click(container);
    })
  })
})