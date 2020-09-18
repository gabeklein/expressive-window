import { useState, useReducer, useRef, useEffect, useLayoutEffect } from 'react'

import observeRect from '@reach/observe-rect'

export default function useRect(nodeRef: any) {
  const [element, setElement] = useState(nodeRef.current)
  const [rect, dispatch] = useReducer(rectReducer, null)
  const initialRectSet = useRef(false)

  useLayoutEffect(() => {
    if(nodeRef.current !== element)
      setElement(nodeRef.current)
  })

  useLayoutEffect(() => {
    if(!element || initialRectSet.current)
      return;

    initialRectSet.current = true
    const rect = element.getBoundingClientRect();
    dispatch({ rect });
  }, [element])

  useEffect(() => {
    if(!element)
      return;

    const observer = observeRect(element, rect => {
      dispatch({ rect });
    });

    observer.observe()
    return () => observer.unobserve()
  }, [element])

  return rect
}

function rectReducer(state: any, action: any) {
  const rect = action.rect;
  if(!state || state.height !== rect.height || state.width !== rect.width)
    return rect;
  else
    return state
}

