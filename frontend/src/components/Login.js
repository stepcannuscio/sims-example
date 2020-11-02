import React, {useState} from "react"
import logo from "../images/logo.png"
import axios from "axios"
import { useHistory } from "react-router-dom";


export default function Login(props) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const history = useHistory();

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

    const btnStyle = {
        // width: "25%",
        padding: "8px 15px",
        marginTop: "10px",
        borderRadius: "5px",
        backgroundColor: "#76C32D",
        color: "white"

    }
    function sendAuthenticated() {
        console.log("function sendAuthenticated")
        props.parentCallback(true);
    }


    function handleSubmit(e) {
        e.preventDefault()
        axios.post("http://localhost:5000/login", {
            username: username,
            password: password
        })
        .then(res => {
            // console.log('def')
            // console.log(res)
            if (res.data === "authenticated" ) {
                console.log("Successful Login");
                sendAuthenticated()
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
                <input className="btn" style={btnStyle} type="submit" value="Submit" />
            </form>
        
            
        </div>
        
    )
    
}