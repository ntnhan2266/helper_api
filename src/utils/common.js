const utils = {};

utils.addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

utils.formatCurrency = (n, currency) => {
  return (
    currency +
    n.toFixed(0).replace(/./g, function(c, i, a) {
      return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
    })
  );
};

module.exports = utils;
