
import { createGuardManager } from './guardManager'

const beforeEachManager = createGuardManager()
const beforeResolveManager = createGuardManager()
const afterEachManager = createGuardManager()

export default {
  get beforeEachGuards() {
    return beforeEachManager.guards
  },
  get beforeResolveGuards() {
    return beforeResolveManager.guards
  },
  get afterEachGuards() {
    return afterEachManager.guards
  },
  beforeEach(cb) {
    beforeEachManager.register(cb)
  },
  beforeResolve(cb) {
    beforeResolveManager.register(cb)
  },
  afterEach(cb) {
    afterEachManager.register(cb)
  }
}
