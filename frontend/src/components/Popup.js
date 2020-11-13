
export default function Popup(props) {
    console.log(props)
    function handleClick() {
        props.toggle()
    }
    return (
        <div className="modal">
            <div className="modal_content">
                <span className="close" onClick={handleClick}>&times;    </span>
                <p>{props.product.value}</p>
            </div>
      </div>
    )
}