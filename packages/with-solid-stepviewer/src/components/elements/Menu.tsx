import MenuImpl, { MenuProps } from 'antd/lib/menu'
import MenuItemImpl, { MenuItemProps } from 'antd/lib/menu/MenuItem'
import React from 'react'

export function Menu({ ...props }: MenuProps) {
  return <MenuImpl {...props} />
}

export function MenuItem({ ...props }: MenuItemProps) {
  return <MenuItemImpl {...props} />
}
