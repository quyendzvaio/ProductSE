import "./Botchat.css";
import avatar from '../../assets/chatavt.png';
function Botchat({content}) {
    return (
        <div className="botchat">
            <div>
                <img src={avatar} alt="Bot Avatar" />
                <p>GM Chatbot</p>
            </div>
            <p className="botContent">{content}</p>
        </div>
    );
}
export default Botchat;