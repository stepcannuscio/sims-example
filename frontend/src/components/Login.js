import React, {useState} from "react"
import logo from "../images/logo.png"
import axios from "axios"
import { useHistory, Redirect } from "react-router-dom";


export default function Login(props) {

  
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const history = useHistory();
    console.log(history)
    

    if (props.isLoggedIn) {
        return <Redirect to="/" />
    }

    // if (props.isLoggedIn) {

    //     console.log("checking log in !!!")
    //     // console.log(history.location)
        
    //     if (history.location.state) {
    //         if (history.location.state.from) {
    //             // Comes from login -> User logged in
    //             if (history.location.state.from.pathname === "/login") {
    //                 return <Redirect to="/"/>
    //             } else {
    //                 return <Redirect to={history.location.state.from.pathname} />
    //             }
                
    //         } 
    //         // Logged out -> do nothing, show this page
            
    //     } else  {
    //         // Typed in /login in url while logged in
    //         return <Redirect to="/"/>
    //     }
        
    // }

    const contentStyle = {
        position: "fixed",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center"
    }

    const imgStyle = {
        width: "80%"
    }

    const formStyle = {
        // padding: "1rem",
        
    }

    const inputStyle = {
        backgroundColor: "white",
        color: "black",
        display: "inline-block",
        margin: "10px auto",
        padding: "10px 20px",
        borderRadius: "5px",
        width: "100%",
        boxSizing: "border-box"
    }

    // const btnStyle = {
    //     // width: "25%",
    //     padding: "8px 15px",
    //     marginTop: "10px",
    //     borderRadius: "5px",
    //     backgroundColor: "#76C32D",
    //     color: "white"

    // }
    function sendAuthenticated() {
        console.log("Sending authentication!")
        props.parentCallback(true);
    }


    function handleSubmit(e) {
        e.preventDefault()
        axios.post("http://localhost:5000/user/login", {
            username: username,
            password: password
        }, {withCredentials: true}
        )
        .then(res => {
            // console.log('def')
            // console.log(res)
            if (res.data) {
                console.log(res.data)
                if (res.data === "No User Exists") {
                    alert("No user with these credentials exists")
                } else if (res.data === "Successfully Authenticated") {
                    sendAuthenticated()
                }
                // console.log("Successful Login");
                // sendAuthenticated()
                // console.log(props.history.push("/"))
                history.push("/");
                
            }
        })
        .catch(err => {
            console.log('ghi')
            console.log(err)
            if (err.response) {
                if (err.response.data) {
                    alert("Wrong credentials. Please try again.")
                }
            }
            
        })
    }

    function handleChange(e) {
        if (e.target.type === "text") {
            setUsername(e.target.value)
        } else if (e.target.type === "password") {
            setPassword(e.target.value)
        }   
        console.log(e.target.type + ": " + e.target.value)
    }

    

    return (
        <div style={contentStyle}>
            <img style={imgStyle} src={logo} alt="logo" />
            <form style={formStyle} onSubmit={handleSubmit}>
                <input style={inputStyle} type="text" placeholder="Username" value={username} onChange={handleChange} />
                <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={handleChange} />
                <input className="btn" type="submit" value="Submit" />
            </form>
        
            
        </div>
        
    )
    
}