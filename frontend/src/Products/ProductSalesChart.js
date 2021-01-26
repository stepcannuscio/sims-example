import { ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function ProductSalesChart(props) {

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    })

    // const maxShopify = Math.max.apply(Math, props.data.map(function(o) { return o.shopify; }))
    // const maxWoo = Math.max.apply(Math, props.data.map(function(o) { return o.woo; }))
    // const maxPurchase = Math.round(Math.max(maxShopify, maxWoo) / 1000) * 1000

    const CustomTooltip = ({ active, payload, label }) => {        
     
        if (active) {
            return (
            <div className="custom-tooltip">
                <strong><p className="label">{payload[0] ? payload[0].payload.date : null}</p></strong>
                <p className="label" style={{color: "#8884d8" }}>{payload[0] && payload[0].payload.shopify  ? `Shopify: ${formatter.format(payload[0].payload.shopify)}` : null}</p>
                <p className="label" style={{color: "red" }}>{payload[0] && payload[0].payload.woo ? `Woo: ${formatter.format(payload[0].payload.woo)}` : null}</p>
            </div>
            );
        }
        
        return null;
        };
    

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={props.data} >
                <Legend verticalAlign="top" height={36}/>
                <Line type="monotone" dataKey="shopify" stroke="#8884d8" />
                <Line type="monotone" dataKey="woo" stroke="red" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="date" />
                <YAxis />
                {/* <YAxis ticks={[Math.round(maxPurchase/4), Math.round(maxPurchase/2), Math.round((maxPurchase/4)*3), Math.round(maxPurchase)]} /> */}
                {/* <Tooltip /> */}
                <Tooltip content={<CustomTooltip />}/>
            </LineChart>
        </ResponsiveContainer>
    )
}






// import React from 'react';
// import {
//   BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
// } from 'recharts';


// //   static jsfiddleUrl = 'https://jsfiddle.net/alidingling/9hjfkp73/';

// export default function ProductSalesChart(props) {

//     console.log(props.data)


//     const data = [
//         {
//         name: 'Page A', uv: 4000, pv: 2400, amt: 2400,
//         },
//         {
//         name: 'Page B', uv: 3000, pv: 1398, amt: 2210,
//         },
//         {
//         name: 'Page C', uv: 2000, pv: 9800, amt: 2290,
//         },
//         {
//         name: 'Page D', uv: 2780, pv: 3908, amt: 2000,
//         },
//         {
//         name: 'Page E', uv: 1890, pv: 4800, amt: 2181,
//         },
//         {
//         name: 'Page F', uv: 2390, pv: 3800, amt: 2500,
//         },
//         {
//         name: 'Page G', uv: 3490, pv: 4300, amt: 2100,
//         }
//     ]

//     return (
//         <BarChart
//           width={500}
//           height={300}
//           data={props.data}
//           margin={{
//             top: 20, right: 30, left: 20, bottom: 5,
//           }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="date" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           {/* {props.data.map((item, index) => {
//               var fill = "8884d8"
//               var newfill = parseInt(fill.slice(0,3)-index)
//               fill = `#${newfill}${fill.slice(3,)}`
//               console.log(fill)


//             return (
                
                
             
//             )
//           })} */}
//           <Bar dataKey="shopify" stackId="a" fill="#8884d8" />
          
//           <Bar dataKey="woo" stackId="a" fill="#82ca9d" />
              
          
//           {/* <Bar dataKey="uv" fill="#ffc658" /> */}
//         </BarChart>
//       );
// }


