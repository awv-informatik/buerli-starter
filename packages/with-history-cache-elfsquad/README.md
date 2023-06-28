<img src="thumbnail.jpg" width="100%" />
<br />

This example shows how to use headless/history/cache with the Elfsquad CPQ.

Elfsquad provides CPQ software for manufacturing companies that develop, produce and sell complex products. All within your own management.

### Running the example

```shell
git clone https://github.com/awv-informatik/buerli-starter
cd buerli-starter/packages/with-history-cache-elfsquad
npm install
npm run dev
```

To see the example running in Elfsquad, open https://awv.elfsquad.io/configure/connector

### Using Elfsquad

After you have made an account, created your master data and your steps, go to Editor > Step editor. Pick a step and click on "Edit step", the type has to be "Third party visualisation", enter your server url into "Third party visualization URL", you can also use a local url for development, e.g. http://localhost:3000. Click on "Save".

Now that Elfsquad is set up you can listen to configuration changes using an event listener. The configuration is passed as an argument.

```jsx
useEffect(() => {
  window.addEventListener('message', function (e) {
    if (e.data && e.data.name === 'elfsquad.configurationUpdated') {
      const configuration = e.data.args
      // Do something with the configuration
    }
  })
}, [])
```
