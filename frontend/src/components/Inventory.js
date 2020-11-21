import React, {useEffect, useState} from "react"
import Layout from "./Layout"
import Table from "./Table"
import axios from "axios"

export default function Inventory(props) {
    const [products, setProducts] = useState([])

    function getProducts() {
        axios.get('http://localhost:5000/products/', {withCredentials: true}).then(response => {
            console.log(response)
            if (response.data) {
                const loadedProducts = []
                response.data.forEach(product => {
                    const newProduct = {
                        productName: product.title,
                        id: product.id,
                        vendor: product.vendor,
                        quantity: 0,
                        variants: 0
                    }       
                    product.variants.forEach(variant => {
                        if (product.id === "4553389015088") {
                            console.log(variant)
                        }
                        newProduct.variants += 1
                        newProduct.quantity += variant.quantity
                    })
                    // TALK WITH MARTY/TED ABOUT THESE QTY LEVELS
                    if (newProduct.quantity < 20) {
                        newProduct.stockLevel = "Low"
                    } else if (newProduct.quantity >= 20 && newProduct.quantity < 50) {
                        newProduct.stockLevel = "Medium"
                    } else {
                        newProduct.stockLevel = "High"
                    }
                    loadedProducts.push(newProduct)
                })

                setProducts(loadedProducts)
            }
        });
      }
  
      useEffect(() => {
        getProducts()
      }, []);

    const columns = React.useMemo(
        () => [
          {
            Header: 'Product Name',
            accessor: 'productName',
          },
          {
            Header: 'ID',
            accessor: 'id',
          },
          {
            Header: 'Vendor',
            accessor: 'vendor',
          },
          {
            Header: 'Variants',
            accessor: 'variants',
          },
          {
            Header: 'Quantity',
            accessor: 'quantity',
          },
          {
            Header: 'Stock Level',
            accessor: 'stockLevel',
          },
        ],
        []
      )

    return (

        <Layout user={props.user}>
            <div style={{gridArea: "main", width: "80%", margin: "20px auto"}}>
                <h1>Inventory</h1>
                <Table columns={columns} data={products} />
            </div>
        </Layout>
    )
}