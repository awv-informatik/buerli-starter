import MentionsImpl, { MentionProps } from 'antd/lib/mentions'
import React, { ForwardRefRenderFunction } from 'react'
import styled from 'styled-components'
import base from './base'

const Base = styled(MentionsImpl)`
  ${base}
  padding: 1px 18px 4px 11px;
  contain-intrinsic-height: 25px;
  .rc-textarea {
    height: 25px;
    min-height: 25px;
    max-height: 25px;
    padding: 0px;
    overflow: hidden;
    white-space: nowrap;
  }
  .ant-mentions-measure {
    padding-left: 0px;
    margin-left: 0px;
    white-space: nowrap;
    font-size: 0px;
  }
`

type MentionsT = React.ForwardRefExoticComponent<MentionProps & React.RefAttributes<any>> & {
  Option: typeof MentionsImpl.Option
}

const InternalMentions: ForwardRefRenderFunction<any, MentionProps> = ({ children, ...props }, ref) => {
  return (
    <Base {...props} ref={ref}>
      {children}
    </Base>
  )
}

const Mentions = React.forwardRef<any, MentionProps>(InternalMentions) as MentionsT
Mentions.Option = MentionsImpl.Option

export default Mentions
