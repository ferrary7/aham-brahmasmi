export default function ProductCard({ name, price, image, alt }) {
  return (
    <div className="product-card modern">
      <div className="product-media">
        <img 
          src={image} 
          alt={alt || name} 
          style={{
            width: '100%',
            height: '240px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">{price}</p>
        <button className="btn-gold btn-full">ADD TO CART</button>
      </div>
    </div>
  );
}