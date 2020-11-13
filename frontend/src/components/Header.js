import React from "react";
import { Link, } from "react-router-dom";
import profileImg from "../images/user.png"
import axios from "axios"

export default function Header(props) {
  
  const [accountMenuDisplay, setAccountMenuDisplay] = React.useState("none");

  const headerStyle = {
    gridArea: `header`,
    backgroundColor: `white`,
    display: `flex`,
    alignItems: `center`,
    justifyContent: `flex-end`,
    padding: `0 40px`
  };

  const iconStyle = {
    height: "15px",
    paddingRight: "5px"
  };
  
  const profileStyle = {
    backgroundColor: `white`,
  }



  const accountMenuStyle = {
    display: accountMenuDisplay,
    position: "absolute",
    top: "50px",
    right: "25px",
    zIndex: "10",
    border: "1px rgb(228, 233, 242) solid",
    backgroundColor: "white",
    borderRadius: "0.17rem",
    cursor: "pointer"
  };

  const accountMenuItemStyle = {
    borderBottom: "1px solid rgb(228, 233, 242)",
    padding: "20px 40px",
    fontSize: "12px"
  };

  function openAccountMenu() {
    if (accountMenuDisplay === "none") {
      setAccountMenuDisplay("block");
    } else {
      setAccountMenuDisplay("none");
    }
  }

  // const history = useHistory();

  function logout() {
    
    axios.get('http://localhost:5000/user/logout/', {withCredentials: true}).then(res => {
      console.log(res.data)
      if (res.data === "Success") {        
        // history.push("/login", {state: { prevPath: history.location.pathname }})
        console.log('successful logout')
      } else {
        alert("Failed to log out. Please try again.")
      }
    })}

  return (
    <header style={headerStyle}>
      <div onClick={openAccountMenu}>
      <a style={profileStyle} href="#">  <img
          style={iconStyle}
          src={profileImg}
          alt="profile" />
        {props.user.firstName + " " + props.user.lastName}
        </a>
      <div style={accountMenuStyle}>
        <div style={accountMenuItemStyle}>
          <Link to="/profile">Profile</Link>
        </div>
        <div style={accountMenuItemStyle}>
          <a href="/login" onClick={logout}>Logout</a>
        </div>
      </div>
      </div>
    </header>
  );
}
