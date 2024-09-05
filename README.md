# seagull
![](https://img.shields.io/github/actions/workflow/status/sweeneyngo/seagull/deploy-build.yml)

An implementation of Conway's Game of Life (CGOL, pronounced c-gull) + and simulator running in the browser. Recommended for desktops for best experience.

<p align="center">
<a href="https://ifuxyl.dev/">
<img src="image.png" width="800"><br>
<strong>ifuxyl.dev/seagull</a> </strong>
</p>

The application is written in Typescript + [React](https://react.dev/) and built with [Vite](https://vitejs.dev/).
Implemented with the [HashLife](https://en.wikipedia.org/wiki/Hashlife) algorithm (quadtrees & memoization).

Supports edit mode, infinite canvas, zoom & pan, pattern import, and  step size & speed.


## Building
Not necessarily in active development, but we welcome any contributions. Feel free to submit an issue or contribute code via PR to the `main` branch.

To build the site for development:
```bash
# If you don't have Node v22 or pnpm v9:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
nvm install node
npm install -g pnpm

# Install in project root
pnpm install && pnpm run dev
```

You should now access the webpage at `http://localhost:5173/seagull/`,
Any changes in `src` will be immediately available through [Vite](https://vitejs.dev/).

## License

<sup>
All code is licensed under the <a href="LICENSE">MIT license</a>.
</sup>
