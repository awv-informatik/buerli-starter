import React, { useState } from 'react'
import './Table.css'
import { Form, Input, InputNumber, Popconfirm, Table, Typography } from 'antd'
import { PipeType } from '../model/Pipes'

const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
  const cPIndexes = ['angle', 'radius', 'rotation']
  const cPIndexRequired = cPIndexes.some(i => i === dataIndex) && record.type === PipeType.CurvedPipe
  const sPInputRequired = dataIndex === 'length' && record.type === PipeType.StraightPipe
  const disabled = !(cPIndexRequired || sPInputRequired)
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: cPIndexRequired || sPInputRequired,
              message: `Please Input ${title}!`,
            },
          ]}>
          {inputType === 'number' ? <InputNumber disabled={disabled} /> : <Input disabled={disabled} />}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  )
}

const PipesTable = ({ data, onSetData, onEditPipe, onAddPipe, onDeletePipe }) => {
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState('')
  const isEditing = record => record.key === editingKey
  const isLastItem = record => record.key === data[data.length - 1].key

  const editItem = record => {
    form.setFieldsValue({
      name: '',
      type: '',
      length: undefined,
      angle: undefined,
      radius: undefined,
      rotation: undefined,
      ...record,
    })
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

  const cancel = () => {
    setEditingKey('')
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
    {
      title: 'name',
      dataIndex: 'name',
      width: '8%',
      editable: true,
    },
    {
      title: 'type',
      dataIndex: 'type',
      width: '5%',
      editable: false,
    },
    {
      title: 'length [mm]',
      dataIndex: 'length',
      width: '5%',
      editable: true,
    },
    {
      title: 'angle [°]',
      dataIndex: 'angle',
      width: '5%',
      editable: true,
    },
    {
      title: 'radius [mm]',
      dataIndex: 'radius',
      width: '5%',
      editable: true,
    },
    {
      title: 'rotation [°]',
      dataIndex: 'rotation',
      width: '5%',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record)
        const isLast = isLastItem(record)
        const length = data.length
        console.info(length)
        return editable ? (
          <span>
            <Typography.Link onClick={() => saveItem(record.key)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <Typography.Link disabled={editingKey !== ''} onClick={() => editItem(record)} style={{ marginRight: 8 }}>
              Edit
            </Typography.Link>
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
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'name' ? 'text' : 'number',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    }
  })

  return (
    <Form form={form} component={false}>
      <Table
        bordered
        components={{ body: { cell: EditableCell } }}
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={false}
        size="small"
      />
    </Form>
  )
}

export default PipesTable
