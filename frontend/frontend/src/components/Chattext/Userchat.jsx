import "./Userchat.css";
function Userchat({content}) {
    return (
        <div className="userchat">
            <div>
                <p>You</p>
            </div>
            <p className="userContent">{content}</p>
        </div>
    );
}
export default Userchat;
