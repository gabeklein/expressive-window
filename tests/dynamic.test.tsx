import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import Virtual from '../src';
import { Container, Inner, VirtualRow } from './components';

describe("dynamic sizing", () => {
  class Window extends Virtual {
    size = 20;
    overscan = 5;
  }

  const App = () => {
    const {
      parentRef,
      totalSize,
      virtualItems
    } = Window.use()
  
    return (
      <Container ref={parentRef}>
        <Inner height={totalSize}>
          {virtualItems.map(info =>
            <VirtualRow {...info} ref={info.measureRef} key={info.index} />
          )}
        </Inner>
      </Container>
    )
  }
  
  it('allocates properly', async () => {
    const rendered = render(<App />);
  
    await waitFor(() => {
      rendered.getByText('Row 1')
    })
  })
})