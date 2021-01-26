const express = require('express')
const router = express.Router() // allows us to create routes with the express server
const db = require("../db/dbConfig") // access to DB
var format = require('pg-format') // use to dynamically query DB


router.get('/', async (req, res, next) => {

  // Gets all products

  query = `

  SELECT p.id, p.shopify_id, p.title, ven.id as "vendor_id", ven.name as "vendor", sum(InnerPurchase.quantity) as "purchases", 
  sum(distinct InnerJoin.inner_quantity)::integer as "quantity", sum(distinct InnerJoin.variants) as "variants", 
  case when (sum(InnerPurchase.quantity) / 30) * 10 > sum(distinct InnerJoin.inner_quantity) then 'Low'
  when (sum(InnerPurchase.quantity) / 30) * 10 * 2.5 > sum(distinct InnerJoin.inner_quantity) then 'Medium' 
  else 'High' end as "stockLevel"
  FROM products p full outer JOIN vendors ven on ven.id=p.vendor JOIN variants v on v.product=p.id 
  FULL OUTER JOIN
  (SELECT pitems.quantity, pitems.variant from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days') as InnerPurchase on v.id = InnerPurchase.variant
  JOIN
  (SELECT product, count(id) as "variants", sum(quantity) as "inner_quantity" from variants group by product) as InnerJoin on p.id = InnerJoin.product
  GROUP BY p.id, ven.id
  ORDER BY quantity desc

  ;
  `;

  if (req.user) {
    const result = await db.query(query)
    res.send(result.rows)
  } else {
    res.send("Not Authenticated")
  }
  
})
  

router.get("/low", async (req, res) => {

  /* 

  Gets all low products:

  Low products are defined as products whose quantity is less than the 
  product's 10 day sales amount from the past 30 days

*/

// select least(date_part('day',current_date::date) - date_part('day',date_added::date), 3) from products;


  const query = `
  SELECT p.id, p.shopify_id, p.title, ven.id as "vendor_id", ven.name as "vendor", 
  round(cast(sum(InnerPurchase.quantity) as numeric) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric), 2) as "salesPerDay", sum(distinct InnerJoin.inner_quantity) as "quantity", 
  sum(distinct InnerJoin.variants) as "variants",
  case when (sum(InnerPurchase.quantity) / least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30)) * 10 > sum(distinct InnerJoin.inner_quantity) then 'Low'
  when (sum(InnerPurchase.quantity) / least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30)) * 10 * 2.5 > sum(distinct InnerJoin.inner_quantity) then 'Medium' 
  else 'High' end as "stockLevel"
  FROM products p JOIN variants v on v.product=p.id full outer JOIN vendors ven on ven.id=p.vendor
  FULL OUTER JOIN
  (SELECT pitems.quantity, pitems.variant from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '360 days') as InnerPurchase on v.id = InnerPurchase.variant
  JOIN
  (SELECT product, count(id) as "variants", sum(quantity) as "inner_quantity" from variants group by product) as InnerJoin on p.id = InnerJoin.product
  
  GROUP BY p.id, ven.id
  HAVING (sum(InnerPurchase.quantity) / least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30)) * 10 > sum(InnerJoin.inner_quantity)
  ORDER BY quantity desc
  ;
  `

  if (req.user) {
    const result = await db.query(query)
    res.send(result.rows)
  } else {
    res.send("Not Authenticated")
  }



})

router.get('/:id/:filter/:startDate/:endDate/:variant', async (req, res) => {

  // Gets a product

//   SELECT p.id as "product_id", p.shopify_id, p.title as "product_title", p.image, p.shopify_id as "product_shopify_id", 
//   v.id as "variant_id", v.title as "variant_title", v.price, v.cost, v.quantity, v.shopify_id as "variant_shopify_id"
// FROM products p join variants v on p.id = v.product
// WHERE p.id=$1
// ORDER BY variant_title ASC

// console.log(req.params)

 
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


  query = `



  select p.id, p.image, p.shopify_id, p.title as "title", v.id as "variant_id", v.title as "variant", v.quantity as "quantity",
  coalesce(sum(InnerPurchase.quantity), 0) AS "purchases", v.cost as "cost", v.shopify_id as "variant_shopify_id",

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
  
  
  from products p full outer join vendors ven on ven.id=p.vendor full outer join variants v on v.product=p.id
  full outer join
  (SELECT pitems.quantity, pitems.variant from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '30 days') as InnerPurchase on v.id = InnerPurchase.variant
  full outer join order_items oi on oi.variant = v.id
  full outer join orders o on o.id = oi.order_id
  WHERE p.id=$1
  group by ven.id, p.id, v.id
  order by v.quantity desc

  ;
`;

// const shopifyPurchaseQuery = `
//   SELECT pi.total, pur.date
//   FROM products p join variants v on v.product=p.id join purchase_items pi on pi.variant=v.id join purchases pur on pur.id=pi.purchase
//   WHERE p.id=$1 and pur.source='Shopify'

// ;
// `

// const wooPurchaseQuery = `
//   SELECT pi.total, pur.date
//   FROM products p join variants v on v.product=p.id join purchase_items pi on pi.variant=v.id join purchases pur on pur.id=pi.purchase
//   WHERE p.id=$1 and pur.source='Woo'
// `
// ;

// this one is more recent

// , woo.date
// p.id=21035

const purchaseQuery = `
  SELECT shopify.purchases as "shopify", woo.purchases as "woo", v.id, shopify.date
  FROM products p join variants v on p.id=v.product 

  join

  (SELECT sum(pi.total) as "purchases", substring(cast(date_trunc($2, pur.date) as varchar), 1, $3) as "date", v.id
  FROM products p join variants v on v.product=p.id join purchase_items pi on pi.variant=v.id join purchases pur on pur.id=pi.purchase
  WHERE p.id=$1 and pur.source='Shopify' and date_trunc('day', pur.date) >= $4 
  and date_trunc('day', pur.date) <= $5
  GROUP BY v.id, substring(cast(date_trunc($2, pur.date) as varchar), 1, $3)) as shopify on v.id = shopify.id 

  full outer join

  (SELECT sum(pi.total) as "purchases", substring(cast(date_trunc($2, pur.date) as varchar), 1, $3) as "date", v.id
  FROM products p join variants v on v.product=p.id join purchase_items pi on pi.variant=v.id join purchases pur on pur.id=pi.purchase
  WHERE p.id=$1 and pur.source='Woo' and date_trunc('day', pur.date) >= $4
  and date_trunc('day', pur.date) <= $5
  GROUP BY v.id, substring(cast(date_trunc($2, pur.date) as varchar), 1, $3)) as woo on shopify.date = woo.date

  order by shopify.date asc

`

const variantPurchaseQuery = `

SELECT shopify.purchases as "shopify", woo.purchases as "woo", v.id, shopify.date
FROM products p join variants v on p.id=v.product 

join

(SELECT sum(pi.total) as "purchases", substring(cast(date_trunc($2, pur.date) as varchar), 1, $3) as "date", v.id
FROM products p join variants v on v.product=p.id join purchase_items pi on pi.variant=v.id join purchases pur on pur.id=pi.purchase
WHERE p.id=$1 and v.id=$6 and pur.source='Shopify' and date_trunc('day', pur.date) >= $4 
and date_trunc('day', pur.date) <= $5
GROUP BY v.id, substring(cast(date_trunc($2, pur.date) as varchar), 1, $3)) as shopify on v.id = shopify.id 

full outer join

(SELECT sum(pi.total) as "purchases", substring(cast(date_trunc($2, pur.date) as varchar), 1, $3) as "date", v.id
FROM products p join variants v on v.product=p.id join purchase_items pi on pi.variant=v.id join purchases pur on pur.id=pi.purchase
WHERE p.id=$1 and v.id=$6 and pur.source='Woo' and date_trunc('day', pur.date) >= $4
and date_trunc('day', pur.date) <= $5
GROUP BY v.id, substring(cast(date_trunc($2, pur.date) as varchar), 1, $3)) as woo on shopify.date = woo.date

order by shopify.date asc

`











// SELECT distinct woo.purchases as "woo", shopify.purchases as "shopify", substring(cast(date_trunc('month', pur.date) as varchar), 1, 7) as "date"
// FROM purchases pur
// join purchase_items pi on pi.purchase=pur.id join variants v on v.id=pi.variant join products p on p.id=v.product 
// join

// (SELECT pur2.id, pi2.id, round(cast(sum(pi2.total) as numeric), 2) as "purchases", substring(cast(date_trunc('month', date) as varchar), 1, 7) as "date"
// from purchases pur2 join purchase_items pi2 on pi2.purchase=pur2.id where source ='Woo'
// group by pi2.id, pur2.id, substring(cast(date_trunc('month', date) as varchar), 1, 7)) as 
// woo on substring(cast(date_trunc('month', pur.date) as varchar), 1, 7)=woo.date
// join

// (SELECT round(cast(sum(pi2.total) as numeric), 2) as "purchases", substring(cast(date_trunc('month', date) as varchar), 1, 7) as "date"
// from purchases pur2 join purchase_items pi2 on pi2.purchase=pur2.id where source ='Shopify'
// group by substring(cast(date_trunc('month', date) as varchar), 1, 7), pi2.id) as 
// shopify on substring(cast(date_trunc('month', pur.date) as varchar), 1, 7)=shopify.date

// GROUP BY pur.source, substring(cast(date_trunc('month', pur.date) as varchar), 1, 7), woo.purchases, shopify.purchases, pi.id
// ORDER by substring(cast(date_trunc('month', pur.date) as varchar), 1, 7) ASC


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
    if (req.params.filter !== "month" || req.params.startDate !== "none" || req.params.endDate !== "none") {
      if (req.params.variant !== "none") {
        const purchaseResult = await db.query(variantPurchaseQuery, values)
        res.send({purchaseData: purchaseResult.rows})
      } else {
        const purchaseResult = await db.query(purchaseQuery, values)
        res.send({purchaseData: purchaseResult.rows})
      }
      
    } else {
      const result = await db.query(query, [req.params.id])
      if (req.params.variant !== "none") {
        const purchaseResult = await db.query(variantPurchaseQuery, values)
        // console.log(purchaseResult.rows)
        res.send({productData: result.rows, purchaseData: purchaseResult.rows})
      } else {
        const purchaseResult = await db.query(purchaseQuery, values)
        res.send({productData: result.rows, purchaseData: purchaseResult.rows})
      }
      // const purchaseResult = await db.query(purchaseQuery, values)
      
    }
    // this means we're just filtering by date so don't need to reload variant data
    
    // const shopifyPurchaseResult = await db.query(shopifyPurchaseQuery, [req.params.id])
    // const wooPurchaseResult = await db.query(wooPurchaseQuery, [req.params.id])
    // console.log(shopifyPurchaseResult.rows)
    // console.log(wooPurchaseResult.rows)
    
    // console.log(purchaseResult.rows)
    // res.send({productData: result.rows, shopifyPurchaseData: shopifyPurchaseResult.rows, wooPurchaseData: wooPurchaseResult.rows})
    
  } else {
    res.send("Not Authenticated")
  }   
})

// Updates a product's variants
router.post("/:id/update", async (req, res) => {

  if (req.user) {

    // console.log(req.body)

    const updates = req.body.data ? req.body.data : null
    const values = []

    updates.forEach(item => values.push([item.variant_id, item.cost, item.quantity]))

    if (values.length > 0) {
      const query = format("UPDATE variants v set cost=cast(new.cost as float), quantity=greatest(cast(new.quantity as float), 0) from (values %L) as new (id, cost, quantity) where v.id=cast(new.id as int)", values)
      const result = await db.query(query)
      res.send("Success")
    } else {
      res.send("Failure")
    }

   
  } else {
    res.send("Not Authenticated")
  } 

  // const updates = req.body.updates
  // const values = []

  // for (var key in updates) {
  //   values.push([key, updates[key]])
  // }

  // // Updates the quantity of the product's variants
  // const query = format("UPDATE variants v set quantity=cast(new.quantity as float) from (values %L) as new (id, quantity) where v.id=cast(new.id as int)", values)

  // if (req.user) {
  //   const result = await db.query(query)
  //   res.send("Success")  

})

module.exports = router;
