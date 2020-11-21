const { Client } = require('pg');
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const client = new Client({
    user: process.env.DBUSER,
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT,
});

client.connect();

const query = 
    `
    CREATE TABLE dawgs (
        email varchar,
        firstName varchar,
        lastName varchar,
        age int
    );

    CREATE TABLE boawses (
        email varchar,
        firstName varchar,
        lastName varchar,
        age int
    );
    `;

client
    .query(query)
    .then(res => {
        console.log('Successfully created tables');
    })
    .catch(err => {
        console.error(err);
    })
    .finally(() => {
        client.end()
    })
 

    
