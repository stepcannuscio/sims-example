import React, {useState, useEffect} from "react"

import Layout from "../components/Layout"
import SalesChart from "../components/SalesChart"
import CogsChart from "./CogsChart"
import CallToAction from "./CallToAction"
import MiniTable from "./MiniTable"
import DateFilter from "../components/DateFilter"

import * as router from "./homeAPI";


export default function Home(props) {

  // const [dateFilter, setDateFilter] = useState("month")
  const [revenueData, setRevenueData] = useState([])
  const [cogsData, setCogsData] = useState([])
  const [topSellers, setTopSellers] = useState([])
  const [inventoryValue, setInventoryValue] = useState(0)
  const [lowProducts, setLowProducts] = useState([])
  // const [startDate, setStartDate] = useState("")
  // const [endDate, setEndDate] = useState("")
  // const [updateMiniTable, setMiniTable] = useState(false)
  const [isLoading, setLoading] = useState(true);

  // console.log(lowProducts)

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
    })

  const style = {
    display: `flex`,
    justifyContent: `space-around`,
    padding: `0 20px`,
    color: `#1E384D`,
    gridArea: "main",
    backgroundColor: "rgb(246,246,247)",
    textAlign: "center",
    flexWrap: "wrap",
  };

  // const filterStyle = {
  //   padding: "10px 30px",
  //   borderRadius: "5px",
  //   border: "none",
  //   backgroundColor: "rgb(45,142,255)",
  //   color: "white",
  //   fontSize: "16px",
  //   outline: "none",
  //   display: "inline-block",
  //   margin: "10px"
  // }

  // const datePickerStyle = {
  //   padding: "10px 30px",
  //   borderRadius: "5px",
  //   border: "none",
  //   backgroundColor: "rgb(45,142,255)",
  //   color: "white",
  //   margin: "10px",
  //   fontSize: "16px",
  //   display: "inline-block",
  //   fontFamily: "inherit"
    
  // }

  const ctaContainerStyle = {

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "50%"

  }

  function getData(filter="month", startDate="", endDate="") {
    // console.log(filter)
    router.loadPurchases(filter, startDate, endDate).then(data => {
      if (data) {
        setRevenueData(data.salesData)
        setCogsData(data.cogsData)
        setTopSellers(data.topSellers)
        setInventoryValue(data.inventoryValue)
        setLowProducts(data.lowProducts)
      }
      setLoading(false)
    });
}

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 
  // function dateFilterChanged(e) {
  //   setDateFilter(e.target.value)
  //   getData(e.target.value)
  // }

  // function filterByDate() {
  //   getData(dateFilter)
  //   setMiniTable(!updateMiniTable)

  // }

  if (isLoading) {
    return <div className="loader"></div>;
  }


   
  return (
    <Layout user={props.user}>
      <main style={style}>
        <div style={ctaContainerStyle}>

        <CallToAction data={lowProducts} text="Low Products" type="products"/>
        <CallToAction data={formatter.format(inventoryValue)} text="Inventory Value" type="inventory" />
        </div>
        {/* <div>
          <p>{inventoryValue}</p>
        </div> */}

        <DateFilter reload={(dateFilter, startDate, endDate) => {
          // console.log(dateFilter)
          getData(dateFilter, startDate, endDate)
        }}/>

        {/* <div style={{width: "100%", margin: "20px", justifyContent: `flex-start`,}}>
          <select style={filterStyle} value={dateFilter} onChange={dateFilterChanged} id="dateFilter" name="dateFilter">
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="year">Year</option>
          </select>
          <input style={datePickerStyle} onChange={e => setStartDate(e.target.value)} type="date" id="start" name="start"
                value={startDate}
                min="2018-01-01" max={new Date().toISOString().slice(0,10)} />
          <input style={datePickerStyle} onChange={e => setEndDate(e.target.value)} type="date" id="end" name="end"
                value={endDate}
              min="2018-01-01" max={new Date().toISOString().slice(0,10)} />    
          <button className="btn" style={{display: "inline-block", margin: "0", padding: "11px 30px", backgroundColor: "rgb(45,142,255)", color: "white", fontSize: "16px", cursor: "pointer"}} onClick={filterByDate}>Filter by Date</button>
        </div> */}
        
        <div className="chart">
          <h2>Revenue</h2>
          <SalesChart data={revenueData}/>
        </div>
        <div className="chart">
          <h2>Cost of Goods Sold</h2>
          <CogsChart data={cogsData}/>
        </div>
        <div className="mini-table">
          <h2>Top Sellers</h2>
          <MiniTable data={topSellers}/>
        </div>
      </main>
    </Layout>
    )
  }