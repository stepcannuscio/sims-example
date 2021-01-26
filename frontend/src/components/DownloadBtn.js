import { CSVLink } from "react-csv";
import DownloadIcon from "../images/download.png"

export default function DownloadBtn(props) {

/* 
A download button which downloads the data from a table into a CSV file
Saves the file in the format: "sims-orders-20200111"
*/

function formatDate() {

    // Format the current date for the save name

    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('');
}

const date = formatDate()

const btnStyle = {
    position: "relative",
    left: "93%",
    bottom: "50px",
    zIndex: "2"
    
}

return (
    <div style={btnStyle}>
    <CSVLink data={props.data} filename={`sims-${props.type}-${date}.csv`}>
        <img src={DownloadIcon} style={{width: "25px"}} alt="download"/>
    </CSVLink>
    </div>
    )


}