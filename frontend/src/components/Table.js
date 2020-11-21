import React, {useState} from "react"
import { useTable, useAsyncDebounce, useGlobalFilter, usePagination, useSortBy } from "react-table"
import searchIcon from "../images/search.png"
import Popup from "./Popup"

// Define a default UI for filtering
function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
    }) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)

    const searchStyle = {
        border: '1px solid rgba(30,56,77, 50%)',
        borderRadius: '5px',

    }
    
    return (
    <div style={searchStyle}>
        <img style={{margin: "0 10px", width: "12px"}} src={searchIcon} alt="search icon" />
        <input
            value={value || ""}
            onChange={e => {
            setValue(e.target.value);
            onChange(e.target.value);
            }}
            placeholder={`Search products...`}
            style={{
            fontSize: '1.1rem',
            border: '0',
            width: '80%',
            padding: "10px 0"
            }}
        />
        
        </div>
    )
    }

export default function Table({columns, data}) {

    const [isPopup, setIsPopup] = useState(false)
    const [productPopup, setProductPopup] = useState({})
    
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        state,
        page,
        canPreviousPage,
        canNextPage,
        nextPage,
        previousPage,
        state: { pageIndex, pageSize },
        prepareRow,
        preGlobalFilteredRows,
        setGlobalFilter,
      } = useTable(
          {
              columns,
              data,
              initialState: {pageIndex: 0, pageSize: 10}
          },
          useGlobalFilter,
          useSortBy,
          usePagination,
      )
      
        function togglePopup(cell) {
            setIsPopup(!isPopup)
            if (cell) {
                setProductPopup(cell)
            }   
        }

      const results = page.length > 10 ? 10 : page.length

      const pageBtnStyle = {
        backgroundColor: "#EFEFEF", 
        border: "none", 
        padding: "5px 15px", 
        margin: "0 5px", 
        borderRadius: "5px", 
        color: "#1E384D"
      }

      return (
    
          // apply the table props
        <div class="inventory-table">
             <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
        <div style={{margin: "25px 0", color: 'rgba(0,0,0, 57%)'}}>
            Showing the first {results} results of {rows.length} rows
        </div>
        <table {...getTableProps()}>
          <thead>
            {// Loop over the header rows
            headerGroups.map(headerGroup => (
              // Apply the header row props
              <tr {...headerGroup.getHeaderGroupProps()}>
                {// Loop over the headers in each row
                headerGroup.headers.map(column => (
                  // Apply the header cell props
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {// Render the header
                    column.render('Header')}
                    {/* Add a sort direction indicator */}
                  <span style={{color: "#76c32d", fontSize: "14px"}}>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' (high-low)'
                        : ' (low-high)'
                      : ''}
                  </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {/* Apply the table body props */}
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
                // Prepare the row for display
                prepareRow(row)
                return (
                    // Apply the row props
                    <tr {...row.getRowProps()}>
                    {// Loop over the rows cells
                    row.cells.map(cell => {
                        const stockStyle = {
                            color: "#1E384D"
                        } 
                        if (cell.column.id === "stockLevel") {
                            stockStyle.padding = "5px"
                            stockStyle.borderRadius = "5px"
                            stockStyle.color = "white"
                            stockStyle.textAlign = "center"

                            if (cell.value === "Low") {
                                stockStyle.backgroundColor = "red"
                            } else if (cell.value === "Medium") {
                                stockStyle.backgroundColor = "#FFD300"
                            } else {
                                stockStyle.backgroundColor = "#4CAF50"
                            }
                        }
                        // Apply the cell props
                        return (
                        <td {...cell.getCellProps()} onClick={() => togglePopup(cell)}>
                            <div style={stockStyle}>
                            {// Render the cell contents
                            cell.render('Cell')}
                            </div>
                        </td>
                        )
                    })}
                    </tr>
                )
                })}           
          </tbody>
        </table>
        <div style={{textAlign: "right", margin: "40px 10px"}}>
            <button style={pageBtnStyle} onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'Previous'}
            </button>{' '}
            <button style={pageBtnStyle} id="next-btn" onClick={() => nextPage()} disabled={!canNextPage}>
            {'Next'}
            </button>{' '}
        </div>
        {isPopup ? <Popup product={productPopup} toggle={() => togglePopup()} /> : null}
        </div> 
      )
}

