import React from "react"
import Table from "../components/Table"
import * as helpers from "../helpers"

export default function MiniTable(props) {
  
  const columns = React.useMemo(
      () => [
        {
          Header: 'Product Name',
          accessor: 'title',
          sortDescFirst: true
        },
        {
          Header: 'Units Sold',
          accessor: 'units_sold',
          sortDescFirst: true
        },
        {
          Header: 'Revenue Earned',
          accessor: 'revenue_earned',
          sortDescFirst: true,
          sortType: helpers.sortMoney
        },
      ],
      []
    )

  return (

    <Table columns={columns} data={props.data} search={false} popupEnabled={false} perPage={5}/>
  )
}