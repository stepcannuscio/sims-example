import React, {useState} from "react"
import logo from "../images/logo.png"
import axios from "axios"

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
        backgroundColor: "#76C32D",
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
        // Send request to reauthenticate back to App
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
            if (res.data) {
                if (res.data === "No User Exists") {
                    alert("No user with these credentials exists")
                } else if (res.data === "Successfully Authenticated") {
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
        console.log(e.target.type + ": " + e.target.value)
    }

    return (
        <div style={contentStyle}>
            <img style={logoStyle} src={logo} alt="logo" />
            <form onSubmit={handleSubmit}>
                <input style={inputStyle} className="login-input" type="text" placeholder="Username" value={username} onChange={handleChange} />
                <input style={inputStyle} className="login-input" type="password" placeholder="Password" value={password} onChange={handleChange} />
                <input className="btn-1" type="submit" value="Submit" />
            </form>
        
            
        </div>
        
    )
    
}