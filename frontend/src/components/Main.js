import React from "react";
// import Table from "./Table";

export default function Main() {

  const style = {
    display: `flex`,
    justifyContent: `space-around`,
    margin: `20px`,
    padding: `20px`,
    height: `100vh` /* Force our height since we don't have actual content yet */,
    color: `#1E384D`,
    gridArea: "main",
    backgroundColor: "white",
    textAlign: "center"
  };

  const tableStyle = {
    width: "100%", 
    textAlign: "left", 
    backgroundColor: "#efefef",
    padding: "30px",
    borderRadius: "5px"
  }

  const topSellingProducts = {
    "Delta 8 THC Cart": "10",
    "Disposable Vape Pen": "500",
    "Endocure Pet Chews": "200"
  }

  const productsRunningLow = {
    "3CHI Cart - Gorilla Glue": "55",
    "Bath Salts": "2",
    "White Whale 3.5g": "16"
  }

  function sortProducts(array, type) {

    // Create items array
    var items = Object.keys(array).map(key => {
      return [key, array[key]];
    });

    if (type === "high") {
      // Sort the array based on the second element
      items.sort(function(first, second) {
        return second[1] - first[1];
      });
    } else if (type === "low") {
      // Sort the array based on the first element
      items.sort(function(first, second) {
        return first[1] - second[1];
      });
    }
  
    return items
  }

  const sortedTopSellingProducts = sortProducts(topSellingProducts, "high")
  const sortedProductsRunningLow = sortProducts(productsRunningLow, "low")



  return (
    <main className="main" style={style}>
      
      <div>
        <h2>Top Selling Products</h2>
        <table style={tableStyle}>
          <thead >
            <tr>
              <th style={{paddingBottom: "10px"}}>Product</th>
              <th style={{paddingBottom: "10px"}}>Units Sold</th>
            </tr>
          </thead>

          <tbody>
          {sortedTopSellingProducts.map((item, index) => {
            return (
            <tr key={index} >
              <td style={{paddingRight: "20px"}}>{item[0]}</td>
              <td style={{paddingRight: "20px"}}>{item[1]}</td>
            </tr>
            )
          })
          }
          </tbody>
        </table>
        <button className="btn">View All</button>
      </div>
      <div>
        <h2>Products Running Low</h2>
        <table style={tableStyle}>
          <thead >
            <tr>
              <th style={{paddingBottom: "10px"}}>Product</th>
              <th style={{paddingBottom: "10px"}}>Units Sold</th>
            </tr>
          </thead>

          <tbody>
          {sortedProductsRunningLow.map((item, index) => {
            return (
            <tr key={index} >
              <td style={{paddingRight: "20px"}}>{item[0]}</td>
              <td style={{paddingRight: "20px"}}>{item[1]}</td>
            </tr>
            )
          })
          }
          </tbody>
        </table>
        <button className="btn">View All</button>
      </div>
    </main>
  );
}
