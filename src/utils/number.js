const isNumericString = (n) => !isNaN(parseFloat(n)) && isFinite(n);

const isIntegerString = (n) => {
  const floatN = parseFloat(n);
  return Math.floor(floatN) === floatN;
};

module.exports = {
  isNumericString,
  isIntegerString,
};
