import { useState } from 'react'
import { Form, Input, InputNumber, Table, Typography, Button } from 'antd'
import { PipeType } from '../model/Pipes'

export default function PipesTable({ data, onSetData, onEditPipe, onAddPipe, onDeletePipe, onSaveOfb, onSaveStp, diameter, thickness, onDiameterChange, onThicknessChange }) {
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState('')
  const [tempDiameter, setTempDiameter] = useState(diameter)
  const [tempThickness, setTempThickness] = useState(thickness)
  const isEditing = record => record.key === editingKey
  const isLastItem = record => record.key === data[data.length - 1].key

  const editItem = record => {
    form.setFieldsValue({ name: '', type: '', length: undefined, angle: undefined, radius: undefined, rotation: undefined, ...record })
    setEditingKey(record.key)
  }

  const addItem = () => {
    const newData = [...data]
    const length = newData.length
    const lastItemType = newData[length - 1].type
    const isStraight = lastItemType === 'StraightPipe'
    if (length > 0) {
      const itemToPush = {
        key: length.toString(),
        name: 'Pipe' + length,
        type: isStraight ? PipeType.CurvedPipe : PipeType.StraightPipe,
        length: isStraight ? undefined : 100,
        angle: isStraight ? 45 : undefined,
        radius: isStraight ? 250 : undefined,
        rotation: isStraight ? 0 : undefined,
      }
      newData.push(itemToPush)
      onSetData(newData)
      onAddPipe(itemToPush)
    }
  }

  const deleteItem = () => {
    const newData = [...data]
    if (newData.length > 1) {
      newData.pop()
      onSetData(newData)
      onDeletePipe()
    }
  }

  const saveItem = async key => {
    try {
      const row = await form.validateFields()
      const newData = [...data]
      const index = newData.findIndex(item => key === item.key)
      if (index > -1) {
        const item = newData[index]
        newData.splice(index, 1, {
          ...item,
          ...row,
        })
        onSetData(newData)
        onEditPipe({ ...item, ...row })
        setEditingKey('')
      }
    } catch (errInfo) {
      console.info('Validate Failed:', errInfo)
    }
  }

  const columns = [
    { title: 'name', dataIndex: 'name', width: '8%', editable: true },
    { title: 'type', dataIndex: 'type', width: '5%', editable: false },
    { title: 'len [mm]', dataIndex: 'length', width: '1%', editable: true },
    { title: 'ang [°]', dataIndex: 'angle', width: '1%', editable: true },
    { title: 'rad [mm]', dataIndex: 'radius', width: '1%', editable: true },
    { title: 'rot [°]', dataIndex: 'rotation', width: '1%', editable: true },
    {
      title: 'operation',
      dataIndex: 'operation',
      width: '200px',
      render: (_, record) => {
        const isLast = isLastItem(record)
        return (
          <span>
            {isLast && (
              <Typography.Link disabled={editingKey !== ''} onClick={() => addItem()} style={{ marginRight: 8 }}>
                Add
              </Typography.Link>
            )}
            {isLast && data.length > 1 && (
              <Typography.Link disabled={editingKey !== ''} onClick={() => deleteItem()}>
                Delete
              </Typography.Link>
            )}
          </span>
        )
      },
    },
  ]

  const mergedColumns = columns.map(col => {
    if (!col.editable) return col
    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'name' ? 'text' : 'number',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        editItem: () => editItem(record),
        editingKey,
        saveItem: () => saveItem(record.key),
        cancelEdit: () => setEditingKey(''),
      }),
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 750 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontWeight: 500 }}>Diameter [mm]:</label>
          <InputNumber
            min={1}
            value={tempDiameter}
            onChange={setTempDiameter}
            onPressEnter={(e) => {
              onDiameterChange(tempDiameter)
              e.target.blur()
            }}
            onBlur={() => onDiameterChange(tempDiameter)}
            style={{ width: 100 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontWeight: 500 }}>Thickness [mm]:</label>
          <InputNumber
            min={0.1}
            value={tempThickness}
            onChange={setTempThickness}
            onPressEnter={(e) => {
              onThicknessChange(tempThickness)
              e.target.blur()
            }}
            onBlur={() => onThicknessChange(tempThickness)}
            style={{ width: 100 }}
          />
        </div>
      </div>
      <Form form={form} component={false}>
        <Table
          bordered
          components={{ body: { cell: EditableCell } }}
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
          size="middle"
        />
      </Form>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={onSaveOfb}>
          Save as OFB
        </Button>
        <Button type="primary" onClick={onSaveStp}>
          Save as STP
        </Button>
      </div>
    </div>
  )
}

function EditableCell({ editing, dataIndex, title, inputType, record, index, children, editItem, editingKey, saveItem, cancelEdit, ...restProps }) {
  const cPIndexes = ['angle', 'radius', 'rotation']
  const cPIndexRequired = cPIndexes.some(i => i === dataIndex) && record.type === PipeType.CurvedPipe
  const sPInputRequired = dataIndex === 'length' && record.type === PipeType.StraightPipe
  const disabled = !(cPIndexRequired || sPInputRequired)
  
  const handleClick = () => {
    if (!editing && editingKey === '' && !disabled) {
      editItem()
    }
  }
  
  const handleKeyDown = (e) => {
    if (editing) {
      if (e.key === 'Enter') {
        e.preventDefault()
        saveItem()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancelEdit()
      }
    }
  }
  
  return (
    <td {...restProps} onClick={handleClick} onKeyDown={handleKeyDown} style={{ ...restProps.style, cursor: !editing && editingKey === '' && !disabled ? 'pointer' : 'default' }}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: cPIndexRequired || sPInputRequired, message: `Please Input ${title}!` }]}>
          {inputType === 'number' ? <InputNumber disabled={disabled} /> : <Input disabled={disabled} />}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  )
}
