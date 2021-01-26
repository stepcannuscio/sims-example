import { ResponsiveContainer, AreaChart, Area, Legend, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function CogsChart(props) {

    // Displays cost of goods solds, discounts, and revenue for past purchases
    
    const CustomTooltip = ({ active, payload }) => {
        
        // Custom popup when hovering over data points in the chart

        if (active) {
            return (
            <div className="custom-tooltip">
                <strong><p className="label">{payload[0] ? payload[0].payload.date : null}</p></strong>
                <p className="label" style={{color: "#8884d8" }}>{payload.length === 3  ? `Revenue: ${Math.round(payload[0].value / (payload[1].value + payload[2].value + payload[0].value)*100)}%` : null}</p>
                <p className="label" style={{color: "#82ca9d" }}>{payload.length === 3 ? `Discount: ${Math.round(payload[1].value / (payload[1].value + payload[2].value + payload[0].value)*100)}%` : null}</p>
                <p className="label" style={{color: "orange" }}>{payload.length === 3 ? `COGS: ${Math.round(payload[2].value / (payload[1].value + payload[2].value + payload[0].value)*100)}%` : null}</p>
            </div>
            );
        }

        return null;
        };
    
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={props.data}>   
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />}/>
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="discount" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="cost" stackId="3" stroke="#ffc658" fill="#ffc658" />
                <Legend verticalAlign="top" height={36}/>
            </AreaChart>
        </ResponsiveContainer>
  
    )

}