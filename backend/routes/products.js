const express = require('express')
const router = express.Router() // allows us to create routes with the express server
const db = require("../db/dbConfig") // access to DB
var format = require('pg-format') // use to dynamically query DB


router.get('/', async (req, res, next) => {

  // Gets all products

  query = `

  SELECT p.id, p.title, ven.id as "vendor_id", ven.name as "vendor", count(inner_p.variant) as "variants",
  coalesce(sum(inner_p.quantity), 0) as "quantity",


  sum(inner_p.is_low::numeric) as "low_variants",
  case when   ((sum(inner_p.is_low::numeric)+.0001) /  (count(inner_p.variant)+.0001))  >= .5 then 'Low'
  when ((sum(inner_p.is_low::numeric)+.0001) /  (count(inner_p.variant)+.0001))  <.5 and ((sum(inner_p.is_low::numeric)+.0001) /  (count(inner_p.variant)+.0001))  > .0001 then 'Medium'
  else 'High' end as "stockLevel"

  FROM products p left outer JOIN vendors ven on ven.id=p.vendor
  FULL OUTER JOIN

  (
    select p1.id as "product", p1.title, p1.vendor, v.id as "variant",

    coalesce(sum(distinct v.quantity), 0) as "quantity",
    round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2) as "salesPerDay", 

    case when round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2)* 10 >= coalesce(sum(distinct v.quantity)::numeric, 0) then 1
    when coalesce(sum(v.quantity), 0) = 0 then 1
    else 0 end as is_low

    

    from products p1
    join variants v on v.product=p1.id 
    full outer join
    (SELECT pitems.quantity, pitems.variant from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days') as InnerPurchase on v.id = InnerPurchase.variant

    group by p1.id, v.id
    order by "salesPerDay" asc
  ) as inner_p on inner_p.product=p.id
  where p.id!='-999'


  GROUP BY p.id, ven.id

  ;
  `;

  if (req.user) {

    try {
      const result = await db.query(query)
      res.send(result.rows)
      
    } catch {
      console.log("Error: GET /products/")
      res.send("Error")
    }
  
  } else {
    res.send("Not Authenticated")
  }
  
})


router.get('/low', async (req, res) => {

  // Gets all low products

  const query = `
    SELECT p.id, p.title, ven.id as "vendor_id", ven.name as "vendor", count(inner_p.variant) as "variants",
    coalesce(sum(inner_p.quantity), 0) as "quantity",
    sum(inner_p.is_low::numeric) as "low_variants",
    case when   ((sum(inner_p.is_low::numeric)+.0001) /  (count(inner_p.variant)+.0001))  >= .5 then 'Low'
    when ((sum(inner_p.is_low::numeric)+.0001) /  (count(inner_p.variant)+.0001))  <.5 and ((sum(inner_p.is_low::numeric)+.0001) /  (count(inner_p.variant)+.0001))  > .0001 then 'Medium'
    else 'High' end as "stockLevel"
    FROM products p left outer JOIN vendors ven on ven.id=p.vendor
    FULL OUTER JOIN
    (
      select p1.id as "product", p1.title, p1.vendor, v.id as "variant",
      coalesce(sum(distinct v.quantity), 0) as "quantity",
      round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2) as "salesPerDay", 
      case when round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2)* 10 >= coalesce(sum(distinct v.quantity)::numeric, 0) then 1
      when coalesce(sum(v.quantity), 0) = 0 then 1
      else 0 end as is_low  
    from products p1
    join variants v on v.product=p1.id 
    full outer join
    (SELECT pitems.quantity, pitems.variant from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days') as InnerPurchase on v.id = InnerPurchase.variant
    group by p1.id, v.id
    order by "salesPerDay" asc
    ) as inner_p on inner_p.product=p.id
    where p.id!='-999'
    GROUP BY p.id, ven.id
    HAVING ((sum(inner_p.is_low::numeric)+.0001) /  (count(inner_p.variant)+.0001))  >= .5
  ;
  `

  if (req.user) {

    try {
      const result = await db.query(query)
      res.send(result.rows)
    } catch {
      console.log("Error GET /products/low")
      res.send("Error")
    }

  } else {
    res.send("Not Authenticated")
  }
})
  
router.get('/:id/:filter/:startDate/:endDate/:variant', async (req, res) => {

  // Gets a product
 
  // Sets the query data based on the date filter's provided
  var dateLength = 7 // default for month
  var dateFilter = "month"

  if (req.params.filter === "day") {
      dateLength = 10
      dateFilter = "day"
  } else if (req.params.filter === "week") {
      dateFilter = "week"
      dateLength=10
  } else if (req.params.filter === "year") {
      dateFilter = "year"
      dateLength = 4
  }

  const query = `

    select p.id, p.image, p.title as "title", v.id as "variant_id", v.title as "variant",
    coalesce(sum(InnerPurchase.quantity), 0) AS "purchases", v.cost as "cost", sum(distinct InnerJoin.inner_quantity) as "quantity", 
    
    round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2) as "salesPerDay", 
    
    case when round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2)* 10 >= coalesce(sum(distinct InnerJoin.inner_quantity), 0)  then 'Low'
    when round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2)* 10 * 2.5 >= coalesce(sum(distinct InnerJoin.inner_quantity), 0)  then 'Medium' 
    when coalesce(sum(distinct InnerJoin.inner_quantity), 0) = 0 then 'Low'
    else 'High' end as "stockLevel",
    
    inner_order.recent_order
    
    FROM products p JOIN variants v on v.product=p.id full outer JOIN vendors ven on ven.id=p.vendor
    
    full outer join
    
    (SELECT pitems.quantity, pitems.variant, b.date as "date_diff" from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days' ) as InnerPurchase on v.id = InnerPurchase.variant
    JOIN
    (SELECT id, sum(quantity) as "inner_quantity" from variants group by id) as InnerJoin on v.id = InnerJoin.id
    FULL OUTER JOIN
    (SELECT 
      oi.variant, case when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'completed'
    then concat(SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units received on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.completed_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'))
    when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'fulfilled'
    then concat(SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units fulfilled on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.fulfilled_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'), ' - ', SPLIT_PART(STRING_AGG(cast(o.tracking as varchar), ',' order by o.submitted_date desc), ',', 1))
    when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'submitted'
    then concat('Submitted order for ', SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.submitted_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'))
    else 'No Orders' end as "recent_order"
    from order_items oi join orders o on oi.order_id=o.id group by oi.variant) as Inner_Order on v.id=Inner_Order.variant
    WHERE p.id=$1
    group by ven.id, p.id, v.id,inner_order.recent_order
    order by v.quantity desc
    
  ;
`;

  const purchaseQuery = `
    SELECT instore.purchases as "instore", online.purchases as "online", v.id, instore.date
    FROM products p join variants v on p.id=v.product 

    join

    (SELECT sum(pi.total) as "purchases", substring(cast(date_trunc($2, pur.date) as varchar), 1, $3) as "date", v.id
    FROM products p join variants v on v.product=p.id join purchase_items pi on pi.variant=v.id join purchases pur on pur.id=pi.purchase
    WHERE p.id=$1 and pur.source='in-store' and date_trunc('day', pur.date) >= $4 
    and date_trunc('day', pur.date) <= $5
    GROUP BY v.id, substring(cast(date_trunc($2, pur.date) as varchar), 1, $3)) as instore on v.id = instore.id 

    full outer join

    (SELECT sum(pi.total) as "purchases", substring(cast(date_trunc($2, pur.date) as varchar), 1, $3) as "date", v.id
    FROM products p join variants v on v.product=p.id join purchase_items pi on pi.variant=v.id join purchases pur on pur.id=pi.purchase
    WHERE p.id=$1 and pur.source='online' and date_trunc('day', pur.date) >= $4
    and date_trunc('day', pur.date) <= $5
    GROUP BY v.id, substring(cast(date_trunc($2, pur.date) as varchar), 1, $3)) as online on instore.date = online.date

    order by instore.date asc

  `

  const variantPurchaseQuery = `

    SELECT instore.purchases as "instore", online.purchases as "online", v.id, instore.date
    FROM products p join variants v on p.id=v.product 

    join

    (SELECT sum(pi.total) as "purchases", substring(cast(date_trunc($2, pur.date) as varchar), 1, $3) as "date", v.id
    FROM products p join variants v on v.product=p.id join purchase_items pi on pi.variant=v.id join purchases pur on pur.id=pi.purchase
    WHERE p.id=$1 and v.id=$6 and pur.source='in-store' and date_trunc('day', pur.date) >= $4 
    and date_trunc('day', pur.date) <= $5
    GROUP BY v.id, substring(cast(date_trunc($2, pur.date) as varchar), 1, $3)) as instore on v.id = instore.id 

    full outer join

    (SELECT sum(pi.total) as "purchases", substring(cast(date_trunc($2, pur.date) as varchar), 1, $3) as "date", v.id
    FROM products p join variants v on v.product=p.id join purchase_items pi on pi.variant=v.id join purchases pur on pur.id=pi.purchase
    WHERE p.id=$1 and v.id=$6 and pur.source='online' and date_trunc('day', pur.date) >= $4
    and date_trunc('day', pur.date) <= $5
    GROUP BY v.id, substring(cast(date_trunc($2, pur.date) as varchar), 1, $3)) as online on instore.date = online.date

    order by instore.date asc

  `

  var values = []
  const startDate = req.params.startDate
  const endDate = req.params.endDate

  // Sets the values based on if there is a date filter provided or not
  if (startDate === "none" && endDate != "none") {
      values = [req.params.id, dateFilter, dateLength, '1900-01-01', endDate]
  } else if (startDate != "none" && endDate === "none") {
      values = [req.params.id, dateFilter, dateLength, startDate, '3000-01-01']
  } else if (startDate === "none" && endDate === "none") {
      values = [req.params.id, dateFilter, dateLength, '1900-01-01', '3000-01-01']
  } else {
      values = [req.params.id, dateFilter, dateLength,startDate, endDate]
  }

  if (req.params.variant !== "none") {
    values.push(req.params.variant)
  }

  if (req.user) {

    try {
      if (req.params.filter !== "month" || req.params.startDate !== "none" || req.params.endDate !== "none") {
        // There are date filters
        if (req.params.variant !== "none") {
          // There is a variant filter
          const purchaseResult = await db.query(variantPurchaseQuery, values)
          res.send({purchaseData: purchaseResult.rows})
        } else {
          // No variant filter
          const purchaseResult = await db.query(purchaseQuery, values)
          res.send({purchaseData: purchaseResult.rows})
        }
        
      } else {
        // No date filters
        const result = await db.query(query, [req.params.id])
        if (req.params.variant !== "none") {
          // There is a variant filter
          const purchaseResult = await db.query(variantPurchaseQuery, values)
          res.send({productData: result.rows, purchaseData: purchaseResult.rows})
        } else {
          // No variant filter
          const purchaseResult = await db.query(purchaseQuery, values)
          res.send({productData: result.rows, purchaseData: purchaseResult.rows})          
        }
      }
    } catch {
      console.log("Error: GET /products/:id/:filter/:startDate/:endDate/:variant")
      res.send("Error")
    }

  } else {
    res.send("Not Authenticated")
  }   
})


router.post("/:id/update", async (req, res) => {

  // Updates a product's variants

  if (req.user) {

    const updates = req.body.data ? req.body.data : null
    const values = []

    updates.forEach(item => values.push([item.variant_id, item.cost, item.quantity]))

    if (values.length > 0) {

      try {
        const query = format("UPDATE variants v set cost=cast(new.cost as float), quantity=greatest(cast(new.quantity as float), 0) from (values %L) as new (id, cost, quantity) where v.id=cast(new.id as int)", values)
        const result = await db.query(query)
        res.send("Success")
      } catch {
        console.log("Error: POST /products/:id/update")
        res.send("Error")
      }
    } 

  } else {
    res.send("Not Authenticated")
  } 

})

module.exports = router;
