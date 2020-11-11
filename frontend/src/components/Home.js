import React from "react"
import Layout from "./Layout"
import Main from "./Main"

export default function Home(props) {
   
    return (
        <Layout user={props.user}>
            <Main user={props.user}/>
        </Layout>
       
    )
    
}