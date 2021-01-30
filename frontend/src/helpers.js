
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
})

function sortStockLevel(rowA, rowB) {

    const a = rowA.values.stockLevel
    const b = rowB.values.stockLevel

    if (a === "High" && ["Low", "Medium", "High"].includes(b)) {
        return 1
    } else if (a === "Medium" && ["Low", "Medium"].includes(b)) {
        return 1
    } else if (a === "Low" && b === "Low") {
        return 1
    } else {
        return -1
    }
}

function sortStatus(rowA, rowB) {
  const a = rowA.values.status
  const b = rowB.values.status

  if (a === "completed" && ["submitted", "fulfilled", "completed"].includes(b)) {
      return 1
  } else if (a === "fulfilled" && ["submitted", "fulfilled"].includes(b)) {
      return 1
  } else if (a === "submitted" && b === "submitted") {
      return 1
  } else {
      return -1
  }
}

function sortMoney(rowA, rowB, column) {

    var aValues = "$0"
    var bValues = "$0"

    if (rowA.values[column]) {
      aValues = rowA.values[column]
    }
    if (rowB.values[column]) {
      bValues = rowB.values[column]
    }

    if (Number(aValues.replace(/(^\$|,)/g,'')) > Number(bValues.replace(/(^\$|,)/g,''))) {
        return 1
    } else {
        return -1
    }

  }

function sortDates(rowA, rowB, column) {

    var a = ""
    var b = ""

    if (column === "submitted_date") {
      a = rowA.values.submitted_date
      b = rowB.values.submitted_date
    } else if (column === "fulfilled_date") {
      a = rowA.values.fulfilled_date
      b = rowB.values.fulfilled_date
    } else if (column === "completed_date") {
      a = rowA.values.completed_date
      b = rowB.values.completed_date
    }

    var dateA = ""
    var dateB = ""
    var timeA = ""
    var timeB = ""
    var amPMA = ""
    var amPMB = ""

    if (a) {
      a = a.split(' ')
      dateA = a[0].split('/')
      timeA = a[1].split(':')
      amPMA = a[2]
    } else {
      return 0
    }

    if (b) {
      b = b.split(' ')
      dateB = b[0].split('/')
      timeB = b[1].split(':')
      amPMB = b[2]
    } else {
      return 0
    }

    return dateA[2] - dateB[2] || dateA[0] - dateB[0] || dateA[1] - dateB[1] || amPMA > amPMB || 
            timeA[0][0] - timeB[0][0] || timeA[0][1] - timeB[0][1] || timeA[1][0] - timeB[1][0] || timeA[1][1] - timeB[1][1] || true
}

function capitalizeFirstLetter(string) {
    var newString = ""
    if (string) {
        string.split(' ').forEach((word, index) => {
            newString += word.charAt(0).toUpperCase() + word.slice(1)
            if (index !== (string.split(' ').length - 1)) {
                newString += " "
            }
        })
    }
    return newString
}


export {formatter, sortStockLevel, sortMoney, sortDates, capitalizeFirstLetter, sortStatus}
