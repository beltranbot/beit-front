import React, { Component } from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import Navbar from './components/Layout/Navbar'
import OrderList from './components/Orders/OrderList'
import OrderCreate from './components/Orders/OrderCreate'
import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Navbar/>
          <Switch>
            <Route exact path='/' component={OrderList}/>
            <Route exact path='/orders' component={OrderList}/>
            <Route exact path='/orders/create' component={OrderCreate}/>
            
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

export default App;