import ButtonImpl, { ButtonProps } from 'antd/lib/button'
import Tooltip from 'antd/lib/tooltip'
import React from 'react'
import styled from 'styled-components'

const BaseButton = styled(ButtonImpl)`
  width: 100%;
  margin: 2px 1px;
`

const IconButton = styled(ButtonImpl)`
  width: 25px;
  height: 25px;
  padding: 2px 2px;
  margin: 2px 1px;
`

function Fragment({ ...props }) {
  return <React.Fragment key={props.key}>{props.children}</React.Fragment>
}

export default function Button({
  children,
  iconSrc,
  titleText,
  ...props
}: ButtonProps & { iconSrc?: string; titleText?: string }) {
  // Tooltip add redundant span if button is disabled, so there is a workaround: don't render tooltip if button is disabled.
  const Wrapper = titleText ? Tooltip : Fragment
  return (
    <Wrapper placement="top" title={titleText}>
      {!iconSrc && <BaseButton {...props}>{children}</BaseButton>}
      {iconSrc && (
        <IconButton {...props}>
          <img style={{ width: 19, height: 19, marginBottom: '7px' }} src={iconSrc} />
        </IconButton>
      )}
    </Wrapper>
  )
}
