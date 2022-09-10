// module.exports = () => {
//   const el = [...document.querySelectorAll('div')].filter(el => (el.innerHTML.includes('followers') && el.innerText.length <= 35))[0]
//   return el ? el.querySelector('span').title.replaceAll(',', '') : 'INVALID IG URL'
// }

module.exports = () => {
  function contains(selector, text) {
    var elements = document.querySelectorAll(selector);
    return Array.prototype.filter.call(elements, function (element) {
      return RegExp(text).test(element.textContent);
    });
  };

  // const isNotAvailable = contains('h2', 'this page isn\'t available')[0];
  // console.log({ isNotAvailable })
  // if (isNotAvailable) return 'Page is NOT AVAILABLE';

  // const isLoginPage = contains('a', 'Forgot password?')[0];
  // console.log({ isLoginPage })
  // if (isLoginPage) return 'Page is LOGIN PAGE'

  const elements = contains('div', 'followers');
  console.log({ elements })
  if (elements.length === 0) return 'HTML element not found';
  
  return elements[elements.length - 1].querySelector('span').title.replaceAll(',', '');
}