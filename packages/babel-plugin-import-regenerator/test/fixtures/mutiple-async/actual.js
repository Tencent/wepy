exports = module.exports = {
  foo () {
    return Promise.resolve(1);
  },
  async bar () {
    console.log(await foo());
  },
  async bar2 () {
    return await foo();
  },
  async bar3 () {
    let result = await bar2();
    console.log(result);
  }
}
