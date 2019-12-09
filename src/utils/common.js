const utils = {};

utils.addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

utils.formatCurrency = (n, currency) => {
  return (
    currency +
    n.toFixed(0).replace(/./g, function (c, i, a) {
      return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
    })
  );
};

const CONSTANTS = require('../utils/constants');
var chars = Object.keys(CONSTANTS.characterMap).join('|');
var allAccents = new RegExp(chars, 'g');
var firstAccent = new RegExp(chars, '');

function matcher(match) {
  return CONSTANTS.characterMap[match];
}

var hasAccents = function (string) {
  return !!string.match(firstAccent);
};

utils.removeAccents = (text) => {
  if (hasAccents(text)) return text.replace(allAccents, matcher);
  else return text;
}

module.exports = utils;
