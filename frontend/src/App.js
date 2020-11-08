import './App.css';
import {BrowserRouter, Switch, Route, Redirect, useHistory, withRouter} from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import React, { Component } from 'react';
import {useState} from "react"
import axios from "axios"
// import PrivateRoute from "./PrivateRoute"

class App extends Component {
  
  constructor() {
    super()
    this.state = {
      loggedIn: false,
      username: null
    }

  

    
    // this.history = this.useHistory.bind(this)
    this.getUser = this.getUser.bind(this)
    // this.checkUser = this.checkUser.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    // this.updateUser = this.updateUser.bind(this)
    
  }

  componentDidMount() {
    this.getUser()
    // this.render()
  }

  // updateUser (userObject) {
  //   this.setState(userObject)
  // }

  getUser() {
    axios.get('http://localhost:5000/user/', {withCredentials: true}).then(response => {
      console.log('Get user response: ')
      console.log(response.data)
      if (response.data.user) {
        console.log('Get User: There is a user saved in the server session: ')

        this.setState({
          loggedIn: true,
          username: response.data.user.username
        })
        this.render()
      } else {
        console.log('Get user: no user');
        this.setState({
          loggedIn: false,
          username: null
        })
        // this..push("/")
      }
    }
    )
  }

  // checkUser() {
  //   axios.get('http://localhost:5000/user/', {withCredentials: true}).then(response => {
  //     console.log('Get user response: ')
  //     console.log(response.data)
  //     if (response.data.user) {

  //       return true
  //     } else {
  //       return false
  //     }
  //   }
  //   )
  // }


  
  // const [color, setColor] = useState("#1E384D")
  // const [auth, setAuth] = useState(false)
  // const [authenticated, setAuthenticated] = useState({loggedIn: false, username: null})
  // // const [isAuthenticated, setIsAuthenticated]

  // // state = { message: "" }
  // function authCallback(isAuthenticated) {
  //   console.log('function authCallback')
  //   setAuth(true)
  //   // axios.get("http://localhost:5000/user", { withCredentials: true })
  //   // .then(req => console.log(req))
  //   // .catch(console.error);
  
    
  // }

  // function getUser() {
  //   axios.get('/user/').then(response => {
  //     console.log('Get user response: ')
  //     console.log(response.data)
  //     if (response.data.user) {
  //       console.log('Get User: There is a user saved in the server session: ')

  //       setAuthenticated({
  //         loggedIn: true,
  //         username: response.data.user.username
  //       })
  //     } else {
  //       console.log('Get user: no user');
  //       setAuthenticated({
  //         loggedIn: false,
  //         username: null
  //       })
  //     }
  //   })
  // }

  //   componentDidMount() {
  //     getUser()
  //   }



    // axios.get("http://localhost:5000/user", { withCredentials: true })
    // .then(req => console.log(req.user))
    // .catch(console.error);
  

 

  render() {

  // const PrivateRoute = ({component: Component, authed, ...rest}) => {
  //   console.log("Private route")
  //   console.log(authed)
  //   return (
  //     <Route
  //       {...rest}
  //       render={(props) => authed === true
  //         ? <Component {...props} />
  //         : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
  //     />
  //   )
  // }

    // const {isAuthenticate} = 
    // const { from } = this.props.location || { from: { pathname: '/' } }

    // if (this.state.loggedIn === true) {
    //   console.log('logged in yuhh')
    //   // this.props.history.push("/")
    //   // withRouter(<Home />)
    //   return <Redirect to="/"/>
      
   
    // }

    const PrivateRoute = ({ component: Component, ...rest }) => {

      // Add your own authentication on the below line.
      // var isLoggedIn = false

      // axios.get('http://localhost:5000/user/', {withCredentials: true}).then(response => {
      //   console.log('Get user response: ')
      //   console.log(response.data)
      //   if (response.data.user) {
  
      //     isLoggedIn = true
      //   } else {
      //     isLoggedIn = false
      //   }
      // }
      // )
      
      // console.log(isLoggedIn)
      const isLoggedIn = this.state.loggedIn
      // console.log(isLoggedIn)
    
      return (
        <Route
          {...rest}
          render={props =>
            isLoggedIn ? (
              <Component {...props} />
            ) : (
              <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
            )
          }
        />
      )
    }
    

    // const PrivateRoute = ({ component: Component, ...rest }) => (
      
    //   <Route {...rest} render={(props) => (
    //     this.state.loggedIn === true
    //       ? <Component {...props} />
    //       : <Redirect to={{
    //           pathname: '/login',
    //           // state: { from: props.location }
    //         }} />
    //   )} />
    // )
    

    return (
      <div style={{backgroundColor: "#1E384D", height: "100vh"}}>
        
        <BrowserRouter>
        <Switch>
          <Route path="/login">
            {/* parentCallback = {authCallback} */}
            <Login isLoggedIn={this.state.loggedIn} parentCallback = {this.getUser}/>
          </Route>
          <PrivateRoute path='/' component={Home} />
          {/* <PrivateRoute path='/' authed={this.state.loggedIn} component={Home} /> */}
          {/* <PrivateRoute authed={false} path='/'>
            <Home />
          </PrivateRoute> */}
          {/* <Route path="/" component={Home} /> */}
          </Switch>
  
        </BrowserRouter>
        
      </div>
    );
  }
}

export default App;
