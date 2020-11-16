import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import Virtual from '../src';
import { Container, Inner, VirtualRow } from './components';

describe.skip('scrolling', () => {
  class Window extends Virtual {
    size = 1000;
    overscan = 5;
    estimateSize = () => 35;
    goto50 = () => this.scrollToIndex(50);
  }

  const App = () => {
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
    const rendered = render(<App />);
  
    await waitFor(() => {
      rendered.getByText('Row 1');
    })
  
    act(() => {
      const container = rendered.getByTestId("gotoRow50");
      fireEvent.click(container);
    })
  })
})