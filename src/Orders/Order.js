import React, {useState, useEffect} from "react"
import Table from "../components/Table"
import Layout from "../components/Layout"
import DownloadBtn from "../components/DownloadBtn"
import * as router from "./orderAPI"
import * as helpers from "../helpers"

export default function Order(props) {
  
  const [data, setData] = useState([])
  const [isLoading, setLoading] = useState(true);

  const outerStyle = {
    gridArea: "main", 
    backgroundColor: "rgb(246,246,247)",
    overflowX: "hidden"
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
      },
  
      {
        Header: 'Total',
        accessor: 'total',
        sortDescFirst: true,
        sortType: helpers.sortMoney
      },
      {
        Header: 'Subtotal',
        accessor: 'subtotal',
        show: false
      },
      {
        Header: 'Discount',
        accessor: 'discount',
        show: false
      },
      {
        Header: 'Submitted',
        accessor: 'submitted_date',
        sortDescFirst: true,
        sortType: helpers.sortDates
      },
      {
        Header: 'Fulfilled',
        accessor: 'fulfilled_date',
        sortDescFirst: true,
        sortType: helpers.sortDates
      },
      {
        Header: 'Completed',
        accessor: 'completed_date',
        sortDescFirst: true,
        sortType: helpers.sortDates
      },
      {
        Header: 'Status',
        accessor: 'status',
        sortDescFirst: true,
        sortType: helpers.sortStatus
      },

      
    ],
    []
  )

  function getData() {
    setLoading(true)
    router.loadOrders().then(data => {
      if (data !== "Error") {
        setData(data)
      } else {
        alert("Error getting data. Please try again or contact Step.")
      }    
      setLoading(false)   
    }) 
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
      <div style={outerStyle}>
        <div className="inner-style">
          <h1>Orders</h1>
          <DownloadBtn data={data} type="orders"/>
          <Table reloadData={() => getData()} initialSearch="" columns={columns} type="all-orders" data={data} search={true} popupEnabled={true} perPage={10}/>
        </div>
      </div>
    </Layout>   
  )
}