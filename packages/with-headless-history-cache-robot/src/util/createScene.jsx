import * as THREE from 'three'
import { getDrawing, MathUtils } from '@buerli.io/core'
import { ccAPI, CCClasses, ccUtils } from '@buerli.io/classcad'
import * as BufferGeometryUtils_ from 'three/examples/jsm/utils/BufferGeometryUtils'

let BufferGeometryUtils = BufferGeometryUtils_
if (BufferGeometryUtils.BufferGeometryUtils) {
  BufferGeometryUtils = BufferGeometryUtils.BufferGeometryUtils
}

/**
 * Get all meshes in a map, sorted by their color / opacity
 * @param entity entity to look for the meshes
 * @returns map (key = color/opacity as string, value = object containing the meshes, color and opacity)
 */
const getDifferentColoredMeshesFromEntity = entity => {
  const colorMeshesMap = {}
  entity.meshes.forEach(mesh => {
    const color = mesh.color ? mesh.color : entity.color
    const opacity = mesh.opacity ? mesh.opacity : entity.opacity
    const key = color?.getHexString() + opacity?.toString()
    if (colorMeshesMap[key]) {
      colorMeshesMap[key].meshes.push(mesh)
    } else {
      colorMeshesMap[key] = { meshes: [mesh], color, opacity }
    }
  })
  return colorMeshesMap
}

export async function createScene(drawingId, objectId, options) {
  const rObjectId = await objectId
  const cDrawing = getDrawing(drawingId)
  const structureTree = cDrawing.structure.tree
  const scene = new THREE.Scene()
  const result = {
    nodes: {},
    materials: {},
  }
  if (rObjectId != null) {
    const rootObj = structureTree[rObjectId]
    if (rootObj) {
      await createRecursiveScene(rootObj, drawingId, scene, result, options)
    } else {
      throw new Error('Root object does not exist!')
    }
  }
  return { scene, ...result }
}

/**
 * We traverse recursively over structure tree, starting with object and create THREE objects
 * for the scene. Each part or assembly will be turned into groups and subgroups. Solids which are children of the
 * parts will be turned into groups as well. Children of solids will be merged to meshes. Faces of a solid with different color
 * or transparency will get its own mesh.
 * @param object root object where we start building the three scene
 * @param drawingId id of the drawing
 * @param root the root of the scene
 * @param result object containing all the current collected nodes, solids, meshes
 * @param options e.g. meshPerGeometry controls if each geometry element gets a own mesh or if they will be combined/merged
 */
async function createRecursiveScene(object, drawingId, root, result, options) {
  let cDrawing = getDrawing(drawingId)
  const tree = cDrawing.structure.tree
  if (object.link || object.solids) {
    // Part
    const entities = object.link ? tree[object.link].solids : object.solids
    if (entities != undefined) {
      const part = new THREE.Group()
      const matrix = object.coordinateSystem ? MathUtils.convertToMatrix4(object.coordinateSystem) : new THREE.Matrix4()
      matrix.decompose(part.position, part.quaternion, part.scale)
      part.updateMatrix()
      part.userData = { id: object.id } // product reference id
      part.name = object.name // product reference name
      for (const entity of entities) {
        let cachedEntity = cDrawing.geometry.cache[entity]
        if (!cachedEntity) {
          // else get visualisation from classcad
          await ccAPI.baseModelerAPI.requestVisualisationOfEntities(drawingId, [entity])
          cDrawing = getDrawing(drawingId) // get current drawing state after request
          cachedEntity = cDrawing.geometry.cache[entity]
        }
        if (cachedEntity && cachedEntity.meshes.length > 0) {
          const solidObject = cDrawing.structure.tree[cachedEntity.container.ownerId]
          if (solidObject) {
            const _solid = new THREE.Group()
            _solid.name = solidObject.name + '_solid'
            _solid.userData = { id: solidObject.id } // add solid id to the userData

            if (options?.meshPerGeometry) {
              // Create a mesh for each geometry element
              cachedEntity.meshes.forEach((m, i) => {
                const mesh = new THREE.Mesh()
                mesh.name = solidObject.name + '_' + i
                mesh.userData = { id: m.graphicId } // add graphic id to the userData

                if (!options?.structureOnly) {
                  mesh.geometry = m.geometry
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: m.color ? m.color : cachedEntity.color,
                    transparent: m.color ? m.opacity < 1 : cachedEntity.opacity < 1,
                    opacity: m.color ? m.opacity : cachedEntity.opacity,
                  })
                  result.materials[mesh.name + '_material'] = mesh.material
                }

                result.nodes[mesh.name] = mesh
                _solid.add(mesh)
              })
              part.add(_solid)
              result.nodes[_solid.name] = _solid
            } else {
              // Merge all geometries into one mesh, sort them by color
              const colorMeshesMap = getDifferentColoredMeshesFromEntity(cachedEntity)
              const colorMeshes = Object.keys(colorMeshesMap)

              if (colorMeshes.length > 1) {
                // If the solid consists of multiple meshes we must keep the group
                colorMeshes.forEach((key, i) => {
                  const mesh = new THREE.Mesh()
                  mesh.name = solidObject.name + '_' + i
                  mesh.userData = { id: solidObject.id } // add solid id to the userData

                  if (!options?.structureOnly) {
                    mesh.geometry = BufferGeometryUtils.mergeGeometries(colorMeshesMap[key].meshes.map(m => m.geometry))
                    mesh.material = new THREE.MeshStandardMaterial({
                      color: colorMeshesMap[key].color,
                      transparent: colorMeshesMap[key].opacity < 1,
                      opacity: colorMeshesMap[key].opacity,
                    })
                    result.materials[mesh.name + '_material'] = mesh.material
                  }

                  result.nodes[mesh.name] = mesh // Collect mesh to return result later
                  _solid.add(mesh) // Add mesh to solid of the scene
                })
                part.add(_solid)
                result.nodes[solid.name] = _solid
              } else {
                // Otherwise we can use the mesh itself
                const key = colorMeshes[0]
                const mesh = new THREE.Mesh()
                mesh.name = solidObject.name
                mesh.userData = { id: solidObject.id } // add solid id to the userData

                if (!options?.structureOnly) {
                  mesh.geometry = BufferGeometryUtils.mergeGeometries(colorMeshesMap[key].meshes.map(m => m.geometry))
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: colorMeshesMap[key].color,
                    transparent: colorMeshesMap[key].opacity < 1,
                    opacity: colorMeshesMap[key].opacity,
                  })
                  result.materials[mesh.name + '_material'] = mesh.material
                }

                result.nodes[mesh.name] = mesh
                part.add(mesh)
              }
            }
          }
        }
      }
      root.add(part)
      result.nodes[part.name] = part
    }
  } else if (object.children) {
    // Assembly
    const assembly = new THREE.Group()
    const matrix = object.coordinateSystem ? MathUtils.convertToMatrix4(object.coordinateSystem) : new THREE.Matrix4()
    matrix.decompose(assembly.position, assembly.quaternion, assembly.scale)
    assembly.updateMatrix()
    assembly.userData = { id: object.id } // assembly root or product reference id
    assembly.name = object.name // assembly root or product reference name
    result.nodes[assembly.name] = assembly
    root.add(assembly)
    for (const child of object.children) {
      if (ccUtils.base.isA(tree[child].class, CCClasses.IProductReference)) {
        await createRecursiveScene(tree[child], drawingId, assembly, result, options)
      }
    }
  }
}
