import SliderImpl, { SliderBaseProps } from 'antd/lib/slider'
import React from 'react'
import styled from 'styled-components'
import base from './base'

const Base = styled(SliderImpl)`
  ${base}
  width: unset;
  &.ant-slider {
    margin: 4px 6px 0px;
  }
  & .ant-slider-track {
    background-color: #fcc7cb;
  }
`

type Props = { children?: any[] } & SliderBaseProps
// TODO: Type of props?
export default function Slider({ children, ...props }: Props) {
  return <Base {...props}>{children}</Base>
}
