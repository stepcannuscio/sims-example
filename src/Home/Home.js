import React, {useState, useEffect} from "react"

import Layout from "../components/Layout"
import SalesChart from "../components/SalesChart"
import CogsChart from "./CogsChart"
import CallToAction from "./CallToAction"
import MiniTable from "./MiniTable"
import DateFilter from "../components/DateFilter"
import * as router from "./homeAPI";
import * as helpers from "../helpers"

export default function Home(props) {

  const [revenueData, setRevenueData] = useState([])
  const [cogsData, setCogsData] = useState([])
  const [topSellers, setTopSellers] = useState([])
  const [inventoryValue, setInventoryValue] = useState(0)
  const [lowProducts, setLowProducts] = useState([])
  const [isLoading, setLoading] = useState(true);

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

  const ctaContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "50%"
  }

  function getData(filter="month", startDate="", endDate="") {
   
    router.loadPurchases(filter, startDate, endDate).then(data => {
      if (data !== "Error") {
        setRevenueData(data.salesData)
        setCogsData(data.cogsData)
        setTopSellers(data.topSellers)
        setInventoryValue(data.inventoryValue)
        setLowProducts(data.lowProducts)
      } else {
        alert("Error getting data. Please try again or contact Step.")
      }
      setLoading(false)
    });
}

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <div className="loader"></div>;
  }
 
  return (
    <Layout user={props.user}>
      <main style={style}>
        <div style={ctaContainerStyle}>

        <CallToAction data={lowProducts} text="Low Products" type="products"/>
        <CallToAction data={helpers.formatter.format(inventoryValue)} text="Inventory Value" type="inventory" />
        </div>
        <DateFilter reload={(dateFilter, startDate, endDate) => {
          getData(dateFilter, startDate, endDate)
        }}/>   
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