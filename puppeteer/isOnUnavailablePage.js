module.exports = () => {
  function contains(selector, text) {
    var elements = document.querySelectorAll(selector);
    return Array.prototype.filter.call(elements, function (element) {
      return RegExp(text).test(element.textContent);
    });
  };

  const isNotAvailable = contains('h2', 'this page isn\'t available')[0];
  return isNotAvailable ? true : false 
}