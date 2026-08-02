// Standalone entry point for Node.js hosting panels (e.g. Hostinger's
// Passenger-based Node.js App Manager) that run a startup file directly
// instead of an npm script like `next start`. Not needed on hosts that let
// you set a start command — those can just use `npm run start`.
import { createServer } from 'http'
import next from 'next'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res)
  }).listen(port, () => {
    console.log(`Fastora frontend ready on port ${port}`)
  })
})
