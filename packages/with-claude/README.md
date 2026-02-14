# Buerli.io Example: Whiffle Ball

This example demonstrates how to create a whiffle ball using Buerli.io's React API and ClassCAD, following the [FreeCAD Whiffle Ball tutorial](https://wiki.freecad.org/Whiffle%20Ball%20tutorial).

## Features

- Creates a hollow spherical shell from a cube using boolean operations
- Adds three perpendicular cylindrical holes (whiffle ball pattern)
- Uses slice operations to cut corners and create a sphere-like shape
- Renders the geometry using the `<Geometry />` component from `useBuerliCadFacade`

## What This Example Shows

### Buerli.io React API Usage
- `useBuerliCadFacade` hook for accessing the CAD engine
- `<Geometry />` component for rendering CAD geometry in React Three Fiber

### ClassCAD API Operations
- `api.part.create()` - Creating a CAD part
- `api.part.entityInjection()` - Setting up solid operations
- `api.solid.box()` - Creating boxes/cubes
- `api.solid.cylinder()` - Creating cylinders with rotation
- `api.solid.subtraction()` - Boolean subtraction (creating hollow shell and holes)
- `api.solid.slice()` - Slicing solids with planes to create spherical shape

## Running the Example

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000).

## Code Structure

- `src/App.jsx` - Main component with whiffle ball creation logic
- `src/main.jsx` - Application entry point with Buerli initialization
- `src/Pending.jsx` - Loading status component
- `src/styles.css` - Basic styles

## How It Works

Based on the FreeCAD tutorial, this implementation:

1. Creates an outer box (90×90×90mm) centered at the origin
2. Creates an inner box (80×80×80mm) and subtracts it to create a 5mm thick hollow shell
3. Creates three perpendicular cylinders (55mm diameter, 120mm height):
   - One along the Z-axis (vertical)
   - One along the X-axis (rotated 90°)
   - One along the Y-axis (rotated 90°)
4. Subtracts all three cylinders to create the characteristic whiffle ball holes
5. Uses 8 slice operations (4 on bottom corners, 4 on top corners) to cut the cube into a sphere-like shape
6. Renders the result with yellow material, shadows, and orbit controls

## Learn More

- [Buerli.io React API Documentation](https://buerli.io/docs/api/react)
- [ClassCAD Documentation](https://classcad.ch/docs/)
