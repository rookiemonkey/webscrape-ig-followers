module.exports = () => {
  const el = [...document.querySelectorAll('div')].filter(el => (el.innerHTML.includes('followers') && el.innerText.length <= 35))[0]
  return el ? parseInt(el.querySelector('span').title.replaceAll(',', '')) : 'INVALID IG URL'
}