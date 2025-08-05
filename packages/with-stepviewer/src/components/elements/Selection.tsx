import { CustomSelect, DrawingID, getDrawing, SelectedItem, SelectionFilter, SelectorID } from '@buerli.io/core'
import Button from 'antd/lib/button'
import Tag from 'antd/lib/tag'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { v4 } from 'uuid'
import { useDrawing } from '@buerli.io/react'
import base from './base'

const Base = styled.div<{ active?: boolean }>`
  ${base}
  cursor: pointer;
  height: auto !important;
  padding: 0px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background-color: ${props => (props.active ? '#007bff' : 'transparent')};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  align-items: center;
  transition: all 0.3s;
  &:hover {
    border-color: #007bff;
    border-right-width: 1px !important;
  }
`

const SelectionArea = styled.div`
  cursor: pointer;
  width: 100%;
  padding: 1px 0px;
  height: auto !important;
  background-color: transparent;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  align-items: center;
  .ant-tag {
    margin: 2px;
    min-width: 20px;
    height: 17px;
    line-height: 17px;
    font-weight: bolder;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
  }
`

const ModesArea = styled.div`
  cursor: pointer;
  width: 100%;
  height: auto !important;
  border-top: 1px solid white;
  padding: 3px 2px;
  background-color: transparent;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  align-items: center;
`

const Text = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
`

type Mode = {
  name: string
  customSelect: CustomSelect
  customUnSelect: CustomSelect
}

type Args = {
  drawingId: DrawingID
  filter?: SelectionFilter
  defaultActive?: boolean
  initialItems?: SelectedItem[]
  onChange?: (items: SelectedItem[]) => void
  onCreated?: (selectorId: SelectorID) => void
  caption?: string
  maxLen?: number
  customSelect?: CustomSelect
  customUnSelect?: CustomSelect
  modes?: Mode[]
  onHover?: ((objData: SelectedItem | null) => void) | undefined
  autoDisable?: boolean
}

export default function Selection({
  drawingId,
  filter = () => true,
  defaultActive,
  initialItems = [],
  maxLen,
  onChange,
  onCreated,
  caption,
  customSelect,
  customUnSelect,
  autoDisable, // Disable selection when itmes.length === maxLen
  modes,
  onHover,
  ...props
}: Args) {
  const selApi = useDrawing(drawingId, drawing => drawing.api.selection)

  const [curMode, setCurMode] = React.useState<string>(modes ? modes[0]?.name : '')
  const curModeRef = React.useRef(curMode) // TODO: this is workaround. It's impossible to change customSelect of created selector. Should be fixed.
  React.useEffect(() => {
    curModeRef.current = curMode
  }, [curMode])

  const customSelect_ = React.useCallback(
    (selId: SelectorID, items_: SelectedItem[], diff: SelectedItem[]) => {
      if (modes && modes.length > 0) {
        const mCustomSelect = modes.find(m => m.name === curModeRef.current)?.customSelect
        mCustomSelect ? mCustomSelect(selId, items_, diff) : selApi?.setItems(selId, items_)
        return
      } else if (customSelect) {
        customSelect(selId, items_, diff)
        return
      } else {
        selApi?.setItems(selId, items_)
      }
    },
    [selApi, customSelect, modes],
  )

  // TODO: remove copypaste?
  const customUnSelect_ = React.useCallback(
    (selId: SelectorID, items_: SelectedItem[], diff: SelectedItem[]) => {
      if (modes && modes.length > 0) {
        const mCustomUnSelect = modes.find(m => m.name === curModeRef.current)?.customUnSelect
        mCustomUnSelect ? mCustomUnSelect(selId, items_, diff) : selApi?.setItems(selId, items_)
        return
      } else if (customUnSelect) {
        customUnSelect(selId, items_, diff)
        return
      } else {
        selApi?.setItems(selId, items_)
      }
    },
    [selApi, customUnSelect, modes],
  )

  const [id] = useState(v4)
  useEffect(() => {
    const unsub =
      selApi && selApi.createSelector(id, filter, defaultActive, initialItems, maxLen, customSelect_, customUnSelect_)
    onCreated && onCreated(id)

    return () => unsub && unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selection = useDrawing(drawingId, drawing => drawing.selection.refs[id])
  const activeSelection = useDrawing(drawingId, drawing => drawing.selection.active)
  const active = activeSelection === id

  // TODO: fix lint error without disabling it!
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items: SelectedItem[] = (selection && selection.items) || []

  useEffect(() => {
    const active_ = getDrawing(drawingId).selection.active === id
    if (active_ && autoDisable && items.length === maxLen) {
      getDrawing(drawingId).api.selection.activateSelector(null)
    }
  }, [drawingId, id, items, autoDisable, maxLen])

  // Store current onChange into a reference
  const onChangeRef = useRef(onChange)
  useEffect(() => void (onChangeRef.current = onChange), [onChange])

  // On change callback
  useEffect(() => {
    if (selection?.items && onChangeRef.current) onChangeRef.current(selection.items)
  }, [selection?.items])

  return (
    <Base active={active} onClick={() => selApi && selApi.activateSelector(id)} {...props}>
      <SelectionArea>
        {!active && items.length === 0 && (
          <Text style={{ lineHeight: '21px', color: '#666' }}>{caption || 'Click here to select'}</Text>
        )}
        {active && items.length === 0 && <Text style={{ lineHeight: '21px', color: 'white' }}>Select items ...</Text>}
        {items.map(item => (
          <Tag
            key={`${item.id}|${item.scope}`}
            onClick={
              active
                ? (event: React.MouseEvent) => {
                    event.stopPropagation()
                    selApi && selApi.unselect(item, id)
                    onHover && onHover(null)
                  }
                : undefined
            }
            onPointerOver={() => {
              active && onHover && onHover(item)
            }}
            onPointerOut={() => {
              active && onHover && onHover(null)
            }}>
            {item.label ? item.label : item.id.toUpperCase()}
          </Tag>
        ))}
      </SelectionArea>
      {active && modes && modes.length > 1 && (
        <ModesArea>
          {modes?.map(mode => {
            return (
              <Button
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  height: '16px',
                  padding: '0px 4px',
                  background: curMode === mode.name ? 'white' : 'transparent',
                }}
                key={mode.name}
                type="text"
                size="small"
                onClick={(e: any) => {
                  setCurMode(mode.name)
                  e.stopPropagation()
                }}>
                {mode.name}
              </Button>
            )
          })}
        </ModesArea>
      )}
    </Base>
  )
}
