import './App.css';
import {Switch, Route, Redirect} from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import React, { Component, useState, useEffect } from 'react';
import axios from "axios"
import Inventory from './components/Inventory';

// class App extends Component {
  
//   constructor() {
//     super()
//     this.state = {
//       loggedIn: false,
//       user: null
//     }

//     this.getUser = this.getUser.bind(this)
//     this.componentDidMount = this.componentWillMount.bind(this)
    
//   }

//   componentWillMount() {
//     this.getUser()
//   }

//   getUser() {
//     return new Promise(function (resolve, reject) {
//       axios.get('http://localhost:5000/user/', {withCredentials: true}).then(response => {
//         console.log('Get user response: ')
//         console.log(response.data)
//         if (response.data.user) {
//           console.log('Get User: There is a user saved in the server session: ')
//           console.log(response.data.user)
//           resolve(this.setState({
//             loggedIn: true,
//             user: response.data.user
//           }))
      
//         } else {
//           reject(console.log('Get user: no user'))
//           this.setState({
//             loggedIn: false,
//             username: null
//           })
//         }
//       }
      
//       )})}
 
 

  // render() {

    // const PrivateRoute = ({ component: Component, user, ...rest }) => {

    //   const isLoggedIn = this.state.loggedIn
    //   console.log(isLoggedIn)

    //   return (
    //     <Route
    //       {...rest}
    //       render={props =>
    //         isLoggedIn ? (
    //           <Component {...props} user={user}/>
    //         ) : (
    //           <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    //         )
    //       }
    //     />
    //   )
    // }

  export default function App() {

    const [isLoading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);


    function getUser() {
      axios.get('http://localhost:5000/user/', {withCredentials: true}).then(response => {
        console.log('Get user response: ')
        console.log(response.data)
        
        if (response.data.user) {
          console.log('Get User: There is a user saved in the server session: ')
          setUser(response.data.user)
          setLoggedIn(true)
        } else {
          console.log('Get user: no user')
          
          setUser(response.data.user)
          setLoggedIn(false)
        }
        setLoading(false)
      });
    }

    useEffect(() => {
      getUser()
    }, []);
  
    if (isLoading) {
      return <div className="loader"></div>;
    }

    const PrivateRoute = ({ component: Component, user, ...rest }) => {
      return (
        <Route
          {...rest}
          render={props =>
            user ? (
              <Component {...props} user={user}/>
            ) : (
              <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
            )
          }
        />
      )
    }

    return (
      <div>
        <Switch>
          <Route path="/login">
            <Login isLoggedIn={loggedIn} parentCallback = {getUser}/>
          </Route>
          <PrivateRoute path='/inventory' component={Inventory} user={user}/>
          <PrivateRoute path='/' component={Home} user={user}/>
        </Switch>
      </div>
    );
  }
