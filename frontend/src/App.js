import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import {useState} from "react"

function App() {
  const [color, setColor] = useState("#1E384D")
  const [auth, setAuth] = useState(false)
  // const [isAuthenticated, setIsAuthenticated]

  // state = { message: "" }
  function authCallback(isAuthenticated) {
    console.log('function authCallback')
    setAuth(true)
    
  }

  function PrivateRoute ({component: Component, authed, ...rest}) {
    console.log(authed)
    return (
      <Route
        {...rest}
        render={(props) => authed === true
          ? <Component {...props} />
          : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
      />
    )
  }
  // authCallback = (isAuthenticated) => {
    
  //     // this.setState({message: childData})
  // } 


  return (
    <div style={{backgroundColor: color, height: "100vh"}}>
      {/* <Child1 parentCallback = {this.callbackFunction}/> */}
      {/* <p> {this.state.message} </p> */}
      
      <BrowserRouter>
      <Switch>
        <Route path="/login">
          <Login parentCallback = {authCallback}/>
        </Route>
        <PrivateRoute path='/' authed={auth} component={Home} />
        {/* <PrivateRoute authed={false} path='/'>
          <Home />
        </PrivateRoute> */}
        {/* <Route path="/">
          <Home />
        </Route> */}
      </Switch>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
