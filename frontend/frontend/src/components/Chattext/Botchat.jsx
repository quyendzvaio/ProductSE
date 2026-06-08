import "./Botchat.css";
import avatar from '../../assets/chatavt.png';

const buildProductUrl = (productCode) => {
    const url = new URL("/", window.location.origin);
    url.searchParams.set("product", productCode);
    return url.toString();
};

function Botchat({content, products = []}) {
    return (
        <div className="botchat">
            <div>
                <img src={avatar} alt="Bot Avatar" />
                <p>Green Meal</p>
            </div>
            <div className="botContent">
                <p>{content}</p>
                {products.length > 0 ? (
                    <div className="recommendedLinks">
                        {products.map((product) => {
                            const productUrl = buildProductUrl(product.product_code);
                            return (
                                <a
                                    key={product.product_code}
                                    href={productUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <strong>{product.product_name}</strong>
                                    <span>{productUrl}</span>
                                </a>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
export default Botchat;
