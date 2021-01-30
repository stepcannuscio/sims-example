import { ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import * as helpers from "../helpers"

export default function SalesChart(props) {

    const maxShopify = Math.max.apply(Math, props.data.map(function(o) { return o.shopify; }))
    const maxWoo = Math.max.apply(Math, props.data.map(function(o) { return o.woo; }))
    const maxPurchase = Math.round(Math.max(maxShopify, maxWoo) * 1000) / 1000

    const CustomTooltip = ({ active, payload, label }) => {        
     
        if (active) {
            return (
            <div className="custom-tooltip">
                <strong><p className="label">{payload && payload[0] ? payload[0].payload.date : null}</p></strong>
                <p className="label" style={{color: "#8884d8" }}>{payload && payload[0] && payload[0].payload.shopify  ? `Shopify: ${helpers.formatter.format(payload[0].payload.shopify)}` : null}</p>
                <p className="label" style={{color: "red" }}>{payload && payload[0] && payload[0].payload.woo ? `Woo: ${helpers.formatter.format(payload[0].payload.woo)}` : null}</p>
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
                <YAxis ticks={[Math.round(maxPurchase/4), Math.round(maxPurchase/2), Math.round((maxPurchase/4)*3), Math.round(maxPurchase)]} />
                <Tooltip content={<CustomTooltip />}/>
            </LineChart>
        </ResponsiveContainer>
    )
}