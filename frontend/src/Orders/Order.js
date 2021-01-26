import React, {useState, useEffect} from "react"
import Table from "../components/Table"
import Layout from "../components/Layout"
import DownloadBtn from "../components/DownloadBtn"
import * as router from "./orderAPI";

export default function Order(props) {
  
  const [data, setData] = useState([])
  const [isLoading, setLoading] = useState(true);

  const innerStyle = {
      backgroundColor: "white",
      width: "80%", 
      borderRadius: "5px",
      margin: "20px auto",
      padding: "1% 3%",
      boxShadow: `0 1px 4px rgba(0, 0, 0, 0.2), 0 0 10px rgba(10, 0, 0, 0.1)`,
    }

  const outerStyle = {
    gridArea: "main", 
    backgroundColor: "rgb(246,246,247)"
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
        sortType: sortMoney
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
        sortType: sortDates
      },
      {
        Header: 'Fulfilled',
        accessor: 'fulfilled_date',
        sortDescFirst: true,
        sortType: sortDates
      },
      {
        Header: 'Completed',
        accessor: 'completed_date',
        sortDescFirst: true,
        sortType: sortDates
      },
      {
        Header: 'Status',
        accessor: 'status',
        sortDescFirst: true,
        disableSortBy: true
      },

      
    ],
    []
  )

  function sortMoney(rowA, rowB) {

    var aValues = "$0"
    var bValues = "$0"
    if (rowA.values.total) {
      aValues = rowA.values.total
    }
    if (rowB.values.total) {
      bValues = rowB.values.total
    }

      if (Number(aValues.replace(/(^\$|,)/g,'')) > Number(bValues.replace(/(^\$|,)/g,''))) {
        return 1
    } else {
        return -1
    }

  }

  function sortDates(rowA, rowB, column) {

    var a = ""
    var b = ""

    if (column === "submitted_date") {
      a = rowA.values.submitted_date
      b = rowB.values.submitted_date
    } else if (column === "fulfilled_date") {
      a = rowA.values.fulfilled_date
      b = rowB.values.fulfilled_date
    } else if (column === "completed_date") {
      a = rowA.values.completed_date
      b = rowB.values.completed_date
    }

    var dateA = ""
    var dateB = ""
    var timeA = ""
    var timeB = ""
    var amPMA = ""
    var amPMB = ""

    if (a) {
      a = a.split(' ')
      dateA = a[0].split('/')
      timeA = a[1].split(':')
      amPMA = a[2]
    } else {
      return 0
    }

    if (b) {
      b = b.split(' ')
      dateB = b[0].split('/')
      timeB = b[1].split(':')
      amPMB = b[2]
    } else {
      return 0
    }

    return dateA[2] - dateB[2] || dateA[0] - dateB[0] || dateA[1] - dateB[1] || amPMA > amPMB || 
            timeA[0][0] - timeB[0][0] || timeA[0][1] - timeB[0][1] || timeA[1][0] - timeB[1][0] || timeA[1][1] - timeB[1][1] || true
  }

    
  function getData() {
    setLoading(true)
    router.loadOrders().then(data => {
      if (data) {
        setData(data)
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
        <div style={innerStyle}>
          <h1>Orders</h1>
          <DownloadBtn data={data} type="orders"/>
          <Table reloadData={() => getData()} initialSearch="" columns={columns} type="all-orders" data={data} search={true} popupEnabled={true} perPage={10}/>
        </div>
      </div>
    </Layout>   
  )
}