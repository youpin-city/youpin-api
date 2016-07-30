var isNumericString = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var isIntegerString = function(n) {
  var n = parseFloat(n);
  return Math.floor(n) === n;
}

module.exports = {
  isNumericString: isNumericString,
  isIntegerString: isIntegerString
};
