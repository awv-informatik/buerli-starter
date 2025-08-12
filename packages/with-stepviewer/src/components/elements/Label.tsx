import styled from 'styled-components'
import base from './base'

const Base = styled.div<{ highlighted?: boolean; bold?: boolean; ellipsis?: boolean }>`
  ${base}
  align-items: center;
  flex: 1;
  padding: 2px 0px 0px 0px;
  color: ${props => (props.highlighted ? 'rgba(154, 30, 30, 0.75)' : 'rgba(0, 0, 0, 0.75)')};
  font-weight: ${props => (props.bold ? 'bold' : 'normal')};
  overflow: ${props => (props.ellipsis ? 'hidden' : 'visible')};
  text-overflow: ${props => (props.ellipsis ? 'ellipsis' : 'clip')};
  white-space: ${props => (props.ellipsis ? 'nowrap' : 'normal')};
  word-break: ${props => (props.ellipsis ? 'break-all' : 'normal')};
`
export default Base
