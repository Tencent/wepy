
function createGuardManager() {
  const guards = []

  return {
    register(guard) {
      guards.push(guard)

      return () => {
        this.unRegister(guard)
      }
    },

    unRegister(guard) {
      const index = guards.indexOf(guard)

      if (index !== -1) {
        guards.splice(index, 1)

        return true
      }

      console.warn('此 guard 并未注册，因此无法注销 ')

      return false
    },
    clear() {
      guards.length = 0
    },

    get guards() {
      return guards.slice()
    }
  }
}

export { createGuardManager }
