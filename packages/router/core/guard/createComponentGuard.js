
import { createGuardManager } from './guardManager'

function createComponentGuard(name) {
  const beforeRouteLeaveManager = createGuardManager()
  const beforeRouteEnterManager = createGuardManager()
  const beforeRouteUpdateManager = createGuardManager()

  return {
    get name() {
      return name
    },
    get beforeRouteLeaveGuards() {
      return beforeRouteLeaveManager.guards
    },
    get beforeRouteEnterGuards() {
      return beforeRouteEnterManager.guards
    },
    get beforeRouteUpdateGuards() {
      return beforeRouteUpdateManager.guards
    },
    beforeRouteLeave(cb) {
      beforeRouteLeaveManager.register(cb)
    },
    beforeRouteEnter(cb) {
      beforeRouteEnterManager.register(cb)
    },
    beforeRouteUpdate(cb) {
      beforeRouteUpdateManager.register(cb)
    }
  }
}

export default createComponentGuard
