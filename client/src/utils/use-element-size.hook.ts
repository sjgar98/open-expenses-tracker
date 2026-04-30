import { useElementSize } from '@mantine/hooks';
import { useEffect, useRef } from 'react';

export function useElementSizeWithRef<T extends HTMLElement = any>() {
  const refObject = useRef<T>(null);
  const { ref: callbackRef, width, height } = useElementSize<T>();
  useEffect(() => {
    callbackRef(refObject.current);
  }, [callbackRef]);
  return { ref: refObject, width, height };
}

