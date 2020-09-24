import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { useVirtual } from '../src';
import { Container, Inner, VirtualRow } from './components';

const App = () => {
  const {
    parentRef,
    totalSize,
    virtualItems
  } = useVirtual({
    size: 20,
    overscan: 5,
  })

  return (
    <Container ref={parentRef}>
      <Inner height={totalSize}>
        {virtualItems.map(info =>
          <VirtualRow key={info.index} {...info} ref={info.measureRef} />
        )}
      </Inner>
    </Container>
  )
}

it('should render given dynamic size', async () => {
  const rendered = render(<App />);

  await waitFor(() => {
    rendered.getByText('Row 1')
  })
})