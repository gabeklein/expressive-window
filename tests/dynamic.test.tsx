import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { Dynamic } from '../src';
import { Container, Inner, VirtualRow } from './components';

describe.skip("dynamic sizing", () => {
  class Window extends Dynamic {
    length = 20;
    overscan = 5;
  }

  const App = () => {
    const {
      container,
      totalSize,
      render
    } = Window.use()
  
    return (
      <Container ref={container}>
        <Inner height={totalSize}>
          {render.map(info =>
            <VirtualRow {...info} />
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