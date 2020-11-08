import React from "react";
import { Link, Redirect, useHistory } from "react-router-dom";
import logo from "../images/logo.png"
import profileImg from "../images/user.png"
import axios from "axios"

export default function Header(props) {
  
  const [accountMenuDisplay, setAccountMenuDisplay] = React.useState("none");
  const headerStyle = {
    gridArea: `header`,
    backgroundColor: `white`,
    display: `flex`,
    alignItems: `left`,
    justifyContent: `space-between`,
    padding: `0 16px`
  };

  const titleStyle = {
    margin: "10px 0 0 40px",
    fontWeight: "600"
  };

  const logoStyle = {
    // paddingTop: "10px"
    // width: "20px"
    // height: "30px"
    height: "20px",
    paddingRight: "5px"
  };

  const iconStyle = {
    // paddingTop: "10px"
    // width: "20px"
    // height: "30px"
    height: "15px",
    paddingRight: "5px"
  };

  const profileStyle = {
    margin: "10px 0",
    fontWeight: "300"
  };

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
    console.log(accountMenuDisplay);
    if (accountMenuDisplay === "none") {
      setAccountMenuDisplay("block");
    } else {
      setAccountMenuDisplay("none");
    }
  }

  const history = useHistory();
  console.log(history.location.pathname)

  function logout() {
    
    axios.get('http://localhost:5000/user/logout/', {withCredentials: true}).then(res => {
      // console.log('Logout response: ')
      console.log(res.data)
      if (res.data == "Success") {
        console.log("yuh")
        
        // props.isLoggedIn(
        history.push("/login", {state: { prevPath: history.location.pathname }})
        // return <Redirect to="/login" />
      } else {
        alert("Failed to log out. Please try again.")
      }
    })}

  // Create the styles and structure for our header and footer elements; grid-area declared previously
  return (
    <header style={headerStyle}>
      <div style={titleStyle}>
        <img
          style={logoStyle}
          src={logo}
          alt="burman's logo"
        />
        Burman's Inventory
      </div>
      <div onClick={openAccountMenu} style={profileStyle}>
        <img
          style={iconStyle}
          src={profileImg}
          alt="burman's logo"
        />
        Marty Burman
      </div>
      <div style={accountMenuStyle}>
        <a href="/"> </a>
        <div style={accountMenuItemStyle}>
          <Link to="/profile">Profile</Link>
        </div>
        <div style={accountMenuItemStyle}>


          <a onClick={logout}>Logout</a>
        </div>
      </div>
    </header>
  );
}
