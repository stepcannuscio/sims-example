const express = require('express')
const router = express.Router() // allows us to create routes with the express server
const db = require("../db/dbConfig") // access to DB

router.get('/:filter/:startDate/:endDate', async (req, res, next) => {

    /*

    Gets all purchases, cost of goods sold, and top selling products
    between specifc dates and filtered by day, week, month, year

    */
    
 
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

    // Gets purchases split by source - shopify or woo
    const query = `

    SELECT distinct woo.purchases as "woo", shopify.purchases as "shopify", substring(cast(date_trunc($1, pur.date) as varchar), 1, $2) as "date"
    FROM purchases pur
    join

    (SELECT round(cast(sum(total) as numeric), 2) as "purchases", substring(cast(date_trunc($1, date) as varchar), 1, $2) as "date"
    from purchases where source ='Woo' and date_trunc('day', date) >= $3 
    and date_trunc('day', date) <= $4
    group by substring(cast(date_trunc($1, date) as varchar), 1, $2)) as 
    woo on substring(cast(date_trunc($1, pur.date) as varchar), 1, $2)=woo.date
    join

    (SELECT round(cast(sum(total) as numeric), 2) as "purchases", substring(cast(date_trunc($1, date) as varchar), 1, $2) as "date"
    from purchases where source ='Shopify' and date_trunc('day', date) >= $3
    and date_trunc('day', date) <= $4
    group by substring(cast(date_trunc($1, date) as varchar), 1, $2)) as 
    shopify on substring(cast(date_trunc($1, pur.date) as varchar), 1, $2)=shopify.date

    GROUP BY pur.source, substring(cast(date_trunc($1, pur.date) as varchar), 1, $2), woo.purchases, shopify.purchases
    ORDER by substring(cast(date_trunc($1, pur.date) as varchar), 1, $2) ASC
    ;

    `
    var values = []
    const startDate = req.params.startDate
    const endDate = req.params.endDate

    // Sets the values based on if there is a date filter provided or not
    if (startDate === "none" && endDate != "none") {
        values = [dateFilter, dateLength, '1900-01-01', endDate]
    } else if (startDate != "none" && endDate === "none") {
        values = [dateFilter, dateLength, startDate, '3000-01-01']
    } else if (startDate === "none" && endDate === "none") {
        values = [dateFilter, dateLength, '1900-01-01', '3000-01-01']
    } else {
        values = [dateFilter, dateLength,startDate, endDate]
    }
    
    // Gets cost of goods solds, cost + discounts, and revenue of purchases
    const newQuery = `

    SELECT substring(cast(date_trunc($1, pur.date) as varchar), 1, $2) as "date", sum(pur.total) as "revenue", sum(InnerCost.cost) + sum(pur.discount) as "discount", sum(InnerCost.cost) as "cost"
    FROM purchases pur
    full outer join
    (select pur.id as "purchase", sum(v.cost) as "cost", pur.total from variants v join purchase_items pi on v.id=pi.variant join purchases pur on pur.id=pi.purchase group by pur.id) as InnerCost on pur.id=InnerCost.purchase
    where substring(cast(date_trunc('day', date) as varchar), 1, 10) >= $3 and substring(cast(date_trunc('day', date) as varchar), 1, 10) <= $4
    GROUP BY substring(cast(date_trunc($1, pur.date) as varchar), 1, $2)
    ORDER by substring(cast(date_trunc($1, pur.date) as varchar), 1, $2) ASC

    ;
    `
    // Gets the 50 top selling products
    const newestQuery = `
      SELECT p.title as "title", sum(pi.quantity) as "units_sold", cast(round(cast(sum(pi.total) as numeric), 2) as money) as "revenue_earned"
      FROM purchases pur join purchase_items pi on pur.id=pi.purchase join variants v on v.id=pi.variant join products p on p.id=v.product
      where substring(cast(date_trunc('day', date) as varchar), 1, 10) >= $1 and substring(cast(date_trunc('day', date) as varchar), 1, 10) <= $2
      GROUP BY p.id
      ORDER BY sum(pi.quantity) desc
      LIMIT 50;
    `;

    const lowProductQuery = `
    SELECT p.id, p.shopify_id, p.title, ven.id as "vendor_id", ven.name as "vendor", 
    round(cast(sum(InnerPurchase.quantity) as numeric) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric), 2) as "salesPerDay", sum(distinct InnerJoin.inner_quantity) as "quantity", 
    sum(distinct InnerJoin.variants) as "variants",
    case when (sum(InnerPurchase.quantity) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric)) * 10 > sum(distinct InnerJoin.inner_quantity) then 'Low'
    when (sum(InnerPurchase.quantity) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric)) * 10 * 2.5 > sum(distinct InnerJoin.inner_quantity) then 'Medium' 
    else 'High' end as "stockLevel"
    FROM products p JOIN variants v on v.product=p.id full outer JOIN vendors ven on ven.id=p.vendor
    FULL OUTER JOIN
    (SELECT pitems.quantity, pitems.variant from purchases b join purchase_items pitems on pitems.purchase=b.id WHERE date > current_timestamp - interval '360 days') as InnerPurchase on v.id = InnerPurchase.variant
    JOIN
    (SELECT product, count(id) as "variants", sum(quantity) as "inner_quantity" from variants group by product) as InnerJoin on p.id = InnerJoin.product
    
    GROUP BY p.id, ven.id
    HAVING (sum(InnerPurchase.quantity) / cast(least(date_part('day',current_date::date) - date_part('day',p.date_added::date), 30) as numeric)) * 10 > sum(InnerJoin.inner_quantity)
    ORDER BY quantity desc
    ;
    `
  

    const valueQuery = `
        SELECT sum(quantity * price) as "value"
        FROM variants
    ;
    `


    if (req.user) {
        const result = await db.query(query, values)
        const newResult = await db.query(newQuery, values)
        const newestResult = await db.query(newestQuery, [values[2], values[3]])
        const valueResult = await db.query(valueQuery)
        const lowProductResult = await db.query(lowProductQuery)
        // console.log(lowProductResult)
        res.json({salesData: result.rows, cogsData: newResult.rows, topSellers: newestResult.rows, inventoryValue: valueResult.rows[0].value, lowProducts: lowProductResult.rows})
    } else {
        res.send("Not Authenticated")
    }
})

module.exports = router;