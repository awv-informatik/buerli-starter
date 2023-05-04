```shell
npm install
npm run dev
```

This example shows how to use headless/`cache` with direct, declarative access to resulting geometries.

`cache` allows you to execute commands with React suspense integration, and then access the resulting geometries. This makes it easier maintain full control over meshes, for instance adding events. At the same time you have control over the loading and pending state. Loading fallbacks are controlled via React.Suspense, pending state is controlled via React.useTransition. Pending will leave the current/active result on screen even while a new commend has already been executed and is currently suspending.