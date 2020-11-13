// import React from 'react'
// import { useTable, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'
// // A great library for fuzzy filtering/sorting items
// import {matchSorter} from 'match-sorter'



// // Our table component
// export default function Table({ columns, data }) {
//     // Define a default UI for filtering
// function GlobalFilter({
//     preGlobalFilteredRows,
//     globalFilter,
//     setGlobalFilter,
//   }) {
//     const count = preGlobalFilteredRows.length
//     const [value, setValue] = React.useState(globalFilter)
//     const onChange = useAsyncDebounce(value => {
//       setGlobalFilter(value || undefined)
//     }, 200)
  
//     return (
//       <span>
//         Search:{' '}
//         <input
//           value={value || ""}
//           onChange={e => {
//             setValue(e.target.value);
//             onChange(e.target.value);
//           }}
//           placeholder={`${count} records...`}
//           style={{
//             fontSize: '1.1rem',
//             border: '0',
//           }}
//         />
//       </span>
//     )
//   }
  
//   // Define a default UI for filtering
//   function DefaultColumnFilter({
//     column: { filterValue, preFilteredRows, setFilter },
//   }) {
//     const count = preFilteredRows.length
  
//     return (
//       <input
//         value={filterValue || ''}
//         onChange={e => {
//           setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
//         }}
//         placeholder={`Search ${count} records...`}
//       />
//     )
//   }
  
//   function fuzzyTextFilterFn(rows, id, filterValue) {
//     return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
//   }
  
//   // Let the table remove the filter if the string is empty
//   fuzzyTextFilterFn.autoRemove = val => !val
//   const filterTypes = React.useMemo(
//     () => ({
//       // Add a new fuzzyTextFilterFn filter type.
//       fuzzyText: fuzzyTextFilterFn,
//       // Or, override the default text filter to use
//       // "startWith"
//       text: (rows, id, filterValue) => {
//         return rows.filter(row => {
//           const rowValue = row.values[id]
//           return rowValue !== undefined
//             ? String(rowValue)
//                 .toLowerCase()
//                 .startsWith(String(filterValue).toLowerCase())
//             : true
//         })
//       },
//     }),
//     []
//   )

//   const defaultColumn = React.useMemo(
//     () => ({
//       // Let's set up our default Filter UI
//       Filter: DefaultColumnFilter,
//     }),
//     []
//   )

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     rows,
//     prepareRow,
//     state,
//     visibleColumns,
//     preGlobalFilteredRows,
//     setGlobalFilter,
//   } = useTable(
//     {
//       columns,
//       data,
//       defaultColumn, // Be sure to pass the defaultColumn option
//       filterTypes,
//     },
//     useFilters, // useFilters!
//     useGlobalFilter // useGlobalFilter!
//   )

//   // We don't want to render all of the rows for this example, so cap
//   // it for this use case
//   const firstPageRows = rows.slice(0, 10)

//   return (
//     <>
//     <div class="inventory-table">
//     {/* <GlobalFilter
//                 preGlobalFilteredRows={preGlobalFilteredRows}
//                 globalFilter={state.globalFilter}
//                 setGlobalFilter={setGlobalFilter}
//                 // style={globalFilterr}
//               /> */}
//       <table {...getTableProps()}>
//         <thead>
//           {headerGroups.map(headerGroup => (
//             <tr {...headerGroup.getHeaderGroupProps()}>
//               {headerGroup.headers.map(column => (
//                 <th {...column.getHeaderProps()}>
//                   {column.render('Header')}
//                   {/* Render the columns filter UI */}
//                   <div>{column.canFilter ? column.render('Filter') : null}</div>
//                 </th>
//               ))}
//             </tr>
//           ))}
//           <tr>
//             <th
//               colSpan={visibleColumns.length}
//               style={{
//                 textAlign: 'left',
//               }}
//             >
              
//             </th>
//           </tr>
//         </thead>
//         <tbody {...getTableBodyProps()}>
//           {firstPageRows.map((row, i) => {
//             prepareRow(row)
//             return (
//               <tr {...row.getRowProps()}>
//                 {row.cells.map(cell => {
//                   return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
//                 })}
//               </tr>
//             )
//           })}
//         </tbody>
//       </table>
//       <br />
//       <div>Showing the first 20 results of {rows.length} rows</div>
//       <div>
//         <pre>
//           <code>{JSON.stringify(state.filters, null, 2)}</code>
//         </pre>
//       </div>
//       </div>
//     </>
//   )
// }

// // 


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
    
       



export default function Table() {

    const data = React.useMemo(
        () => [
          {
            productName: 'Delta 8 Disposable Vape Cart',
            quantity: 20,
            variants: 3,
            stockLevel: "Low"
          },
          {
            productName: 'Bubba Kush',
            quantity: 100,
            variants: 2,
            stockLevel: "High"
          },
          {
            productName: 'Kanna Bliss',
            quantity: 52,
            variants: 0,
            stockLevel: "Medium"
          },
          {
            productName: 'Delta 8 Disposable Vape Cart',
            quantity: 20,
            variants: 3,
            stockLevel: "Low"
          },
          {
            productName: 'Bubba Kush',
            quantity: 100,
            variants: 2,
            stockLevel: "High"
          },
          {
            productName: 'Kanna Bliss',
            quantity: 52,
            variants: 0,
            stockLevel: "Medium"
          },
          {
            productName: 'Delta 8 Disposable Vape Cart',
            quantity: 20,
            variants: 3,
            stockLevel: "Low"
          },
          {
            productName: 'Bubba Kush',
            quantity: 100,
            variants: 2,
            stockLevel: "High"
          },
          {
            productName: 'Kanna Bliss',
            quantity: 52,
            variants: 0,
            stockLevel: "Medium"
          },
          {
            productName: 'Delta 8 Disposable Vape Cart',
            quantity: 20,
            variants: 3,
            stockLevel: "Low"
          },
          {
            productName: 'Bubba Kush',
            quantity: 100,
            variants: 2,
            stockLevel: "High"
          },
          {
            productName: 'Kanna Bliss',
            quantity: 52,
            variants: 0,
            stockLevel: "Medium"
          },
          {
            productName: 'Delta 8 Disposable Vape Cart',
            quantity: 20,
            variants: 3,
            stockLevel: "Low"
          },
          {
            productName: 'Bubba Kush',
            quantity: 100,
            variants: 2,
            stockLevel: "High"
          },
          {
            productName: 'Kanna Bliss',
            quantity: 52,
            variants: 0,
            stockLevel: "Medium"
          },
          {
            productName: 'Delta 8 Disposable Vape Cart',
            quantity: 20,
            variants: 3,
            stockLevel: "Low"
          },
          {
            productName: 'Bubba Kush',
            quantity: 100,
            variants: 2,
            stockLevel: "High"
          },
          {
            productName: 'Kanna Bliss',
            quantity: 52,
            variants: 0,
            stockLevel: "Medium"
          },
          {
            productName: 'Delta 8 Disposable Vape Cart',
            quantity: 20,
            variants: 3,
            stockLevel: "Low"
          },
          {
            productName: 'Bubba Kush',
            quantity: 100,
            variants: 2,
            stockLevel: "High"
          },
          {
            productName: 'Kanna Bliss',
            quantity: 52,
            variants: 0,
            stockLevel: "Medium"
          },
          {
            productName: 'Delta 8 Disposable Vape Cart',
            quantity: 20,
            variants: 3,
            stockLevel: "Low"
          },
          {
            productName: 'Bubba Kush',
            quantity: 100,
            variants: 2,
            stockLevel: "High"
          },
          {
            productName: 'Kanna Bliss',
            quantity: 52,
            variants: 0,
            stockLevel: "Medium"
          },
        ],
        []
      )



    const columns = React.useMemo(
        () => [
          {
            Header: 'Product Name',
            accessor: 'productName', // accessor is the "key" in the data
          },
          {
            Header: 'Quantity',
            accessor: 'quantity',
          },
          {
            Header: 'Variants',
            accessor: 'variants',
          },
          {
            Header: 'Stock Level',
            accessor: 'stockLevel',
          },
        ],
        []
      )


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
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,

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
             
            //   console.log(cell.value)
            //   document.body.style.backgroundColor = "rgba(0, 0, 0, 0.15)"
            //   if ( document.body.style.backgroundColor === "rgba(0, 0, 0, 0.75)") {
            //     document.body.style.backgroundColor = "white"
            //   } else {
            //     document.body.style.backgroundColor = "rgba(0, 0, 0, 0.75)"
            //   }
             
              
          }
          

    //   const pageLimit = 10
    //   const firstPageRows = rows.slice(0, pageLimit);

      const results = page.length > 10 ? 10 : page.length
      return (
    
          // apply the table props
        <div class="inventory-table">
             <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
        <div style={{margin: "25px 0", color: 'rgba(0,0,0, 57%)'}}>Showing the first {results} results of {rows.length} rows</div>
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
                        // var colorStyle = "#1E384D"
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
                             
                            // console.log(cell)
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
        
        <button style={{backgroundColor: "#EFEFEF", border: "none", padding: "5px 15px", margin: "0 5px", borderRadius: "5px", color: "#1E384D"}} onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'Previous'}
        </button>{' '}
        <button style={{backgroundColor: "#1E384D", border: "none", padding: "5px 15px", margin: "0 5px", borderRadius: "5px", color: "#EFEFEF"}} onClick={() => nextPage()} disabled={!canNextPage}>
          {'Next'}
        </button>{' '}
        </div>
        {isPopup ? <Popup product={productPopup} toggle={() => togglePopup()} /> : null}
        
        </div>
        
      )
     
}

