import React from "react";
import OutsideAlerter from "./OutsideAlerter"
import profileImg from "../images/user.png"
import axios from "axios"

export default function Header(props) {

  /*
 
   A header bar with the user's name listed as a clickable element which drops down
   a menu that allows the user to log out

  */
  
  const [accountMenuDisplay, setAccountMenuDisplay] = React.useState("none");

  const iconStyle = {
    height: "15px",
    paddingRight: "5px"
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
    cursor: "pointer",
    
  };

  const accountMenuItemStyle = {
    borderBottom: "1px solid rgb(228, 233, 242)",
    padding: "20px 40px",
    fontSize: "12px",
   
  };

  function openAccountMenu() {
    if (accountMenuDisplay === "none") {
      setAccountMenuDisplay("block");
    } else {
      setAccountMenuDisplay("none");
    }
  }

  function logout() {
    
    axios.get('http://localhost:5000/user/logout/', {withCredentials: true}).then(res => {
      if (res.data === "Success") {        
      } else {
        alert("Failed to log out. Please try again.")
      }
    })}

  return (
    <header className="header">
      
      <div style={{cursor: "pointer", fontWeight: "400"}} onClick={openAccountMenu}>
        <img
          style={iconStyle}
          src={profileImg}
          alt="profile" />
        {props.user.firstName + " " + props.user.lastName}
        <OutsideAlerter hide={openAccountMenu} display={accountMenuDisplay}>
          <div style={accountMenuStyle}>
            <div style={accountMenuItemStyle}>
              <a href="/login" onClick={logout}>Logout</a>
            </div>
          </div>
      </OutsideAlerter>
      </div>
    </header>
  );
}
