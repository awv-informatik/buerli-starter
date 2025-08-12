import CollapseImpl, { CollapseProps } from 'antd/lib/collapse'
import React from 'react'
import styled from 'styled-components'
import base from './base'

const Base = styled(CollapseImpl)`
  ${base}
  height: auto !important;
  background-color: rgba(255, 255, 255, 0.5) !important;
  .ant-collapse-item {
    .ant-collapse-content {
      .ant-collapse-content-box {
        padding: 4px 4px 16px 4px;
      }
    }
  }
  &.ant-collapse-borderless {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`

const Title = styled.span`
  position: relative;
  color: rgba(0, 0, 0, 0.4);
  text-transform: uppercase;
  font-size: 0.8em;
`

export default function Collapse({
  children,
  header,
  isActive = true,
  ...props
}: CollapseProps & { children?: React.ReactNode; header: React.ReactNode; isActive: boolean }) {
  return (
    <Base {...props} bordered={false} defaultActiveKey={isActive ? ['1'] : []}>
      <CollapseImpl.Panel header={<Title>{header}</Title>} key="1" style={{ border: 'none' }}>
        {children}
      </CollapseImpl.Panel>
    </Base>
  )
}
