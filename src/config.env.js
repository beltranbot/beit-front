const proxy = 'https://cors-anywhere.herokuapp.com/'
const base_url = 'http://127.0.0.1:8000/api/'

const use_proxy = false
let url = ''
if (use_proxy) {
  url = proxy + base_url
} else {
  url = base_url
}

const orders_url = url + 'orders'
const customers_url = url + 'customers'

export {
  proxy,
  base_url,
  url,
  orders_url,
  customers_url
}
