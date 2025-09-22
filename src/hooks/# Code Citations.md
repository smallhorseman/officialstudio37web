# Code Citations

## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = session
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (session
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - last
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime 
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                session
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                session
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                sessionValue = entry.value;
                
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                sessionValue = entry.value;
                sessionEntries = [entry];
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                sessionValue = entry.value;
                sessionEntries = [entry];
              }

              if (sessionValue > clsValue) {
                
```


## License: unknown
https://github.com/warmhug/__/blob/9f9e54833f2f78af57e4e9700c1d39b716825a6d/samples/observer.html

```
(!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                sessionValue = entry.value;
                sessionEntries = [entry];
              }

              if (sessionValue > clsValue) {
                clsValue =
```


## License: unknown
https://github.com/deakin-launchpad/react-frontend-boilerplate/blob/2c1fef3c3d79dd27189e162fa7e0c0740dcac787/src/assets/icons/Image.js

```
="currentColor" viewBox="0 0
```


## License: unknown
https://github.com/BoaterBase/bb-react-components/blob/57cfc9a70cf1da869bea15a543e4d6a10df9dfe4/src/Search/LayoutSelector.js

```
="currentColor" viewBox="0 0
```


## License: unknown
https://github.com/deakin-launchpad/react-frontend-boilerplate/blob/2c1fef3c3d79dd27189e162fa7e0c0740dcac787/src/assets/icons/Image.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="
```


## License: unknown
https://github.com/BoaterBase/bb-react-components/blob/57cfc9a70cf1da869bea15a543e4d6a10df9dfe4/src/Search/LayoutSelector.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="
```


## License: unknown
https://github.com/deakin-launchpad/react-frontend-boilerplate/blob/2c1fef3c3d79dd27189e162fa7e0c0740dcac787/src/assets/icons/Image.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00
```


## License: unknown
https://github.com/BoaterBase/bb-react-components/blob/57cfc9a70cf1da869bea15a543e4d6a10df9dfe4/src/Search/LayoutSelector.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00
```


## License: unknown
https://github.com/deakin-launchpad/react-frontend-boilerplate/blob/2c1fef3c3d79dd27189e162fa7e0c0740dcac787/src/assets/icons/Image.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2
```


## License: unknown
https://github.com/BoaterBase/bb-react-components/blob/57cfc9a70cf1da869bea15a543e4d6a10df9dfe4/src/Search/LayoutSelector.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2
```


## License: unknown
https://github.com/deakin-launchpad/react-frontend-boilerplate/blob/2c1fef3c3d79dd27189e162fa7e0c0740dcac787/src/assets/icons/Image.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2
```


## License: unknown
https://github.com/BoaterBase/bb-react-components/blob/57cfc9a70cf1da869bea15a543e4d6a10df9dfe4/src/Search/LayoutSelector.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2
```


## License: unknown
https://github.com/deakin-launchpad/react-frontend-boilerplate/blob/2c1fef3c3d79dd27189e162fa7e0c0740dcac787/src/assets/icons/Image.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12
```


## License: unknown
https://github.com/BoaterBase/bb-react-components/blob/57cfc9a70cf1da869bea15a543e4d6a10df9dfe4/src/Search/LayoutSelector.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12
```


## License: unknown
https://github.com/deakin-launchpad/react-frontend-boilerplate/blob/2c1fef3c3d79dd27189e162fa7e0c0740dcac787/src/assets/icons/Image.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z
```


## License: unknown
https://github.com/BoaterBase/bb-react-components/blob/57cfc9a70cf1da869bea15a543e4d6a10df9dfe4/src/Search/LayoutSelector.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z
```


## License: unknown
https://github.com/deakin-launchpad/react-frontend-boilerplate/blob/2c1fef3c3d79dd27189e162fa7e0c0740dcac787/src/assets/icons/Image.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg
```


## License: unknown
https://github.com/BoaterBase/bb-react-components/blob/57cfc9a70cf1da869bea15a543e4d6a10df9dfe4/src/Search/LayoutSelector.js

```
="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg
```


## License: unknown
https://github.com/Shifatur-Rahman/Shifatur_Portfolio/blob/63083974b84d97bde77ccd70ade460dfea1f2dd5/src/router/AnimatedRoute.jsx

```
>
          <Routes>
            <Route path="/" element={
```


## License: unknown
https://github.com/sasha-shkapenko/webstudio/blob/4a7febbc6e62a97c8da717d4743b801de9c93575/src/components/App.js

```
>
          <Routes>
            <Route path="/" element={
```


## License: unknown
https://github.com/Shifatur-Rahman/Shifatur_Portfolio/blob/63083974b84d97bde77ccd70ade460dfea1f2dd5/src/router/AnimatedRoute.jsx

```
>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path
```


## License: unknown
https://github.com/sasha-shkapenko/webstudio/blob/4a7febbc6e62a97c8da717d4743b801de9c93575/src/components/App.js

```
>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path
```


## License: unknown
https://github.com/Shifatur-Rahman/Shifatur_Portfolio/blob/63083974b84d97bde77ccd70ade460dfea1f2dd5/src/router/AnimatedRoute.jsx

```
>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<Portfolio
```


## License: unknown
https://github.com/sasha-shkapenko/webstudio/blob/4a7febbc6e62a97c8da717d4743b801de9c93575/src/components/App.js

```
>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<Portfolio
```


## License: unknown
https://github.com/Shifatur-Rahman/Shifatur_Portfolio/blob/63083974b84d97bde77ccd70ade460dfea1f2dd5/src/router/AnimatedRoute.jsx

```
>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/contact
```


## License: unknown
https://github.com/sasha-shkapenko/webstudio/blob/4a7febbc6e62a97c8da717d4743b801de9c93575/src/components/App.js

```
>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/contact
```


## License: unknown
https://github.com/Shifatur-Rahman/Shifatur_Portfolio/blob/63083974b84d97bde77ccd70ade460dfea1f2dd5/src/router/AnimatedRoute.jsx

```
>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="
```


## License: unknown
https://github.com/sasha-shkapenko/webstudio/blob/4a7febbc6e62a97c8da717d4743b801de9c93575/src/components/App.js

```
>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="
```


## License: unknown
https://github.com/KohkiMartinez/My-Portfolio/blob/139159a3453b1169d706b47991ca00d96e672fca/JavaScript/MyFavouritePokemonGenerator/README.md

```
: "^8.53.0",
    "eslint
```


## License: unknown
https://github.com/KohkiMartinez/My-Portfolio/blob/139159a3453b1169d706b47991ca00d96e672fca/JavaScript/MyFavouritePokemonGenerator/README.md

```
: "^8.53.0",
    "eslint-plugin-react": "^7.33.2",
    "
```


## License: unknown
https://github.com/KohkiMartinez/My-Portfolio/blob/139159a3453b1169d706b47991ca00d96e672fca/JavaScript/MyFavouritePokemonGenerator/README.md

```
: "^8.53.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks":
```


## License: unknown
https://github.com/KohkiMartinez/My-Portfolio/blob/139159a3453b1169d706b47991ca00d96e672fca/JavaScript/MyFavouritePokemonGenerator/README.md

```
: "^8.53.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "esl
```


## License: unknown
https://github.com/KohkiMartinez/My-Portfolio/blob/139159a3453b1169d706b47991ca00d96e672fca/JavaScript/MyFavouritePokemonGenerator/README.md

```
: "^8.53.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh":
```

