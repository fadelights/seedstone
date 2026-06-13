# seedstone

Render a 3D rotating gemstone from any string. The same string always produces the exact same gem.

Every trait — colour, cut, refraction, iridescence, imperfections — is derived deterministically from the seed, making seedstone a drop-in visual identity for usernames, hashes, or UUIDs.

## Quick start

```js
import { SeedstoneRenderer } from 'seedstone';

new SeedstoneRenderer('alice', {
  container: document.getElementById('gem'),
});
```

**Script tag** — include `dist/seedstone.standalone.js`, then use `window.Seedstone.SeedstoneRenderer`.

## API

#### `new SeedstoneRenderer(seed, options)`


## Cuts

To add a cut: create `src/geometries/<name>.ts`, export a default `{ name, build }` object where `build()` returns a `THREE.BufferGeometry`. The registry auto-discovers it on rebuild.

## Development

```sh
# one-time setup
npm install && npm install --prefix website

npm run dev    # watches the library and serves the website simultaneously
npm run build  # production bundle into dist/
npm test       # build + run test suite
```

Visual knobs (material, lights, camera, sparkles) live in [`src/config.ts`](src/config.ts) and are tunable live in the website's config lab.

## License

[MIT](LICENSE)
