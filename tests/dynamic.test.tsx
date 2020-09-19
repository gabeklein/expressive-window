import { render } from '@testing-library/react'
import * as React from 'react'

import { useVirtual } from '../src'
import { Container, Inner, Row } from './components'

it('should render given dynamic size', async () => {
  function App() {
    const rowVirtualizer = useVirtual({
      size: 20,
      overscan: 5,
    })

    return (
      <>
        <Container ref={rowVirtualizer.parentRef}>
          <Inner
            style={{
              height: `${rowVirtualizer.totalSize}px`,
            }}
          >
            {rowVirtualizer.virtualItems.map(virtualRow => (
              <Row
                key={virtualRow.index}
                ref={virtualRow.measureRef}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                Row {virtualRow.index}
              </Row>
            ))}
          </Inner>
        </Container>
      </>
    )
  }

  const rendered = render(<App />)

  rendered.getByText('Row 1')
})