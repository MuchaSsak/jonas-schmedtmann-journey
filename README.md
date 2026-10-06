# Jonas Schmedtmann Journey

Every project I built while going through Jonas Schmedtmann's React and JavaScript courses, in one repo and deployed as one site. Pick a project from the list and it opens right in your browser ⚛️🍕

_Note: this is old work for me at this point. The code follows the lessons closely and isn't polished or refactored. The courses, their starter code and assets come from [Jonas Schmedtmann](https://codingheroes.io/). This repo is not affiliated with or endorsed by him. Some apps originally needed a backend (Supabase, json-server, the OMDb API, …); here their data is mocked with local seed data so they run without one, and those apps show a small "Demo mode" note._

![Certificate of completion](.github/certificate.png)

## Running locally

```bash
npm install

# run one project in dev mode
npm run dev -w 10-worldwise      # Vite and Next.js projects
npm start -w 02-pizza-menu       # Create React App projects

# build everything into dist/ and preview the site with the project picker
npm run build
npm run preview
```

`npm run build -- 10 js-08` builds only the projects whose folder starts with `10` or `js-08`.

## Deploying

The repo is set up for [Vercel](https://vercel.com/): import it as a new project, pick **Other** as the Application Preset (not "Services") and keep the other defaults, since [vercel.json](vercel.json) already sets the install and build commands, the output folder and the rewrites for apps with client-side routing. The build script ([scripts/build.mjs](scripts/build.mjs)) builds every project into its own subpath (`/10-worldwise/`, `/js-08-forkify/`, …) and generates the index page.

## Acknowledgements

- [Jonas Schmedtmann](https://codingheroes.io/): [The Ultimate React Course](https://www.udemy.com/course/the-ultimate-react-course/) and [The Complete JavaScript Course](https://www.udemy.com/course/the-complete-javascript-course/), their starter code and assets
- [React](https://react.dev/), [React Router](https://reactrouter.com/), [Redux Toolkit](https://redux-toolkit.js.org/), [TanStack Query](https://tanstack.com/query) and [Next.js](https://nextjs.org/)
- [Vite](https://vite.dev/), [Create React App](https://create-react-app.dev/) and [Parcel](https://parceljs.org/)
- [Tailwind CSS](https://tailwindcss.com/) and [styled-components](https://styled-components.com/)
- [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- [Open-Meteo](https://open-meteo.com/), [Frankfurter](https://frankfurter.dev/), [BigDataCloud](https://www.bigdatacloud.com/) and the [forkify API](https://forkify-api.jonas.io/): public APIs that still work without a key
- [REST Countries](https://github.com/apilayer/restcountries) (MPL-2.0): the local country data used by the "Where Am I?" project, with flags from [Flagpedia](https://flagpedia.net/)

## License

[MIT](LICENSE): covers my own code only. Course material, starter code and assets from Jonas Schmedtmann's courses keep their original terms.
