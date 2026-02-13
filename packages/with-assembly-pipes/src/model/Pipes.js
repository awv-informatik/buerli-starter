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
  parts = []
  itemsData = []  // Store item data for updates
  diameter = 50  // Default outer diameter
  thickness = 4  // Default thickness

  /** Create root assembly and add initial pipes */
  init = async (api, data, diameter = 50, thickness = 4) => {
    this.diameter = diameter
    this.thickness = thickness
    this.api = api
    this.rootAsm = await this.api.assembly.create({ name: 'PipesAssembly' })
    // Load and configure pipe template and add it as an instance to the assembly
    for (let i = 0; i < data.length; i++) {
      const pipePart = await this.loadAndConfigure(data[i])
      await this.addInstance(pipePart, data[i].name)
      this.itemsData.push(data[i])
    }
    // Connect the pipe instances by constraints
    if (this.pipeInstances.length > 0) for (let i = 0; i < this.pipeInstances.length; i++) await this.constrainInstance(data[i], this.pipeInstances[i])
    return this
  }

  /** Edit parameters of existing pipe */
  edit = async item => {
    await this.api.part.updateExpression({
      id: item.name,
      toUpdate:
        item.type === PipeType.StraightPipe
          ? [
              { name: 'length', value: item.length },
              { name: 'outerDiam', value: this.diameter },
              { name: 'thickness', value: this.thickness },
            ]
          : [
              { name: 'angle', value: (item.angle / 180) * Math.PI },
              { name: 'radius', value: item.radius },
              { name: 'outerDiam', value: this.diameter },
              { name: 'thickness', value: this.thickness },
            ],
    })
    if (item.type === PipeType.CurvedPipe) {
      const constr = await this.api.assembly.getFastened({ id: this.rootAsm, name: item.name + 'FC' })
      await this.api.assembly.updateFastened({ ...constr, zRotation: (item.rotation / 180) * Math.PI })
    }
  }

  /** Add new pipe at the end of the exisiting pipe */
  add = async item => {
    const pipePart = await this.loadAndConfigure(item)
    const pipeInstance = await this.addInstance(pipePart, item.name)
    await this.constrainInstance(item, pipeInstance)
    this.itemsData.push(item)
  }

  /** Remove last pipe element */
  delete = async () => {
    const partToDelete = this.parts[this.parts.length - 1]
    const instanceToDelete = this.pipeInstances[this.pipeInstances.length - 1]
    this.pipeInstances.pop()
    await this.api.assembly.deleteTemplate({ ids: [partToDelete] })
    this.parts.pop()
    this.itemsData.pop()
  }

  /** Save assembly as OFB file */
  saveOfb = async () => {
    const ofbData = await this.api.common.save({ format: 'OFB' })
    if (ofbData) {
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(new Blob([ofbData.content], { type: 'application/octet-stream' }))
      link.download = `PipesAssembly.ofb`
      link.click()
    }
  }

  /** Save assembly as STP file */
  saveStp = async () => {
    const stpData = await this.api.common.save({ format: 'STP' })
    if (stpData) {
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(new Blob([stpData.content], { type: 'application/octet-stream' }))
      link.download = `PipesAssembly.stp`
      link.click()
    }
  }

  /** Update diameter and thickness for all existing pipes */
  updateDiameterAndThickness = async (diameter, thickness) => {
    this.diameter = diameter
    this.thickness = thickness
    // Update all existing parts
    for (let i = 0; i < this.itemsData.length; i++) {
      const item = this.itemsData[i]
      await this.api.part.updateExpression({
        id: item.name,
        toUpdate:
          item.type === PipeType.StraightPipe
            ? [
                { name: 'length', value: item.length },
                { name: 'outerDiam', value: diameter },
                { name: 'thickness', value: thickness },
              ]
            : [
                { name: 'angle', value: (item.angle / 180) * Math.PI },
                { name: 'radius', value: item.radius },
                { name: 'outerDiam', value: diameter },
                { name: 'thickness', value: thickness },
              ],
      })
    }
  }

  /**************** Helper functions ****************/
  loadAndConfigure = async item => {
    const isStraight = item.type === PipeType.StraightPipe
    const data = isStraight ? straightPipe : curvedPipe
    const { id: product } = await this.api.assembly.loadProduct({ data, format: 'OFB', ident: item.name }) // prettier-ignore
    await this.api.part.updateExpression({
      id: product,
      toUpdate: isStraight
        ? [
            { name: 'length', value: item.length },
            { name: 'outerDiam', value: this.diameter },
            { name: 'thickness', value: this.thickness },
          ]
        : [
            { name: 'angle', value: (item.angle / 180) * Math.PI },
            { name: 'radius', value: item.radius },
            { name: 'outerDiam', value: this.diameter },
            { name: 'thickness', value: this.thickness },
          ],
    })
    return product
  }

  addInstance = async (pipePart, instanceName) => {
    const pipeInstance = await this.api.assembly.instance({
      ownerId: this.rootAsm,
      productId: pipePart,
      transformation: [
        [0, 0, 0], // Origin
        [1, 0, 0], // X-Dir
        [0, 1, 0], // Y-Dir
      ],
      name: instanceName,
    })
    console.log('  Added pipe instance', pipeInstance)
    this.pipeInstances.push(pipeInstance)
    this.parts.push(pipePart)
    return pipeInstance
  }

  constrainInstance = async (item, pipeInstance) => {
    if (item.key === '0') {
      const wc0 = await this.api.part.getWorkGeometry({ id: pipeInstance, name: 'WCS0' })
      await this.api.assembly.fastenedOrigin({
        id: this.rootAsm,
        name: item.name + 'FOC',
        mate1: { path: [pipeInstance], csys: wc0, flip: 'Z', reorient: '0' },
      })
    } else {
      const pipeInstBefore = this.pipeInstances[Number(item.key) - 1]
      const wc0 = await this.api.part.getWorkGeometry({ id: pipeInstance, name: 'WCS0' })
      const wc1 = await this.api.part.getWorkGeometry({ id: pipeInstBefore, name: 'WCS1' })
      await this.api.assembly.fastened({
        id: this.rootAsm,
        name: item.name + 'FC',
        mate1: { path: [pipeInstBefore], csys: wc1, flip: 'Z', reorient: '0' },
        mate2: { path: [pipeInstance], csys: wc0, flip: 'Z', reorient: '0' },
        zRotation: item.rotation ? (item.rotation / 180) * Math.PI : 0,
      })
    }
  }
}
