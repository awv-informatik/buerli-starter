import { Menu as MenuImpl } from 'antd'
import type { MenuItemProps, MenuProps } from 'antd'
import React from 'react'

const MenuItemImpl = MenuImpl.Item
export function Menu({ ...props }: MenuProps) {
  return <MenuImpl {...props} />
}

export function MenuItem({ ...props }: MenuItemProps) {
  return <MenuItemImpl {...props} />
}
