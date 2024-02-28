This example demos a simple CLI tool to generate images of CAD models using buerli headless and puppeteer.

```shell
git clone https://github.com/awv-informatik/buerli-starter
cd buerli-starter/packages/with-solid-puppeteer
npm install
```

The tool will output the following api:

```shell
	Usage
	  $ npx cad2img [model.stp] [options]

	Options
    --shadows, -s       Shadows (default: true)
    --diffuse, -d       Diffuse (default: 3.14)
    --ambience, -a      Ambience (default: 1)
    --bg, -b            Background color (default: "#f0f0f0")
    --direction, -d     Direction (default: "[1,1,1]")
    --ext, -e           File extension for batch processing (default: stp)
```

Either target specific files

```shell
node cli.js public/models/blends/BoxFillets4rad.stp --shadows=true --bg=orange --direction="[0,1,1]"
```

Or directories

```shell
node cli.js public/models/blends --ext="stp" --shadows=true --bg=orange --direction="[0,1,1]"
```