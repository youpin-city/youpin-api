const defaults = {};

module.exports = (options) => { // eslint-disable-line no-unused-vars
  options = Object.assign({}, defaults, options); // eslint-disable-line no-param-reassign

  return (hook) => {
    hook.process = true; // eslint-disable-line no-param-reassign
  };
};
