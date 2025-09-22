# Service Worker Code Citations

## License: unknown
https://github.com/trodrigues/trodrigues.net/blob/cfb3c963c54ed3a2085de7d07bfbd5527bb5fbe3/abp/sw.js

```
event.request
```

## License: MIT
https://github.com/webpack/webpack-cli/blob/3db28625af0a2372d733e442eecd527aad8a5ea5/packages/generators/templates/template.html

```
serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        }
```