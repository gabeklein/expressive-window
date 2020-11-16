import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import Virtual from '../src';
import { Container, Inner, VirtualRow } from './components';

describe('adjustment', () => {
  class Window extends Virtual {
    size = 100;
  
    resetTimes = 0;
    resetCache(){
      this.resetTimes++;
      super.resetCache();
    }
  }

  it('will clear cache if size, estimateSize change', async () => {
    const virtual = Window.create();
    
    expect(virtual.resetTimes).toBe(0);

    virtual.size = 101;
    await virtual.requestUpdate();
    expect(virtual.resetTimes).toBe(1);
  })
})

describe.skip('scrolling', () => {
  class Window extends Virtual {
    size = 1000;
    overscan = 5;
    estimateSize = () => 35;
    goto50 = () => this.scrollToIndex(50);
  }

  const Test = () => {
    const {
      goto50,
      parentRef,
      totalSize,
      render
    } = Window.use();
  
    return (
      <>
        <button onClick={goto50} data-testid="gotoRow50">
          Goto 50
        </button>
        <Container ref={parentRef}>
          <Inner height={totalSize}>
            {render.map(info =>
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