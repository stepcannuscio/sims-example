import { ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {useEffect, useState} from "react"
import axios from "axios"

export default function Chart() {

    const [salesData, setSalesData] = useState([])

    function getSales() {
        axios.get('http://localhost:5000/orders/', {withCredentials: true}).then(response => {
            if (response.data) {

                const salesByDate = []
                const shopifyDateDict = {}
                const wooDateDict = {}

                response.data.forEach(order => {
                    const orderDate = order.date.slice(0,10)
                    if (order.source === "Shopify") {
                        if (orderDate in shopifyDateDict) {
                            shopifyDateDict[orderDate] += order.price
                        } else {
                            shopifyDateDict[orderDate] = order.price
                        }
                    } else {
                        if (orderDate in wooDateDict) {
                            wooDateDict[orderDate] += order.price
                        } else {
                            wooDateDict[orderDate] = order.price
                        }
                    }
                    
                })
                
                for (var key in shopifyDateDict) {
                    //   console.log(key)
                    salesByDate.push({
                        date: key,
                        shopify: shopifyDateDict[key],
                        woo: key in wooDateDict ? wooDateDict[key] : 0
                        })
                }

                for (var key in wooDateDict) {
                    if (!(key in shopifyDateDict)) {
                        // console.log(key)
                        salesByDate.push({
                        date: key,
                        shopify: 0,
                        woo: wooDateDict[key]
                    })
                    }
                }
                

                salesByDate.sort(function(a,b) {
                    a = a.date.split('/').reverse().join('');
                    b = b.date.split('/').reverse().join('');
                    return a > b ? 1 : a < b ? -1 : 0;
                  });
                  console.log(salesByDate)
                
                  setSalesData(salesByDate)
                }         
            })
        
      }
  
      useEffect(() => {
        getSales()
      }, []);

    return (
        <ResponsiveContainer width="100%" height="80%">
        <LineChart data={salesData} margin={{right: 20}}>
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="shopify" stroke="#8884d8" />
            <Line type="monotone" dataKey="woo" stroke="red" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis/>
            <Tooltip />
        </LineChart>
  </ResponsiveContainer>
    )
}

// //  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
// const renderLineChart = () => (
   
// );

// export default renderLineChart;