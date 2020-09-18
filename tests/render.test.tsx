import { render } from '@testing-library/react'
import * as React from 'react'

import { useVirtual } from '../src'
import { Container, Inner, Row } from './components'

it('should render', async () => {
  function App() {
    const parentRef = React.useRef()

    const rowVirtualizer = useVirtual({
      size: 10000,
      parentRef,
      estimateSize: React.useCallback(() => 35, []),
      overscan: 5,
    })

    return (
      <>
        <Container ref={parentRef}>
          <Inner
            style={{
              height: `${rowVirtualizer.totalSize}px`,
            }}
          >
            {rowVirtualizer.virtualItems.map(virtualRow => (
              <Row
                key={virtualRow.index}
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