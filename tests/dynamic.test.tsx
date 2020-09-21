import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { useVirtual } from '../src';
import { Container, Inner, Row } from './components';

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
      <Inner style={{ height: `${totalSize}px` }}>
        {virtualItems.map(row => (
          <Row
            key={row.index}
            ref={row.measureRef}
            style={{
              height: `${row.size}px`,
              transform: `translateY(${row.start}px)`,
            }}>
            Row {row.index}
          </Row>
        ))}
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