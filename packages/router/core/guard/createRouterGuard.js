
import { createGuardManager } from './guardManager'

function createRouterGuard(name) {
  const beforeEnterManager = createGuardManager()

  return {
    get name() {
      return name
    },
    get beforeEnterGuards() {
      return beforeEnterManager.guards
    },
    beforeEnter(cb) {
      beforeEnterManager.register(cb)
    }
  }
}

export default createRouterGuard
