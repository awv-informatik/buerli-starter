import { FlipType, ReorientedType, CCClasses } from '@buerli.io/classcad'
import straightPipe from '../resources/StraightPipe.ofb?raw'
import curvedPipe from '../resources/CurvedPipe.ofb?raw'

export const PipeType = {
  StraightPipe: 'StraightPipe',
  CurvedPipe: 'CurvedPipe',
}

const xDir = { x: 1, y: 0, z: 0 }
const yDir = { x: 0, y: 1, z: 0 }
const origin = { x: 0, y: 0, z: 0 }
const originTransform = [origin, xDir, yDir]
const pipeInstances = []

/** Create root assembly and add initial pipes */
export const createInitialPipes = async (api, data) => {
  const rootAsm = await api.createRootAssembly('PipeAsm')
  // Load and configure pipe template and add it as an instance to the assembly
  for (let i = 0; i < data.length; i++) {
    const pipePart = await loadAndConfigurePipe(api, data[i])
    await addPipeInstance(api, pipePart, rootAsm, data[i].name)
  }
  // Connect the pipe instances by constraints
  if (pipeInstances.length > 1) {
    for (let i = 0; i < pipeInstances.length; i++) await constrainPipeInstance(api, data[i], pipeInstances[i], rootAsm)
  }
  return rootAsm
}

/** Edit parameters of existing pipe */
export const editPipe = async (api, item, rootAsm) => {
  await api.setExpressions({
    partId: item.name,
    members:
      item.type === PipeType.StraightPipe
        ? [{ name: 'length', value: item.length }]
        : [
            { name: 'angle', value: (item.angle / 180) * Math.PI },
            { name: 'radius', value: item.radius },
          ],
  })
  if (item.type === PipeType.CurvedPipe) {
    const constr = await api.getFastenedConstraint(rootAsm, item.name + 'FC')
    await api.updateFastenedConstraints({ ...constr, zRotation: item.rotation })
  }
}

/** Add new pipe at the end of the exisiting pipe */
export const addPipe = async (api, item, rootAsm) => {
  const pipePart = await loadAndConfigurePipe(api, item)
  const pipeInstance = await addPipeInstance(api, pipePart, rootAsm, item.name)
  await constrainPipeInstance(api, item, pipeInstance, rootAsm)
}

/** Remove last pipe element */
export const deletePipe = async api => {
  await api.removeInstances({ id: pipeInstances[pipeInstances.length - 1] })
  pipeInstances.pop()
}

/**************** Helper functions ****************/
const loadAndConfigurePipe = async (api, item) => {
  const isStraight = item.type === PipeType.StraightPipe
  const product = await api.loadProduct(isStraight ? straightPipe : curvedPipe, 'ofb', { ident: item.name })
  const pipePart = product[0]
  await api.setExpressions({
    partId: pipePart,
    members: isStraight
      ? [{ name: 'length', value: item.length }]
      : [
          { name: 'angle', value: (item.angle / 180) * Math.PI },
          { name: 'radius', value: item.radius },
        ],
  })
  return pipePart
}

const addPipeInstance = async (api, pipePart, rootAsm, instanceName) => {
  const [pipeInstance] = await api.addInstances({
    productId: pipePart,
    ownerId: rootAsm,
    transformation: originTransform,
    name: instanceName,
  })
  pipeInstances.push(pipeInstance)
  return pipeInstance
}

const constrainPipeInstance = async (api, item, pipeInstance, rootAsm) => {
  if (item.key === '0') {
    const [wcs0] = await api.getWorkGeometry(pipeInstance, CCClasses.CCWorkCSys, 'WCS0')
    await api.createFastenedOriginConstraint(
      rootAsm,
      { matePath: [pipeInstance], wcsId: wcs0, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
      0,
      0,
      0,
      item.name + 'FOC',
    )
  } else {
    const pipeInstBefore = pipeInstances[Number(item.key) - 1]
    const [wcs0] = await api.getWorkGeometry(pipeInstance, CCClasses.CCWorkCSys, 'WCS0')
    const [wcs1] = await api.getWorkGeometry(pipeInstBefore, CCClasses.CCWorkCSys, 'WCS1')
    await api.createFastenedConstraint(
      rootAsm,
      { matePath: [pipeInstBefore], wcsId: wcs1, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
      { matePath: [pipeInstance], wcsId: wcs0, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
      0,
      0,
      item.rotation ? (item.rotation / 180) * Math.PI : 0,
      item.name + 'FC',
    )
  }
}
