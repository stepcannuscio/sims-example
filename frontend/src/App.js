import './styles/App.css';
import {Switch, Route, Redirect, useHistory, useLocation} from 'react-router-dom'
import { useState, useEffect } from 'react';
import axios from "axios"
import Login from './Login/Login'
import Home from './Home/Home'
import Products from './Products/Product';
import Vendors from "./Vendors/Vendor"
import Orders from "./Orders/Order"

export default function App() {

  const [isLoading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const history = useHistory();
  const location = useLocation();

  const prevLocation = localStorage.getItem('location');
  if (location.pathname !== prevLocation) {
    localStorage.setItem('location', location.pathname);
  }
  
  function getUser() {
    setLoading(true)

    // Check with backend to see if there is a user signed in
    axios.get('http://localhost:5000/user/', {withCredentials: true}).then(response => {
      if (response.data.user) {

        setUser(response.data.user)
        const prevLocation = localStorage.getItem('location');
        setLoggedIn(true)

        if (prevLocation === "/login") {
          history.push("/")
        } else {
          history.push(prevLocation)
        }       
      } else {
        setUser(response.data.user)
        setLoggedIn(false) 
      }
      setLoading(false)
    });
}

  useEffect(() => {
    getUser()

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div style={{backgroundColor: "white"}}>
      <Switch >
        <Route path="/login">
          <Login isLoggedIn={loggedIn} parentCallback = {getUser}/>
        </Route>
        <PrivateRoute path='/orders' component={Orders} user={user}/>
        <PrivateRoute path='/vendors' component={Vendors} user={user}/>
        <PrivateRoute path='/products' component={Products} user={user}/>
        <PrivateRoute path='/' component={Home} user={user}/>
      </Switch>
    </div>
  );
}
