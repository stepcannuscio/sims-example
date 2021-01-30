import React, {useEffect, useState} from "react"
import Layout from "../components/Layout"
import Table from "../components/Table"
import DownloadBtn from "../components/DownloadBtn"
import Calendar from "./Calendar"
import * as router from "./vendorAPI"

export default function Vendor(props) {

  const [data, setData] = useState([])
  const [isAddPopupHidden, setAddPopupHidden] = useState(true)
  const [isLoading, setLoading] = useState(false)
  const [vendorName, setVendorName] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [commMethods, setCommMethods] = useState([])
  const [orderMinimum, setOrderMinimum] = useState("")
  const [deals, setDeals] = useState("")
  const [isCalendarHidden, setCalendarHidden] = useState(true)

  const outerStyle = {
    gridArea: "main", 
    backgroundColor: "rgb(246,246,247)"
  }

  const innerStyle = {
    backgroundColor: "white",
    width: "80%", 
    borderRadius: "5px",
    margin: "20px auto",
    padding: "1% 3%",
    boxShadow: `0 1px 4px rgba(0, 0, 0, 0.2), 0 0 10px rgba(10, 0, 0, 0.1)`,
  }

  const inputStyle = {
    display: "block",
    margin: "20px 0",
    padding: "10px 20px",
    fontSize: "16px",
    width: "80%",
    border: "none",
    borderBottom: "1px solid #76c32d"
  }    

  const columns = React.useMemo(
    () => [
      {
        Header: 'Vendor',
        accessor: 'name',
        sortDescFirst: true
      },
      {
        Header: 'ID',
        accessor: 'id',
        show: false
      },
      {
        Header: 'Contact Name',
        accessor: 'contact_name',
        show: false
      },
      {
        Header: 'Communication Method',
        accessor: 'comm_method',
        show: false
      },
      {
        Header: 'Order Minimum',
        accessor: 'order_minimum',
        show: false
      },
      {
        Header: 'Deals',
        accessor: 'deals',
        show: false
      },
      {
        Header: 'Email',
        accessor: 'email',
        show: false
      },
      {
        Header: 'Phone',
        accessor: 'phone',
        show: false
      },
      {
        Header: 'Website',
        accessor: 'website',
        show: false
      },
      {
        Header: 'Products',
        accessor: 'products',
        sortDescFirst: true
      },
      {
        Header: 'Low Products',
        accessor: 'low_products',
        sortDescFirst: true
      },
      
    ],
    []
  )

  function getData() {    
    setLoading(true)
    router.loadVendors().then(data => {
      if (data !== "Error") {
        setData(data)
      } else {
        alert("Error getting vendors. Please try again or contact Step.")
      }     
    })
    setLoading(false)     
  }

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    switch(e.target.id) {
      case "vendor-name":
          setVendorName(e.target.value)
          break;
      case "contact-name":
          setContactName(e.target.value)
          break;
      case "vendor-email":
          setEmail(e.target.value)
          break
      case "vendor-website":
          setWebsite(e.target.value)
          break
      case "vendor-phone":
          setPhone(e.target.value)
          break
      case "order_minimum":
        setOrderMinimum(e.target.value)
        break
      case "deals":
        setDeals(e.target.value)
        break
      default:
        break
      }       
    }

    function createVendor() {
    
      const vendor = {
          vendorName: vendorName,
          contactName: contactName,
          email: email,
          phone: phone,
          website: website,
          orderMinimum: orderMinimum,
          deals: deals
      }

      if (vendorName === "") {
        alert(`Please enter vendor name.`)
      }  else if (contactName === ""){
        alert('Please enter contact name.')
      } else if (!commMethods.length > 0) {
        alert("Please choose a communication method.")
      } else if (commMethods.includes('email') && email === "") {
        alert("Please enter email.")
      } else if ((commMethods.includes('phone') || commMethods.includes('call')) && phone === "") {
        alert("Please enter phone.")
      } else if (commMethods.includes('website') && website === "") {
        alert("Please enter website.")
      }
      
      else {
        save(vendor)
      }
  }
  
  function save(vendor) {
    router.saveVendor(vendor, commMethods).then(data => {
      if (data) {
        if (data === "Failure") {
          alert("Failed to create vendor. Please try again")
        } else if (data === "Success") {
          setAddPopupHidden(true)
          getData()
          resetData()
        }
      } else {
        alert("Failed to create vendor. Please try again")
      }
    })
  }

  function resetData() {
    setVendorName("")
    setContactName("")
    setEmail("")
    setPhone("")
    setWebsite("")
    setCommMethods([])
    setOrderMinimum("")
    setDeals("")
  }

  function commMethodSelected(e) {

    if (e.target.checked) {
      // it is selected - add to array
      setCommMethods(oldArray => [...oldArray, e.target.id])
    } else {
      // unselected - remove from array
      var array = [...commMethods]; // make a separate copy of the array
      var index = array.indexOf(e.target.id)
      if (index !== -1) {
          array.splice(index, 1);
          setCommMethods(array);
      }         
    }
  }

  if (isLoading) {
    return <div className="loader"></div>;
  }

  return (
    <Layout user={props.user}>
      <div style={outerStyle}>
        <div hidden={isCalendarHidden}>
            <Calendar vendorData={data} user={props.user}/>
        </div>
        <div style={{textAlign: "center", margin: "20px 0"}}>
          <button className="btn" onClick={() => setCalendarHidden(!isCalendarHidden)}>{isCalendarHidden ? "Show" : "Hide"} Sales Calendar</button>
        </div>   
        <div style={innerStyle}>
          <h1>Vendors</h1>
          <DownloadBtn data={data} type="vendors" />
          <button className="circle-btn" style={{margin: "0", left: "80%", bottom: "85px"}} onClick={() => setAddPopupHidden(!isAddPopupHidden)}>+</button>
          <div className="add-popup" hidden={isAddPopupHidden}>
            <span className="close" style={{color: "#1E384D"}} onClick={() => setAddPopupHidden(!isAddPopupHidden)}>&times;    </span>
            <h2>Create Vendor</h2>
            <input onChange={handleChange} type="text" style={inputStyle} id="vendor-name" value={vendorName} placeholder="Vendor Name" />
            <input onChange={handleChange} type="text" style={inputStyle} id="contact-name" value={contactName} placeholder="Contact Name" />
            <input onChange={handleChange} type="text" style={inputStyle} id="vendor-email" value={email} placeholder="Email (i.e. hi@gmail.com)" />
            <input onChange={handleChange} type="text" style={inputStyle} id="vendor-phone" value={phone} placeholder="Phone (i.e. 1234567890)" />
            <input onChange={handleChange} type="text" style={inputStyle} id="vendor-website" value={website} placeholder="Website (i.e. amazon.com)" />

            <input onChange={commMethodSelected}type="checkbox" id="email" name="email" />
            <label htmlFor="email">Email</label>

            <input onChange={commMethodSelected} type="checkbox" id="call" name="call" />
            <label htmlFor="phone">Call</label>

            <input onChange={commMethodSelected} type="checkbox" id="text" name="text" />
            <label htmlFor="text">Text</label>

            <input onChange={commMethodSelected} type="checkbox" id="website" name="website" />
            <label htmlFor="website">Website</label>
            
            <input onChange={handleChange} type="text" style={inputStyle} id="order_minimum" value={orderMinimum} placeholder="Order Minimum" />
            <input onChange={handleChange} type="text" style={inputStyle} id="deals" value={deals} placeholder="Deals" />
            <button className="btn-2" style={{margin: "0"}} onClick={createVendor}>Create Vendor</button>
          </div>
          <Table reloadData={() => getData()} user={props.user} initialSearch={props.location.state ? props.location.state.vendor : null} columns={columns} type="vendor" data={data} search={true} popupEnabled={true} perPage={10}/>
        </div>
      </div>  
    </Layout>
  )
}