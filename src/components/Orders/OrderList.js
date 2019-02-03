import axios from 'axios'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { orders_url, customers_url } from '../../config.env'
import Loader from 'react-loader-spinner'

class OrderList extends Component {

  state = {
    orders: [],
    customers: [],
    query_customer: null,
    query_date_start: null,
    query_date_end: null,
    loading: true,
    loading_changing_page: false,
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: 0
  }

  async componentDidMount() {
    this.setState({ loading: true })
    await this.loadData()
    this.setState({ loading: false })
  }

  parsePaginationData = (orders) => {
    let current_page = orders.current_page
    let last_page = orders.last_page
    let prev_page_url = orders.prev_page_url
    let next_page_url = orders.next_page_url
    let total = orders.total
    this.setState({
      current_page,
      last_page,
      prev_page_url,
      next_page_url,
      total,
    })
  }

  loadData = async () => {
    let response = await axios.get(orders_url)
    let orders = response.data.orders.data
    this.parsePaginationData(response.data.orders)

    response = await axios.get(customers_url)
    let customers = response.data.customers

    this.setState({
      orders, customers
    })
  }

  queryOrders = async (params) => {
    let response = await axios.get(orders_url, { params })
    let orders = response.data.orders.data
    this.parsePaginationData(response.data.orders)

    this.setState({
      orders
    })
  }

  handleResetFilters = async e => {
    e.preventDefault()
    document.getElementById("query_form").reset()
    let query_customer = null
    let query_date_start = null
    let query_date_end = null
    this.setState({
      query_customer,
      query_date_start,
      query_date_end,
      loading: true
    })

    await this.loadData()
    this.setState({loading: false})
  }

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  prepareQueryParams = () => {
    let query_params = {}
    if (this.state.query_customer) {
      query_params.customer_id = this.state.query_customer
    }
    if (this.state.query_date_start) {
      query_params.date_start = this.state.query_date_start
    }
    if (this.state.query_date_end) {
      query_params.date_end = this.state.query_date_end
    }

    return query_params
  }

  handleSubmit = async e => {
    e.preventDefault()

    this.setState({loading: true})
    let query_params = this.prepareQueryParams()
    await this.queryOrders(query_params)
    this.setState({loading: false})

  }

  handlePagination = async (type, page = null) => {
    if (this.state.loading_changing_page || this.state.loading) return
    let url = null
    this.setState({loading_changing_page: true, loading: true})
    if (type === 'previous' && this.state.prev_page_url !== null) {
      url = this.state.prev_page_url
    } else if (type === 'next' && this.state.next_page_url !== null) {
      url = this.state.next_page_url
    } else if (type === 'number' && page) {
      url = orders_url + `?page=${page}`
    }

    if (!url) {
      this.setState({
        loading_changing_page: false,
        loading: false
      })
      return
    }
    let query_params = this.prepareQueryParams()
    let response = await axios.get(url, {params: query_params})
    let orders = response.data.orders.data
    this.parsePaginationData(response.data.orders)

    this.setState({
      orders,
      loading_changing_page: false,
      loading: false
    })
  }

  render() {
    let orders = []

    if (this.state.orders) {

      orders = this.state.orders.map(order => {
        let order_details = order.order_details.map(order_detail => {
          let product_name = order_detail.product ?
            order_detail.product.name : <font color="red">No Product</font>

          return (
            <li key={order_detail.order_detail_id}>
              {order_detail.quantity} x {product_name}
            </li>
          )
        })

        return (
          <tr key={order.order_id}>
            <td>{order.creation_date}</td>
            <td>{order.order_id}</td>
            <td>{order.customer.name}</td>
            <td>$ {order.total}</td>
            <td>{order.delivery_address ? order.delivery_address : <font color="red">No Address</font>}</td>
            <td>
              {
                (order_details.length === 0) ? (
                  <font color="red">No Products Selected</font>
                ) : (<ul>{order_details}</ul>)
              }

            </td>
          </tr>
        )
      })
    }
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

    let table = (
      <table className="table table-hover table-striped" style={{border: '1px solid black'}}>
        <thead className="thead-dark">
          <tr>
            <th>Creation Date</th>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total $</th>
            <th>Delivery Address</th>
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
          {orders}
        </tbody>
      </table>
    )

    if (this.state.loading) {
      table = (
        <Loader
          type="Oval"
          color="#00BFFF"
          height="100"
          width="100"
        />
      )
    }

    let pagination = null

    if (this.state.orders.length > 0) {
      let links = []

      for (let i = 1; i <= this.state.last_page; i++ ) {
        let classes = this.state.current_page === i ? "page-item active" : "page-item"
        links.push(
          <li key={i} className={classes}><button className="page-link" onClick={this.handlePagination.bind(this, 'number', i)}>{i}</button></li>
        )
      }
      pagination = (
        <div>
          <nav aria-label="Page navigation">
            <ul className="pagination">
              <li className="page-item"><button className="page-link" onClick={this.handlePagination.bind(this, 'previous', 0)}>Previous</button></li>
              {links}
              <li className="page-item"><button className="page-link" onClick={this.handlePagination.bind(this, 'next', 0)}>Next</button></li>
            </ul>
          </nav>
          <p><strong>Total:</strong> {this.state.total}</p>
        </div>
      )
    }

    return (
      <main role="main" className="container">
        <div className="jumbotron">
          <div>
            <Link className="btn btn-primary" to={'/orders/create'}>Nueva Orden</Link>
          </div>
          <div style={{ border: "1px solid black", marginBottom: "1cm", marginTop: "1cm" }}>
            <form id="query_form" onSubmit={this.handleSubmit}>
              <h5 className="grey-text text-darken-3" style={{ marginTop: '0.5cm' }}>Filtros de Busqueda</h5>

              <div className="form-row">
                <div className="col">

                  <label htmlFor="query_customer">Customer</label>

                  <select id="query_customer"
                    className="form-control form-control-sm"
                    onChange={this.handleChange}>
                    <option value="">Select a Customer</option>
                    {customers}
                  </select>
                </div>

                <div className="col">
                  <label htmlFor="query_date_start">Fecha Inicial</label>
                  <input type="date"
                    id="query_date_start"
                    className="form-control form-control-sm"
                    placeholder="Fecha Inicial"
                    onChange={this.handleChange}
                  />
                </div>

                <div className="col">
                  <label htmlFor="query_date_end">Fecha Final</label>
                  <input type="date"
                    id="query_date_end"
                    className="form-control form-control-sm"
                    placeholder="Fecha Final"
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginTop: "1cm", marginBottom: "0.5cm" }}>
                <div className="col">
                  <button className="btn btn-primary">Buscar</button>
                  <button className="btn btn-secondary" onClick={this.handleResetFilters}>limpiar filtros</button>
                </div>
              </div>
            </form>
          </div>
          {pagination}
          {table}

        </div>
      </main>

    )
  }

}

export default OrderList