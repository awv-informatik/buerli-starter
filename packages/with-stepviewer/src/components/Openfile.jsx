import { useCallback } from 'react'
import { Components, useInputContext, styled, createPlugin } from 'leva/plugin'
import { useDropzone } from 'react-dropzone'

export const StyledButton = styled('button', {
  display: 'block',
  $reset: '',
  fontWeight: '$button',
  height: '$rowHeight',
  borderStyle: 'none',
  borderRadius: '$sm',
  backgroundColor: '$elevation1',
  color: '$highlight1',
  '&:not(:disabled)': {
    color: '$highlight3',
    backgroundColor: '$accent2',
    cursor: 'pointer',
    $hover: '$accent3',
    $active: '$accent3 $accent1',
    $focus: '',
  },
})

export const plugin = createPlugin({
  sanitize: () => null,
  normalize: onLoad => ({ value: {}, settings: { onLoad } }),
  component: () => {
    const { settings } = useInputContext()
    const onDrop = useCallback(acceptedFiles => {
      const reader = new FileReader()
      reader.onload = () => settings.onLoad(reader.result)
      reader.readAsArrayBuffer(acceptedFiles[0])
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    return (
      <Components.Row>
        <StyledButton {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? 'Drop the files here ...' : 'Drag or click to select files'}
        </StyledButton>
      </Components.Row>
    )
  },
})
