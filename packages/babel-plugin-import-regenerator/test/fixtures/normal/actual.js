import wepy from '@wepy/core'

wepy.page({
  methods: {
    sleep (s) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('promise resolved')
        }, s * 1000)
      })
    },
    async testAsync () {
      const result = await this.sleep(3)
      console.log(result)
    }
  }
})