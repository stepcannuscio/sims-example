import React from "react"
import Layout from "./Layout"
import Table from "./Table"
import makeData from '../makeData'

export default function Inventory(props) {
    // console.log('inventory prrops:')
    // console.log(props)
    // const columns = React.useMemo(
    //     () => [
    //       {
         
    //             Header: 'First Name',
    //             accessor: 'firstName',
    //           },
    //           {
    //             Header: 'Last Name',
    //             accessor: 'lastName',
    //             // Use our custom `fuzzyText` filter on this column
    //             filter: 'fuzzyText',
    //           },
    //         ],
        
        
        
    //     []
    //   )

      
    
    //   const data = React.useMemo(() => makeData(100000), [])

    return (

        <Layout user={props.user}>
            <div style={{gridArea: "main", width: "80%", margin: "20px auto"}}>
                <h1>Inventory</h1>
                <Table />
            </div>
        </Layout>
    )
    
}