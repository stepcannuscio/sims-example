const express = require('express');
const router = express.Router() // allows us to create routes with the express server
const db = require("../db/dbConfig") // access to DB
var format = require('pg-format') // use to dynamically query DB
  
router.get('/:id', async (req, res, next) => {

  // Gets all of the relevant data for the products that a vendor sells
    
  const query = `    
    select distinct ven.name, ven.phone, p.title, p.id, sum(distinct InnerJoin.inner_quantity) as "quantity", sum(distinct InnerJoin.variants) as "variants", 
    coalesce(sum(InnerPurchase.quantity), 0) AS "purchases", 
    round(cast(sum(InnerPurchase.quantity) as numeric) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric), 2) as "salesPerDay",
    case when (sum(InnerPurchase.quantity) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric)) * 10 >= sum(distinct InnerJoin.inner_quantity) then 'Low'
    when (sum(InnerPurchase.quantity) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric)) * 10 * 2.5 >= sum(distinct InnerJoin.inner_quantity) then 'Medium' 
    else 'High' end as "stockLevel",

    case when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'completed'
    then concat(SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units received on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.completed_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'))
    when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'fulfilled'
    then concat(SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units fulfilled on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.fulfilled_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'), ' - ', SPLIT_PART(STRING_AGG(cast(o.tracking as varchar), ',' order by o.submitted_date desc), ',', 1))
    when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'submitted'
    then concat('Submitted order for ', SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.submitted_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'))
    else 'No Orders' end as "recentOrder"
    
    from products p join vendors ven on ven.id=p.vendor join variants v on v.product=p.id
    full outer JOIN
    (SELECT product, count(id) as "variants", sum(quantity) as "inner_quantity" from variants group by product) as InnerJoin on p.id = InnerJoin.product
    full outer join
    (SELECT pitems.quantity, pitems.variant from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days') as InnerPurchase on v.id = InnerPurchase.variant
    full outer join order_items oi on oi.variant = v.id
    full outer join orders o on o.id = oi.order_id
    where ven.id = $1
    group by ven.id, p.id
    order by sum(distinct InnerJoin.inner_quantity) desc
    ; 
    ` 
    ; 


    // select distinct ven.name, ven.phone, p.title, p.id, sum(distinct InnerJoin.inner_quantity) as "quantity", sum(distinct InnerJoin.variants) as "variants", 
    // coalesce(sum(InnerPurchase.quantity), 0) AS "purchases", 
    // round(cast(sum(InnerPurchase.quantity) as numeric) / 30, 2) as "salesPerDay",
    // case when (sum(InnerPurchase.quantity) / 30) * 10 >= sum(distinct InnerJoin.inner_quantity) then 'Low'
    // when (sum(InnerPurchase.quantity) / 30) * 10 * 2.5 >= sum(distinct InnerJoin.inner_quantity) then 'Medium' 
    // else 'High' end as "stockLevel",

    // case when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'completed'
    // then concat(SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units received on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.completed_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'))
    // when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'fulfilled'
    // then concat(SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units fulfilled on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.fulfilled_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'), ' - ', SPLIT_PART(STRING_AGG(cast(o.tracking as varchar), ',' order by o.submitted_date desc), ',', 1))
    // when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'submitted'
    // then concat('Submitted order for ', SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.submitted_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'))
    // else 'No Orders' end as "recentOrder"
    
    // from products p join vendors ven on ven.id=p.vendor join variants v on v.product=p.id
    // full outer JOIN
    // (SELECT product, count(id) as "variants", sum(quantity) as "inner_quantity" from variants group by product) as InnerJoin on p.id = InnerJoin.product
    // full outer join
    // (SELECT pitems.quantity, pitems.variant from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days') as InnerPurchase on v.id = InnerPurchase.variant
    // full outer join order_items oi on oi.variant = v.id
    // full outer join orders o on o.id = oi.order_id
    // where ven.id = 214
    // group by ven.id, p.id
    // order by sum(distinct InnerJoin.inner_quantity) desc
    // ; 

    const commQuery = `
      SELECT method
      FROM communications
      WHERE vendor=$1
    ;
    `
  

  if (req.user) {
    const result = await db.query(query, [req.params.id])

    const commResult = await db.query(commQuery, [req.params.id])
    // console.log(commResult.rows)
    res.send({products: result.rows, commMethods: commResult.rows})
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

  // console.log(productIds)

  const query = `    
  select p.id, p.title as "title", v.id as "variant_id", v.title as "variant", v.quantity as "quantity",
  coalesce(sum(InnerPurchase.quantity), 0) AS "purchases", v.cost as "cost",

  round(cast(sum(InnerPurchase.quantity) as numeric) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric), 2) as "salesPerDay",
  case when (sum(InnerPurchase.quantity) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric)) * 10 > sum(v.quantity) then 'Low'
  when (sum(InnerPurchase.quantity) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric)) * 10 * 2.5 > sum(v.quantity) then 'Medium' 
  else 'High' end as "stockLevel",

  case when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'completed'
  then concat(SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units received on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.completed_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'))
  when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'fulfilled'
  then concat(SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units fulfilled on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.fulfilled_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'), ' - ', SPLIT_PART(STRING_AGG(cast(o.tracking as varchar), ',' order by o.submitted_date desc), ',', 1))
  when SPLIT_PART(STRING_AGG(cast(o.status as varchar), ',' order by o.submitted_date desc), ',', 1) = 'submitted'
  then concat('Submitted order for ', SPLIT_PART(STRING_AGG(cast(oi.quantity as varchar), ',' order by o.submitted_date desc), ',', 1), ' units on ', TO_CHAR(SPLIT_PART(STRING_AGG(cast(o.submitted_date as varchar), ',' order by o.submitted_date desc), ',', 1)::timestamptz, 'mm/dd/yyyy hh:mi AM'))
  else 'No Orders' end as "recentOrder"
  
  
  from products p join vendors ven on ven.id=p.vendor join variants v on v.product=p.id
  full outer join
  (SELECT pitems.quantity, pitems.variant from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days') as InnerPurchase on v.id = InnerPurchase.variant
  full outer join order_items oi on oi.variant = v.id
  full outer join orders o on o.id = oi.order_id
  WHERE p.id in (%L)
  group by ven.id, p.id, v.id
  order by v.quantity desc

  ; 
  ` 
  ; 










  
  const newQuery = format(query, productIds)

  if (req.user) {
    const result = await db.query(newQuery)
    // console.log(result.rows)
    res.send(result.rows)
  } else {
    res.send("Not Authenticated")
  }
})


router.get('/', async (req, res) => {

  // Gets all vendors

  const query = `
  select ven.id, ven.contact_name, ven.email, ven.phone, ven.website, ven.name, count(outer_p.id) as "products", sum(cast(p.is_low as numeric)) as "low_products"
  from vendors ven left join products outer_p on outer_p.vendor=ven.id
  full outer join (
    select p.id, p.title, p.vendor, (sum(cast(pi.quantity as numeric)) / 30)*10 as "est_10_day_sales", sum(distinct v.quantity) as "product_quantity", case when coalesce((cast(sum(pi.quantity) as numeric)  / 30), 0) * 10 > sum(distinct v.quantity) then '1' else '0' end as "is_low"
    from products p 
      join variants v on v.product=p.id 
      join purchase_items pi on pi.variant=v.id
      join purchases pur on pur.id=pi.purchase
    WHERE pur.date > current_timestamp - interval '30 days'
    group by p.id
    order by "est_10_day_sales" asc
  ) as p on p.id=outer_p.id
  group by ven.id
  ; 
` 

// select ven.id, ven.contact_name, c.method, ven.email, ven.phone, ven.name, count(outer_p.id) as "products", sum(cast(p.is_low as numeric)) as "low_products"
// from vendors ven join communications c on c.vendor=ven.id left join products outer_p on outer_p.vendor=ven.id 
// full outer join (
//   select p.id, p.title, p.vendor, (sum(cast(pi.quantity as numeric)) / 30)*10 as "est_10_day_sales", sum(distinct v.quantity) as "product_quantity", case when coalesce((cast(sum(pi.quantity) as numeric)  / 30), 0) * 10 > sum(distinct v.quantity) then '1' else '0' end as "is_low"
//   from products p 
//     join variants v on v.product=p.id 
//     join purchase_items pi on pi.variant=v.id
//     join purchases pur on pur.id=pi.purchase
//   WHERE pur.date > current_timestamp - interval '30 days'
//   group by p.id
//   order by "est_10_day_sales" asc
// ) as p on p.id=outer_p.id
// group by ven.id, c.id
// order by id asc
// ;









if (req.user) {
  const result = await db.query(query)
  res.send(result.rows)
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
    // console.log(values)
    const result = await db.query(query, values)

    if (methods) {
      methods.forEach(method => {
        newValues.push([result.rows[0].id, method])
      })
    }

    // console.log(newValues)
    if (newValues.length > 0) {
      const newQuery = format("INSERT INTO communications (vendor, method) VALUES %L", newValues)
      const newResult = await db.query(newQuery)
    }

    

    
    res.send("Success")
  } else {
    res.send("Not Authenticated")
  }
  
})

module.exports = router;
  
