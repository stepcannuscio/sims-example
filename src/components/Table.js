import React, {useState, useEffect} from "react"
import { useTable, useAsyncDebounce, useGlobalFilter, usePagination, useSortBy, useRowSelect } from "react-table"
import Popup from "./Popup"
import searchIcon from "../images/search.png"
import * as helpers from "../helpers"

function GlobalFilter({
    globalFilter,
    setGlobalFilter,
    }) {

    // Defines a default UI for filtering

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
            placeholder={`Search ...`}
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


export default function Table({columns, initialSearch, data, type, reloadData, search, perPage, popupEnabled, user, checkbox, update}) {

  const [isPopup, setIsPopup] = useState(false)
  const [popupData, setPopupData] = useState({})

  const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef()
      const resolvedRef = ref || defaultRef
  
      useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate
      }, [resolvedRef, indeterminate])
  
      return (
        <>
          <input type="checkbox" ref={resolvedRef} {...rest} />
        </>
      )
    }
  )

  const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      state,
      page,
      pageOptions,
      setPageSize,
      canPreviousPage,
      canNextPage,
      nextPage,
      previousPage,
      state: { pageIndex, pageSize },
      prepareRow,
      preGlobalFilteredRows,
      setGlobalFilter,
      setHiddenColumns
    } = useTable(
        {
            columns,
            data,
            initialState: {
              pageIndex: 0, 
              pageSize: perPage,
              hiddenColumns: ["id", "comm_method", "email", "phone", "website", "Vendor_ID", "contact_name",
                              "subtotal", "discount", "variant_id", "vendor_id", "order_minimum", "deals"],
              globalFilter: initialSearch
            }
        },
        useGlobalFilter,
        useSortBy,
        usePagination,
        useRowSelect,
        hooks => {
          if (checkbox) {
            
            hooks.visibleColumns.push(columns => [
              // Let's make a column for selection
              {
                id: 'selection',
                // The header can use the table's getToggleAllRowsSelectedProps method
                // to render a checkbox
                Header: ({ getToggleAllRowsSelectedProps, isAllRowsSelected }) => (
                  <div onClick={() => update("all", isAllRowsSelected)}>
                    <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()}/>
                  </div>
                ),
                // The cell can use the individual row's getToggleRowSelectedProps method
                // to the render a checkbox
                Cell: ({ row }) => (
                  <div>
                    <IndeterminateCheckbox {...row.getToggleRowSelectedProps()}/>
                  </div>
                ),
              },
              ...columns,
            ])
          } 
        }
      )
      
      useEffect(() => {
        if (type === "order") {
          setHiddenColumns(oldArray => [...oldArray, "variant"])
          
        } else if (type === "order-variant") {
          var array = this && this.hiddenColumns ? [...this.hiddenColumns] : []; // make a separate copy of the array
          var index = array.indexOf("variant")
          if (index !== -1) {
              array.splice(index, 1);
              setHiddenColumns(array);
          }  
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
      
      
      function togglePopup(cell) {

        // Hides or shows the popup - reloads data if hiding

        setIsPopup(!isPopup)
        if (cell) {
            setPopupData(cell)
        } else {
          reloadData()
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
    
        // Apply the table props
        <div className="inventory-table">
          {search ? 
             <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
              : null}
       {search ?  <div style={{margin: "25px 0", color: 'rgba(0,0,0, 57%)'}}>
            Showing the first {results} results of {rows.length} rows
        </div> : null}
      
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
                  <span style={{color: "#5DCBF9", fontSize: "14px"}}>
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
                      if (cell.column.id === "stockLevel" || cell.column.id === "status") {
                          stockStyle.padding = "5px"
                          stockStyle.borderRadius = "5px"
                          stockStyle.color = "white"
                          stockStyle.textAlign = "center"

                          if (cell.value === "Low" || cell.value === "submitted") {
                              stockStyle.backgroundColor = "red"
                          } else if (cell.value === "Medium" || cell.value === "fulfilled") {
                              stockStyle.backgroundColor = "#FFD300"
                          } else {
                              stockStyle.backgroundColor = "#4CAF50"
                          }
                        }
                      // Apply the cell props
                      return (
                      <td {...cell.getCellProps()} onClick={() => popupEnabled ? togglePopup(cell) : null} onChange={() => type === "order" ? update(cell.row) : null}> {/*  */}
                        <div style={stockStyle}>
                        {(cell.column.id === "completed_date" || cell.column.id === "fulfilled_date" || cell.column.id === "submitted_date") && cell.value === '01/01/1969 04:20AM' ? cell.value="" : ["vendor", "name", "title"].includes(cell.column.id) && cell.value ? helpers.capitalizeFirstLetter(cell.value) : cell.render('Cell')}
                        </div>
                      </td>
                      )
                    })}
                  </tr>
                )
                })}           
          </tbody>
        </table>
        <div style={{textAlign: "right", margin: "20px 10px"}}>
            <button style={pageBtnStyle} onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'Previous'}
            </button>{' '}
            <button style={pageBtnStyle} id="next-btn" onClick={() => nextPage()} disabled={!canNextPage}>
            {'Next'}
            </button>{' '}
            <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
          <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value))
          }}
        >
          {[5, 10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
        </div>
        {isPopup ? <Popup type={type} user={user} data={popupData} toggle={() => togglePopup()} /> : null}
        </div> 
      )
}

