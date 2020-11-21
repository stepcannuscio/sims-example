import './App.css';
import {Switch, Route, Redirect, useHistory} from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import { useState, useEffect } from 'react';
import axios from "axios"
import Inventory from './components/Inventory';

  export default function App() {

    const [isLoading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    const history = useHistory();
    function getUser() {
      setLoggedIn(true)
      // Check with backend to see if there is a user signed in
      axios.get('http://localhost:5000/user/', {withCredentials: true}).then(response => {
        console.log('Get user response: ')
        console.log(response.data)
        if (response.data.user) {
          console.log('Get User: There is a user saved in the server session: ')
          setUser(response.data.user)
          setLoggedIn(true)
          history.push("/")
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
      console.log(user)
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
