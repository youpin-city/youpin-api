module.exports = () => {
  // Shorthand function to allow checking available interface of an object
  Object.defineProperty(Object.prototype, 'can', { // eslint-disable-line no-extend-native
    writable: true,
    value: function (method) { // eslint-disable-line object-shorthand, func-names
      return (typeof this[method] === 'function');
    },
  });
};
