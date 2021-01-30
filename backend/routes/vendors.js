const express = require('express');
const router = express.Router() // allows us to create routes with the express server
const db = require("../db/dbConfig") // access to DB
var format = require('pg-format') // use to dynamically query DB
  
router.get('/:id', async (req, res, next) => {

  // Gets all of the relevant data for the products that a vendor sells
    
  const query = `    
    select distinct ven.name, ven.phone, p.title, p.id, sum(distinct InnerJoin.inner_quantity) as "quantity", sum(distinct InnerJoin.variants) as "variants", 
    coalesce(sum(InnerPurchase.quantity), 0) AS "purchases", 
    
    round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2) as "salesPerDay", 
    
    case when round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2)* 10 >= coalesce(sum(distinct InnerJoin.inner_quantity), 0)  then 'Low'
    when round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2)* 10 * 2.5 >= coalesce(sum(distinct InnerJoin.inner_quantity), 0)  then 'Medium' 
    when coalesce(sum(distinct InnerJoin.inner_quantity), 0) = 0 then 'Low'
    else 'High' end as "stockLevel",
    
    inner_order.recent_order as "recentOrder"
    
    from products p join vendors ven on ven.id=p.vendor join variants v on v.product=p.id
    full outer join
    (SELECT pitems.quantity, pitems.variant, b.date as "date_diff" from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days') as InnerPurchase on v.id = InnerPurchase.variant
    JOIN
    (SELECT product, count(id) as "variants", sum(quantity) as "inner_quantity" from variants group by product) as InnerJoin on p.id = InnerJoin.product
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
    where ven.id = $1
    group by ven.id, p.id,inner_order.recent_order
    order by sum(distinct InnerJoin.inner_quantity) desc
  ; 
  ` 
  ; 
 
  // Gets the communication methods for the vendor
  const commQuery = `
    SELECT method
    FROM communications
    WHERE vendor=$1
  ;
  `

  if (req.user) {
    try {
      const result = await db.query(query, [req.params.id])
      const commResult = await db.query(commQuery, [req.params.id])
      res.send({products: result.rows, commMethods: commResult.rows})
    } catch {
      console.log("Error: GET /vendors/:id")
      res.send("Error")
    }
    
  } else {
    res.send("Not Authenticated")
  }   
})


router.post('/order', async (req, res, next) => {

  // Gets the relevant variant data for all products in an order

  const productIds = req.body.ids

  const params = []
  productIds.forEach((id, index) => {
    params.push('$' + index);
  })

  const query = `    
    select p.id, p.title as "title", v.id as "variant_id", v.title as "variant", v.quantity as "quantity",
    coalesce(sum(InnerPurchase.quantity), 0) AS "purchases", v.cost as "cost", 
    round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2) as "salesPerDay", 
    case when round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2)* 10 >= coalesce(sum(distinct InnerJoin.inner_quantity), 0)  then 'Low'
    when round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2)* 10 * 2.5 >= coalesce(sum(distinct InnerJoin.inner_quantity), 0)  then 'Medium' 
    when coalesce(sum(distinct InnerJoin.inner_quantity), 0) = 0 then 'Low'
    else 'High' end as "stockLevel",
    inner_order.recent_order as "recentOrder"
    from products p join vendors ven on ven.id=p.vendor join variants v on v.product=p.id
    full outer join
    (SELECT pitems.quantity, pitems.variant, b.date as "date_diff" from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days') as InnerPurchase on v.id = InnerPurchase.variant
    JOIN
    (SELECT product, count(id) as "variants", sum(quantity) as "inner_quantity" from variants group by product) as InnerJoin on p.id = InnerJoin.product
    FULL OUTER JOIN
    (SELECT 
      oi.variant, 
      case when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'completed'
      then concat(SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units received on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.completed_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'))
      when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'fulfilled'
      then concat(SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units fulfilled on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.fulfilled_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'), ' - ', SPLIT_PART(STRING_AGG(cast(o.tracking as varchar), ',' order by o.submitted_date desc), ',', 1))
      when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'submitted'
      then concat('Submitted order for ', SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.submitted_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'))
      else 'No Orders' end as "recent_order"
     from order_items oi join orders o on oi.order_id=o.id group by oi.variant
     ) as Inner_Order on v.id=Inner_Order.variant
    WHERE p.id in (%L)
    group by ven.id, p.id, v.id,inner_order.recent_order
    order by v.quantity desc
  ;
  `

  if (req.user) {

    try {
      const newQuery = format(query, productIds)
      const result = await db.query(newQuery)
      res.send(result.rows)
    } catch {
      console.log("Error: POST /vendors/order")
      res.send("Error")
    }

  } else {
    res.send("Not Authenticated")
  }
})


router.get('/', async (req, res) => {

  // Gets all vendors

  const query = `
  select ven.id, ven.contact_name, ven.email, ven.phone, ven.website, ven.deals, ven.order_minimum, ven.name, count(outer_p.id) as "products", coalesce(sum(cast(p.is_low as numeric)), 0) as "low_products"
  from vendors ven full outer join products outer_p on outer_p.vendor=ven.id
  full outer join (
    select p.id, p.title, p.vendor, 
    coalesce(sum(distinct v.quantity), 0) as "quantity",
    round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2) as "salesPerDay", 
    case when round(coalesce(sum(InnerPurchase.quantity), 0)::numeric / 30, 2)* 10 >= coalesce(sum(distinct v.quantity)::numeric, 0) then 1
    when coalesce(sum(v.quantity), 0) = 0 then 1
    else 0 end as is_low
    from products p 
    full outer join variants v on v.product=p.id 
    full outer join
    (SELECT pitems.quantity, pitems.variant from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days') as InnerPurchase on v.id = InnerPurchase.variant
    WHERE p.id!='-999'
    group by p.id
    order by "salesPerDay" asc
  ) as p on p.id=outer_p.id
  WHERE ven.id!='-999'
  group by ven.id
  ; 
` 

if (req.user) {

  try {
    const result = await db.query(query)
    res.send(result.rows)
  } catch {
    console.log("Error: GET /vendors/")
    res.send("Error")
  }

} else {
  res.send("Not Authenticated")
}

 
})

router.post('/', async (req, res, next) => {

  // Creates a vendor

  const methods = req.body.commMethods

  const query = `
    INSERT INTO vendors (name, contact_name, email, phone, website, order_minimum, deals)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  ; 
` 
  const values = [req.body.vendor.vendorName, req.body.vendor.contactName, req.body.vendor.email, req.body.vendor.phone, req.body.vendor.website, req.body.vendor.orderMinimum, req.body.vendor.deals]
  const newValues = []

  if (req.user) {
    try {
      const result = await db.query(query, values)
  
      if (methods) {
        methods.forEach(method => {
          newValues.push([result.rows[0].id, method])
        })
      }

      // Add the communication methods for this vendor
      if (newValues.length > 0) {
        const newQuery = format("INSERT INTO communications (vendor, method) VALUES %L", newValues)
        const newResult = await db.query(newQuery)
      }

      res.send("Success")
  } catch {
    console.log("Error: POST /vendors/")
    res.send("Error")
  }

  } else {
    res.send("Not Authenticated")
  }
  
})

module.exports = router;
  
