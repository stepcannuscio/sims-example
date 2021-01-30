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

    // Gets all low products
    const lowProductQuery = `
      SELECT p.id, p.shopify_id, p.title, ven.id as "vendor_id", ven.name as "vendor", count(inner_p.variant) as "variants",
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
    // Gets the market value of all products in inventory
    const valueQuery = `
      SELECT sum(quantity * price) as "value"
      FROM variants
    ;
    `
    
    if (req.user) {
        try {
            const result = await db.query(query, values)
            const newResult = await db.query(newQuery, values)
            const newestResult = await db.query(newestQuery, [values[2], values[3]])
            const valueResult = await db.query(valueQuery)
            const lowProductResult = await db.query(lowProductQuery)
            res.json({salesData: result.rows, cogsData: newResult.rows, topSellers: newestResult.rows, inventoryValue: valueResult.rows[0].value, lowProducts: lowProductResult.rows})
        } catch {
            console.log("Error: GET /purchases/:filter/:startDate/:endDate")
            res.send("Error")
        }
    
    } else {
        res.send("Not Authenticated")
    }
})

module.exports = router;