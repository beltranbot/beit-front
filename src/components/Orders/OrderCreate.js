import axios from 'axios'
import React, { Component } from 'react'
import {
  customers_url,
  customer_products_url,
  orders_url
} from '../../config.env'
import { Link } from 'react-router-dom'

import Loader from 'react-loader-spinner'
class OrderCreate extends Component {

  state = {
    loading: true,
    loading_order_details: false,
    loading_submit: false,
    order_details: [],
    order_details_counter: 0,
    customer_products: [],
    customer_id: null,
    creation_date: null,
    delivery_address: null
  }

  handleOrderDetailChange = (i, e) => {
    let {order_details, customer_products} = this.state

    if (e.target.id === 'product_id') {

      let check = order_details.filter((od, idx) => od[e.target.id] === e.target.value && idx !== i)

      if (check.length > 0) {
        let value = e.target.value
        e.target.selectedIndex = 0
        alert(`Producto '${e.target.id}: ${value}' ya fue seleccionado`)
      } else {
        if (e.target.selectedIndex !== 0) {
          order_details[i][e.target.id] = e.target.value
          let customer_product = customer_products.filter(customer_product => {
            return customer_product.product_id === +e.target.value
          })[0]
          order_details[i]['description'] = customer_product.product.product_description
          order_details[i]['price'] = customer_product.product.price
        } else {
          order_details[i]['description'] = ''
          order_details[i]['price'] = ''
        }
      }

    } else if (e.target.id === 'quantity') {
      order_details[i][e.target.id] = e.target.value
    }
    if (order_details[i]['price'] && order_details[i]['quantity']) {
      order_details[i]['subtotal'] = +order_details[i]['quantity'] * +order_details[i]['price']
    } else {
      order_details[i]['subtotal'] = ''
    }

    this.setState({order_details})
  }

  getNewOrderLine = (i) => {
    let customer_products = {}
    if (this.state.customer_products) {
      customer_products = this.state.customer_products.map(customer_product => {
        let product = customer_product.product
        return (
          <option key={product.product_id} value={product.product_id}>
            {product.name}
          </option>
        )
      })
    }
    let description = (
      this.state.order_details ? this.state.order_details[i] ? this.state.order_details[i]['description'] : '' : ''
    )
    let price = (
      this.state.order_details ? this.state.order_details[i] ? this.state.order_details[i]['price'] : '' : ''
    )
    let subtotal = (
      this.state.order_details ? this.state.order_details[i] ? this.state.order_details[i]['subtotal'] : '' : ''
    )
    return (
      <div className = "form-row" key={i}>
        <div className="col">
          <label htmlFor="product_id">Product*</label>
          <select className="form-control form-control-sm"
            onChange={this.handleOrderDetailChange.bind(this, i)}
            id="product_id" required>
            <option>Select a Product</option>
            {customer_products}
          </select>
          
        </div>
        <div className="col">
          <label htmlFor="description">Description</label>
          <span className="form-control form-control-sm">{description}</span>
        </div>
        <div className="col">
          <label htmlFor="price">Price</label>
          <span className="form-control form-control-sm">{price}</span>
        </div>
        <div className="col">
          <label htmlFor="quantity">Quantity *</label>
          <input
            onChange={this.handleOrderDetailChange.bind(this, i)}
            id="quantity" type="number" min="1" className="form-control form-control-sm"
            required
          />
        </div>
        <div className="col">
          <label htmlFor="subtotal">Subtotal</label>
          <span className="form-control form-control-sm">{subtotal}</span>
        </div>
    </div >
    )
  }

  async loadData() {
    let response = await axios.get(customers_url)
    let customers = response.data.customers

    this.setState({ customers })
  }

  async componentDidMount() {
    this.setState({ loading: true })
    await this.loadData()
    this.setState({ loading: false })
  }

  fetchCustomerProducts = async (customer_id) => {

    let response = await axios.get(customer_products_url + `/${customer_id}`)
    let customer_products = response.data.customer_products

    this.setState({customer_products})
  }

  handleChange = async (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
    if (e.target.id === 'customer_id' && e.target.value) {
      this.setState({order_details: [], customer_products: [], loading_order_details: true})
      await this.fetchCustomerProducts(e.target.value)
      this.setState({loading_order_details: false})
    }
  }

  validateData = (data) => {
    let {
      customer_id,
      creation_date,
      delivery_address,
      order_details,
    } = data
    if (!customer_id) {
      alert('Debe Ingresar un Cliente valido.')
      return false
    }
    if (!creation_date || creation_date.trim().length === 0) {
      alert('Debe Ingresar una Fecha de Creación valida.')
      return false
    }
    if (!delivery_address || delivery_address.trim().length === 0) {
      alert('Debe Ingresar una Dirección de Entrega valida.')
      return false
    }
    if (order_details.length === 0) {
      alert('Debe existir al menos una linea de orden.')
      return false
    } else {
      let i = 0;
      for (const order_detail of order_details) {
        if (!order_detail['product_id']) {
          alert(`Producto en linea ${i + 1} no es valido.`)
          return false
        }
        if (!order_detail['quantity']) {
          alert(`Cantidad en linea ${i + 1} no es valida.`)
          return false
        }
        i++
      }
    }
    return true
  }

  preparePostData = () => {
    let {
      customer_id,
      creation_date,
      delivery_address,
    } = this.state
    let order_details = []

    for (const order_detail of this.state.order_details) {
      let line = {}

      for (const key in order_detail) {
        line[key] = order_detail[key]
      }

      order_details.push(line)
    }

    let order = {
      customer_id,
      creation_date,
      delivery_address,
      order_details
    }

    return order
  }

  handleSubmit = async (e) => {
    e.preventDefault()
    if (!this.validateData(this.state)) return
    this.setState({loading_submit: true})
    let order = this.preparePostData()

    let response = await axios.post(orders_url, order)

    if (response.request.status === 201) {
      this.props.history.push('/orders')
    } else {
      let message = "Se generaron errores al momento de registrar La Orden\n"
      console.log(response)
      alert(message)
    }
  }

  handleAddOrderLine = (e) => {
    e.preventDefault()

    let order_details = this.state.order_details
    let count = order_details.length
    if (count >= 5) return
    
    order_details.push([])

    this.setState({order_details})
  }

  handleRemoveOrderLine = (e) => {
    e.preventDefault()
    let {order_details} = this.state
    if (order_details.length > 0) {
      order_details.pop()
    }

    this.setState({order_details})
  }

  render() {
    let customers = []
    if (this.state.customers) {
      customers = this.state.customers.map(customer => {
        return (
          <option key={customer.customer_id} value={customer.customer_id}>
            {customer.name}
          </option>
        )
      })
    }

    let order_details_body = null
    if (this.state.customer_id) {
      let order_details = this.state.order_details
      order_details = order_details.map((order_detail, i) => {
        return this.getNewOrderLine(i)
      })

      let buttons = (
        <div className="form-row" style={{marginTop: "1cm"}}>
          { 
            this.state.order_details.length >= 5 ?
            null :
            (<button className="btn btn-secondary" onClick={this.handleAddOrderLine}>Add Order line</button>)
          }
          { 
            this.state.order_details.length > 0 ?
            (<button className="btn btn-danger" onClick={this.handleRemoveOrderLine}>Remove Order line</button>) :
            null
            
          }
        </div>
      )

      if (this.state.loading_submit) {
        buttons = null
      }

      order_details_body = (
        <div>
          <h4>Order Details</h4>
          {order_details}
          {buttons}
        </div>
      )
      if (this.state.loading_order_details) {
        order_details_body = (
          <Loader
            type="Oval"
            color="#00BFFF"
            height="100"
            width="100"
          />
        )
      }
    } else {
      order_details_body = (
        <h5>
          <font color="gray">Select a Customer to Continue...</font>
        </h5>
      )
    }
    let submit = (
      <div className="form-row" style={{marginTop: "1cm"}}>
        <div className="col">
          <button className="btn btn-primary">Crear Orden</button>
        </div>
      </div>
    )

    if (this.state.loading_submit) {
      submit = (
        <Loader
          type="Oval"
          color="#00BFFF"
          height="100"
          width="100"
        />
      )
    }



    let form = (
      <form className="white" onSubmit={this.handleSubmit}>
        <div className="form-row">
          <div className="col">
            <label htmlFor="customer_id">Customer *</label>
            <select className="form-control form-control-sm"
              id="customer_id"
              onChange={this.handleChange} required>
              <option>Select a Customer</option>
              {customers}
            </select>
          </div>
          <div className="col">
            <label htmlFor="creation_date">Creation Date*</label>
            <input type="date"
              id="creation_date"
              format="YYYY-MM-DD"
              className="form-control form-control-sm"
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="form-row">

          <div className="col">
            <label htmlFor="delivery_address">Delivery Address *</label>
            <input type="text"
              id="delivery_address"
              placeholder="Delivery Address"
              className="form-control form-control-sm"
              onChange={this.handleChange}
            />
          </div>
        </div>

        {order_details_body}
        
        {submit}

      </form>
    )

    if (this.state.loading) {
      form = (
        <Loader
          type="Oval"
          color="#00BFFF"
          height="100"
          width="100"
        />
      )
    }

    return (
      <main role="main" className="container">
        <div className="card border-primary mb-3" style={{marginTop: '1cm'}}>
          <div className="card-header">
            <Link to="/">Volver</Link>
            <h4>Crear Nueva Orden</h4>
          </div>
          <div className="card-body">
            {form}
          </div>
        </div>
      </main>
    )
  }

}

export default OrderCreate