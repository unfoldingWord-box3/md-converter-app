import React, { useRef, useEffect, forwardRef } from 'react';

const IndeterminateCheckbox = forwardRef(
  ({ indeterminate, classes, ...rest }, ref) => {
    const defaultRef = useRef()
    const resolvedRef = ref || defaultRef

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return <input type="checkbox" ref={resolvedRef} {...rest} />
  }
)

export default IndeterminateCheckbox
