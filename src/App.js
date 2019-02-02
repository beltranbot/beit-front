import React, { Component } from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import Navbar from './components/Layout/Navbar'
import OrderList from './components/Orders/OrderList'
import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Navbar/>
          <Switch>
            <Route exact path='/' component={OrderList}/>
            
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

export default App;

/*
<Route exact path='/orders' component={OrderList}/>
            <Route exact path='/orders/create' component={OrderCreate}/>
* */