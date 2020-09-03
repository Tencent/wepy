module.exports = function createSelectorQuery() {
  return {
    query(selector) {
      return {
        mock: true,
        selector
      };
    }
  };
};
