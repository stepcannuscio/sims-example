import {useState} from "react"

export default function DateFilter(props) {

    const [dateFilter, setDateFilter] = useState(props.dateFilter || 'month')
    const [startDate, setStartDate] = useState(props.startDate || "")
    const [endDate, setEndDate] = useState(props.endDate || "")
    const [variant, setVariant] = useState(props.variant || "")

    // console.log(dateFilter)
    // console.log(props.variantData)

    const filterStyle = {
        padding: "10px 20px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: "rgb(45,142,255)",
        color: "white",
        fontSize: "16px",
        outline: "none",
        display: "inline-block",
        margin: "10px"
      }

      const datePickerStyle = {
        padding: "10px 30px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: "rgb(45,142,255)",
        color: "white",
        margin: "10px",
        fontSize: "16px",
        display: "inline-block",
        fontFamily: "inherit"
        
      }
       
    function dateFilterChanged(e) {
      // console.log(e.target.value)
      // console.log(variant)
        setDateFilter(e.target.value)
        const variantId = variant === "default" ? null : variant
        props.reload(e.target.value, startDate, endDate, variantId)
        // getData(e.target.value)
    }

    function filterByDate() {
        // getData(dateFilter)
        props.reload(dateFilter, startDate, endDate, variant)

        // setMiniTable(!updateMiniTable)
    
      }


    return (
        <div style={{width: "100%", margin: "20px", display: "flex", justifyContent: `center`}}>
          {props.variantData && props.variantData.length > 1
          ?
          <select style={filterStyle} value={variant} onChange={(e) => {
            setVariant(e.target.value)
            props.reload(dateFilter, startDate, endDate, e.target.value)
        }}>
            <option value="default">Choose Variant:</option>
            {props.variantData.map((item, index) => {
                return (
                    <option key={index} value={item.variant_id}>{item.variant}</option>
                )
            })}
        </select>
          :

          <p></p>
        }
          
        <select style={filterStyle} value={dateFilter} onChange={dateFilterChanged} id="dateFilter" name="dateFilter">
        <option value="day">Day</option>
        <option value="month">Month</option>
        <option value="week">Week</option>
        <option value="year">Year</option>
        </select>
        <input style={datePickerStyle} onChange={e => setStartDate(e.target.value)} type="date" id="start" name="start"
            value={startDate}
            min="2018-01-01" max={new Date().toISOString().slice(0,10)} />
        <input style={datePickerStyle} onChange={e => setEndDate(e.target.value)} type="date" id="end" name="end"
            value={endDate}
            min="2018-01-01" max={new Date().toISOString().slice(0,10)} />    
      
        <button className="btn" style={{margin: "10px 0", backgroundColor: "rgb(45,142,255)", color: "white"}}  onClick={filterByDate}>Filter by Date</button>
        </div>
    ) 
}