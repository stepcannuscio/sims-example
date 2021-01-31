import {useState} from "react"

export default function DateFilter(props) {

  const [dateFilter, setDateFilter] = useState(props.dateFilter || 'month')
  const [startDate, setStartDate] = useState(props.startDate || "")
  const [endDate, setEndDate] = useState(props.endDate || "")
  const [variant, setVariant] = useState(props.variant || "")

  const filterStyle = {
    padding: "1% 2%",
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
    padding: "1% 2%",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "rgb(45,142,255)",
    color: "white",
    margin: "10px",
    fontSize: "16px",
    display: "inline-block",
    fontFamily: "inherit"
  }

  const btnStyle = {
    padding: "1% 2%",
    margin: "10px 0",
    backgroundColor: "rgb(45,142,255)",
    color: "white",
    borderRadius: "5px", 
    border: "none", 
    fontSize: "16px"
  }
      
  function dateFilterChanged(e) {
    setDateFilter(e.target.value)
    const variantId = variant === "default" ? null : variant
    props.reload(e.target.value, startDate, endDate, variantId)
  }

  function filterByDate() {
    props.reload(dateFilter, startDate, endDate, variant)
  }

  return (
    <div style={{width: "100%", margin: "20px", display: "flex", flexWrap: "wrap", justifyContent: `center`}}>
      {props.variantData && props.variantData.length > 1
      ?
      <select style={filterStyle} value={variant} onChange={(e) => {
        const id = e.target.value === "default" ? null : e.target.value
        setVariant(e.target.value)
        props.reload(dateFilter, startDate, endDate, id)
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
      <button style={btnStyle}  onClick={filterByDate}>Filter by Date</button>
      </div>
  ) 
}