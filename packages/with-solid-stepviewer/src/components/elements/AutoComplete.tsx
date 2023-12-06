import AutoCompleteImpl, { AutoCompleteProps } from 'antd/lib/auto-complete'
import React from 'react'
import styled from 'styled-components'
import base from './base'

type AutoCompleteT = typeof AutoCompleteImpl

const Base: AutoCompleteT = styled(AutoCompleteImpl)`
  ${base}
`

export default function AutoComplete({ ...props }: AutoCompleteProps) {
  return <Base {...props} />
}
