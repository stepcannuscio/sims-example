import React from "react"
import Table from "../components/Table"

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
          sortType: sortMoney
        },
      ],
      []
    )

    function sortMoney(rowA, rowB) {

      if (Number(rowA.values.revenue_earned.replace(/(^\$|,)/g,'')) > Number(rowB.values.revenue_earned.replace(/(^\$|,)/g,''))) {
          return 1
      } else {
          return -1
      }
  }

  return (
    <Table columns={columns} data={props.data} search={false} popupEnabled={false} perPage={5}/>
  )
}