- exception handling
    Daniel solved it
- entityInjection docs are not entirely clear as to what the purpose is
- odd arbitrarily named objects for ID's and lack of shorthands
    - for instance [{ id: 1 }, { id: 2 }] instead of [1, 2]
    - [{ pos: [10, 50, 50] }, { pos: [0, 0, 50] }, { pos: [20, 20, 50] }]
    - ...
    It breaks formatting and makes code look like a JSON spreadsheet, it creates visibly 
    more noise and more code to parse. Old examples grew twice or thrice as large in line numbers.
    Possible solution: perhaps a shorthand for these could be introduced
- types are inconsistent
    Sometimes we need to use strings, sometimes enums
    - selectGeometry([ScgGraphicType.CIRCLE], 2))
    - api.part.chamfer({ id: part, type: 'EQUAL_DISTANCE',
    - ...
    Possible solution: use one standard, for instance strings for all types
- Sometimes it's "references", sometimes it's arbitrarily named, like "fillet({ geomIds: edges1"
- await drawing.createBufferGeometry(foo) is confusing to use
    - return await drawing.createBufferGeometry(foo)[0] // crash
    - return [await drawing.createBufferGeometry(foo)] // crash
    - return (await drawing.createBufferGeometry(foo))[0] // works but confusing
    - return const [geo] = await drawing.createBufferGeometry(foo)
      return geo // works
    Needs documentation, it's more of a javascript quirk than a bug due to async/await
- It is not clear how to handle arraybuffers