import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import React, {useState, useEffect} from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import OutsideAlerter from "../components/OutsideAlerter"
import * as router from "./vendorAPI"

export default function MyCalendar(props) {

    const [eventTitle, setEventTitle] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const [vendor, setVendor] = useState("Choose Vendor:")
    const [eventStart, setEventStart] = useState("")
    const [eventEnd, setEventEnd] = useState("")
    const [allDay, setAllDay] = useState(false)
    const [isAddPopupHidden, setAddPopupHidden] = useState(true)
    const [isEventPopupHidden, setEventPopupHidden] = useState(true)
    const [clickedEvent, setClickedEvent] = useState({
        title: "Default title",
        description: "Default description",
        vendor: "Default vendor",
        start: "Default start",
        end: "Default end"
    })
    const [data, setData] = useState([])

    const localizer = momentLocalizer(moment);

    const inputStyle = {
        display: "block",
        margin: "20px 0",
        padding: "5px 10px",
        fontSize: "16px",
        fontFamily: "inherit"
    }

    const calendarStyle = {
        backgroundColor: "white",
        boxShadow:
        `0 1px 4px rgba(0, 0, 0, 0.2), 0 0 10px rgba(10, 0, 0, 0.1)`,
        borderRadius: "5px",
        height: 400,
        margin: "20px 0", 
        padding: "10px", 
    }

    function getData() {
        router.loadSales().then(data => {
            if (data !== "Error") {
                setData(data)
            } else {
                alert("Error getting sales data. Please try again or contact Step.")
            }
        })
    }

    useEffect(() => {
        getData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function createSale() {

        var startDate = null
        var endDate = null

        if (allDay && eventStart !== "" && eventEnd !== "") {
            startDate= eventStart.slice(0,10) + "T00:00"
            endDate = eventEnd.slice(0,10) + "T23:59"
        }

        const sale = {
            title: eventTitle,
            description: eventDescription,
            start_date: startDate !== null ? startDate : eventStart,
            end_date: endDate !== null ? endDate : eventEnd,
            all_day: allDay,
            vendor: vendor !== "Choose Vendor:" ? vendor : null,
            user_id: props.user.id
        }

        var errorFlag = false
        Object.values(sale).forEach(value => {
            if (value === null || value === "") {
                errorFlag = true
                
            }
        })

        if (errorFlag === false) {
            // Save in DB
            save(sale)
        } else {
            alert(`Sale is incomplete. Please try again`)
            
        }
    }

    function save(sale) {
        router.saveSale(sale).then(data => {
            if (data) {
                if (data === "Failure") {
                    alert("Failed to create sale. Please try again")
                } else if (data === "Success") {
                    setAddPopupHidden(true)
                    getData()
                }
            }
        })
    }

    function handleChange(e) {
        switch(e.target.id) {
            case "event_title":
                setEventTitle(e.target.value)
                break;
            case "event_description":
                setEventDescription(e.target.value)
                break;
            case "event_start":
                setEventStart(e.target.value)
                break
            case "event_end":
                setEventEnd(e.target.value)
                break
            case "vendor":
                setVendor(e.target.value)
                break
            default:
                break
        }
    }

    function showEvent(e) {
        setClickedEvent({
            title: e.title,
            description: e.description,
            vendor: e.name,
            start: e.start.toString(),
            end: e.end.toString()
        })
        setEventPopupHidden(!isEventPopupHidden)
    }

  return (
    <div style={{margin: "0 auto", width: "60%"}}>
        <button className="circle-btn" onClick={() => setAddPopupHidden(!isAddPopupHidden)}>+</button>
        <div className="add-popup" hidden={isAddPopupHidden}>
            <span className="close" style={{color: "#1E384D"}} onClick={() => setAddPopupHidden(!isAddPopupHidden)}>&times;    </span>
            <h2>Create Event</h2>
            <input onChange={handleChange} style={inputStyle} value={eventTitle} type="text" id="event_title" placeholder="Event Title" />
            <textarea onChange={handleChange} style={inputStyle} value={eventDescription} rows="5" id="event_description" placeholder="Event Description" />
            <input onChange={handleChange} style={inputStyle} type="datetime-local" id="event_start" name="event_start" value={eventStart}/>
            <input onChange={handleChange} style={inputStyle} type="datetime-local" id="event_end" name="event_end" value={eventEnd} />
            <p style={{display: "inline"}}>All day?</p><input style={{display: "inline"}} onChange={() => setAllDay(!allDay)}type="checkbox"/>
            <select style={inputStyle} defaultValue="Choose Vendor:" onChange={handleChange} id="vendor">
                <option value="Choose Vendor:">Choose Vendor:</option>
                {props.vendorData.map((vendor, id) => {
                    return (
                    <option key={id} value={vendor.id}>{vendor.name}</option>
                    )
                })}
            </select>
            <button className="btn-2" style={{margin: "0"}} onClick={createSale}>Create Sale</button>
        </div> 
        <OutsideAlerter hide={() => setEventPopupHidden(true)}>
            <div className="add-popup" hidden={isEventPopupHidden}>
            <span className="close" style={{color: "#1E384D"}} onClick={() => setEventPopupHidden(true)}>&times;    </span>
                
                <h2><strong>{clickedEvent.title}</strong></h2>
                <p>{clickedEvent.description}</p>
                <p><strong>Vendor: </strong>{clickedEvent.vendor}</p>
                <p><strong>Start: </strong>{clickedEvent.start}</p>
                <p><strong>End: </strong>{clickedEvent.end}</p>
            </div>
        </OutsideAlerter>
        <Calendar
            localizer={localizer}
            events={data}
            startAccessor="start"
            endAccessor="end"
            style={calendarStyle}
            tooltipAccessor="title"
            onSelectEvent={(e) => showEvent(e)}
            popup={true}
        />
    </div>
  );
}
