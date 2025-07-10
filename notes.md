1. Try/catch

All commands throw by default, so you can use try/catch to handle errors.

    ```jsx
    try {
      const { result: id } = await api.part.create({ name: 'Flange' })
    } catch (error) {
      console.error('Error creating part:', error)
    }
    ```

Why is { result, messages } then necessary?

    ```jsx
    try {
      const id = await api.part.create({ name: 'Flange' })
    } catch (error) {
      console.error('Error creating part:', error)
    }
    ```

2. Async/await is hard to profile

    ```jsx
    const { result: wc0 } = this.api.part.getWorkGeometry({ id: pipeInstance, name: 'WCS0' })
    // wc0 === undefined ❌

    const wc0 = this.api.part.getWorkGeometry({ id: pipeInstance, name: 'WCS0' })
    // wc0 === Promise { <pending> } ✅    
    ```

3. Named results

    ```jsx
    const { result: { id: foo } } = await this.api.assembly.loadProduct({ data, ident: item.name }) 
    const { result: { part: bar } } = await this.api.part.create()     
    ```

4. Code formatter

    ```jsx
    // 3 lines
    const {
      result: id
    } = await api.part.create({ name: 'Flange' })

    // 5 lines
    const { 
      result: { 
        id: fooProd 
      } 
    } = await this.api.assembly.loadProduct({ data, ident: item.name }) 
    ```