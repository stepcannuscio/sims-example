import React from "react";
import Table from "./Table";

export default function Main() {
  const style = {
    backgroundColor: `#e3e4e6`,
    display: `flex`,
    justifyContent: `space-between`,
    margin: `20px`,
    padding: `20px`,
    height: `100vh` /* Force our height since we don't have actual content yet */,
    color: `slategray`,
    gridArea: "main",
    backgroundColor: "#edf1f6"
  };

  // Create the styles and structure for our header and footer elements; grid-area declared previously
  return (
    <main className="main" style={style}>
      <Table />
    </main>
  );
}
