import InputImpl, { InputProps, InputRef } from 'antd/lib/input'
import React, { forwardRef } from 'react'
import styled from 'styled-components'
import base from './base'

const Base = styled(InputImpl)`
  ${base}
`

// TODO: remove forwardRef
const Input = forwardRef<InputRef, InputProps>(({ ...props }, ref) => {
  return <Base {...props} ref={ref} />
})

export default Input
