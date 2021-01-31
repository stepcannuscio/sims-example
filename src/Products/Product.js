import React, {useEffect, useState} from "react"
import Layout from "../components/Layout"
import Table from "../components/Table"
import DownloadBtn from "../components/DownloadBtn"
import * as router from "./productAPI"
import * as helpers from "../helpers"

export default function Product(props) {

  const [products, setProducts] = useState([])
  const [isLoading, setLoading] = useState(false)

  const outerStyle = {
    gridArea: "main",
    backgroundColor: "rgb(246,246,247)"
  }

  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id',
        show: false
      },
      {
        Header: 'Product Name',
        accessor: 'title',
        sortDescFirst: true
      },
      {
        Header: 'Shopify ID',
        accessor: 'shopify_id',
        show: false
      },
      {
        Header: 'Vendor',
        accessor: 'vendor',
        sortDescFirst: true
      },
      {
        Header: 'Vendor_ID',
        accessor: 'vendor_id',
        show: false
      },
      {
        Header: 'Variants',
        accessor: 'variants',
        sortDescFirst: true
      },
      {
        Header: 'Low Variants',
        accessor: 'low_variants',
        sortDescFirst: true
      },
      {
        Header: 'Quantity',
        accessor: 'quantity',
        sortDescFirst: true
      },
      {
        Header: 'Stock Level',
        accessor: 'stockLevel',
        sortDescFirst: true,
        sortType: helpers.sortStockLevel
      },
    ],
    []
  )

  function getData(reload) {
    setLoading(true)
    if (props.location.state) {
      if (reload) {
        router.loadLowProducts().then(data => {
          if (data !== "Error") {
              setProducts(data)
          } else {
            alert("Error getting data. Please try again.")
          }
          setLoading(false) 
        })
      } else {
        setProducts(props.location.state.products)
        setLoading(false) 
      }
    } else {
      router.loadProducts().then(data => {
        if (data !== "Error") {
          setProducts(data)
        } else {
          alert("Error getting data. Please try again or contact Step.")
        } 
        setLoading(false) 
      })
    }  
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
          <h1>Products</h1>
          <DownloadBtn data={products} type="products" />
          <Table reloadData={() => getData('reload')} initialSearch="" type="products" columns={columns} data={products} search={true} popupEnabled={true} perPage={10}/>
        </div>
      </div>
    </Layout>
  )
}