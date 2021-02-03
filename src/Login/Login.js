import React, {useState} from "react"
import logo from "../images/logo.png"
import * as router from "./loginAPI";

export default function Login(props) {
  
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const contentStyle = {
        position: "fixed",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center"
    }

    const logoStyle = {
        width: "50%",
        margin: "30px 0"
    }

    const inputStyle = {
        backgroundColor: "#5DCBF9",
        color: "white",
        display: "inline-block",
        margin: "10px auto",
        padding: "15px 20px",
        borderRadius: "5px",
        fontSize: "16px",
        border: 0,
        width: "100%",
        boxSizing: "border-box"
    }

    function sendAuthenticated() {
        props.parentCallback(true);
    }

    function handleSubmit(e) {
        e.preventDefault()
        router.login(username, password).then(data => {
            if (data) {
                if (data === "No User Exists") {
                    alert("No user with these credentials exists")
                } else if (data === "Successfully Authenticated") {
                    sendAuthenticated()
                }
            }
        })
        .catch(err => {
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
    }

    return (
        <div style={contentStyle}>
            <img style={logoStyle} src={logo} alt="logo" />
            <form onSubmit={handleSubmit}>
                <input style={inputStyle} className="login-input" placeholder="Username" value={username} onChange={handleChange} />
                <input style={inputStyle} className="login-input" type="password" placeholder="Password" value={password} onChange={handleChange} />
                <input className="btn-1" type="submit" value="Submit" />
            </form> 
        </div>
        
    )
    
}