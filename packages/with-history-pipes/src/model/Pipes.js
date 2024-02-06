import { FlipType, ReorientedType, CCClasses } from '@buerli.io/classcad'
import straightPipe from '../resources/StraightPipe.ofb?raw'
import curvedPipe from '../resources/CurvedPipe.ofb?raw'

export const PipeType = {
  StraightPipe: 'StraightPipe',
  CurvedPipe: 'CurvedPipe',
}

export class Pipes {
  api = null
  rootAsm = null
  pipeInstances = []

  /** Create root assembly and add initial pipes */
  init = async (api, data) => {
    this.api = api
    this.rootAsm = await this.api.createRootAssembly('PipeAsm')
    // Load and configure pipe template and add it as an instance to the assembly
    for (let i = 0; i < data.length; i++) {
      const pipePart = await this.loadAndConfigure(data[i])
      await this.addInstance(pipePart, data[i].name)
    }
    // Connect the pipe instances by constraints
    if (this.pipeInstances.length > 1)
      for (let i = 0; i < this.pipeInstances.length; i++) await this.constrainInstance(data[i], this.pipeInstances[i])
    return this
  }

  /** Edit parameters of existing pipe */
  edit = async item => {
    await this.api.setExpressions({
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
      const constr = await this.api.getFastenedConstraint(this.rootAsm, item.name + 'FC')
      await this.api.updateFastenedConstraints({ ...constr, zRotation: item.rotation })
    }
  }

  /** Add new pipe at the end of the exisiting pipe */
  add = async item => {
    const pipePart = await this.loadAndConfigure(item)
    const pipeInstance = await this.addInstance(pipePart, item.name)
    await this.constrainInstance(item, pipeInstance)
  }

  /** Remove last pipe element */
  delete = async () => {
    await this.api.removeInstances({ id: this.pipeInstances[this.pipeInstances.length - 1] })
    this.pipeInstances.pop()
  }

  /**************** Helper functions ****************/
  loadAndConfigure = async item => {
    const isStraight = item.type === PipeType.StraightPipe
    const product = await this.api.loadProduct(isStraight ? straightPipe : curvedPipe, 'ofb', { ident: item.name })
    const pipePart = product[0]
    await this.api.setExpressions({
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

  addInstance = async (pipePart, instanceName) => {
    const [pipeInstance] = await this.api.addInstances({
      productId: pipePart,
      ownerId: this.rootAsm,
      transformation: [
        { x: 0, y: 0, z: 0 }, // Origin
        { x: 1, y: 0, z: 0 }, // X-Dir
        { x: 0, y: 1, z: 0 }, // Y-Dir
      ],
      name: instanceName,
    })
    this.pipeInstances.push(pipeInstance)
    return pipeInstance
  }

  constrainInstance = async (item, pipeInstance) => {
    if (item.key === '0') {
      const [wcs0] = await this.api.getWorkGeometry(pipeInstance, CCClasses.CCWorkCSys, 'WCS0')
      await this.api.createFastenedOriginConstraint(
        this.rootAsm,
        { matePath: [pipeInstance], wcsId: wcs0, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
        0,
        0,
        0,
        item.name + 'FOC',
      )
    } else {
      const pipeInstBefore = this.pipeInstances[Number(item.key) - 1]
      const [wcs0] = await this.api.getWorkGeometry(pipeInstance, CCClasses.CCWorkCSys, 'WCS0')
      const [wcs1] = await this.api.getWorkGeometry(pipeInstBefore, CCClasses.CCWorkCSys, 'WCS1')
      const id = await this.api.createFastenedConstraint(
        this.rootAsm,
        { matePath: [pipeInstBefore], wcsId: wcs1, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
        { matePath: [pipeInstance], wcsId: wcs0, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
        0,
        0,
        item.rotation ? (item.rotation / 180) * Math.PI : 0,
        item.name + 'FC',
      )
    }
  }
}
