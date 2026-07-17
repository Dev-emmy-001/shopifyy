/* ==========================================================
   products.js — Fashion E-Commerce Product Database
   ========================================================== */

const products = {
    // Featured Products
    "f1": {
        id: "f1",
        name: "Cartoon Astronaut T-Shirts",
        brand: "adidas",
        price: 78000,
        images: ["IMAGE/products/f1.jpg", "IMAGE/products/f2.jpg", "IMAGE/products/f3.jpg", "IMAGE/products/f4.jpg"],
        description: "The Gildan Ultra Cotton T-Shirt is made from a substantial 6.0 oz. per sq. yd. fabric constructed from 100% cotton, this classic fit preshrunk jersey knit provides unmatched comfort with each wear. Featuring a taped neck and shoulder, and a seamless double-needle collar, and available in a range of colors, it offers it all in the ultimate head-turning package."
    },
    "f2": {
        id: "f2",
        name: "Sports Performance T-Shirt",
        brand: "adidas",
        price: 65000,
        images: ["IMAGE/products/f2.jpg", "IMAGE/products/f1.jpg", "IMAGE/products/f3.jpg", "IMAGE/products/f4.jpg"],
        description: "Elevate your workout with the Sports Performance T-Shirt. Engineered with moisture-wicking technology and breathable mesh panels, this tee keeps you cool and dry during the most intense training sessions. The ergonomic fit ensures maximum range of motion."
    },
    "f3": {
        id: "f3",
        name: "Classic Polo T-Shirt",
        brand: "adidas",
        price: 89000,
        images: ["IMAGE/products/f3.jpg", "IMAGE/products/f1.jpg", "IMAGE/products/f2.jpg", "IMAGE/products/f4.jpg"],
        description: "A timeless classic for any wardrobe. This Classic Polo T-Shirt features a ribbed collar, a two-button placket, and a soft pique cotton blend that offers both comfort and a sophisticated look, perfect for casual Fridays or a weekend out."
    },
    "f4": {
        id: "f4",
        name: "Urban Style T-Shirt",
        brand: "adidas",
        price: 72000,
        images: ["IMAGE/products/f4.jpg", "IMAGE/products/f1.jpg", "IMAGE/products/f2.jpg", "IMAGE/products/f3.jpg"],
        description: "Stand out in the city with the Urban Style T-Shirt. Featuring a contemporary block design and made from premium heavyweight cotton, this tee offers a relaxed streetwear fit that pairs perfectly with your favorite denim or joggers."
    },
    "f5": {
        id: "f5",
        name: "Graphic Print T-Shirt",
        brand: "adidas",
        price: 55000,
        images: ["IMAGE/products/f5.jpg", "IMAGE/products/f6.jpg", "IMAGE/products/f7.jpg", "IMAGE/products/f8.jpg"],
        description: "Express yourself with our bold Graphic Print T-Shirt. The high-quality, fade-resistant print on the chest adds a pop of personality to your casual looks. Made with ultra-soft combed cotton for all-day comfort."
    },
    "f6": {
        id: "f6",
        name: "Summer Breeze T-Shirt",
        brand: "adidas",
        price: 68000,
        images: ["IMAGE/products/f6.jpg", "IMAGE/products/f5.jpg", "IMAGE/products/f7.jpg", "IMAGE/products/f8.jpg"],
        description: "Beat the heat in the Summer Breeze T-Shirt. Crafted from a lightweight, linen-cotton blend, this airy tee provides exceptional breathability and a laid-back, textured look perfect for beach days or summer barbecues."
    },
    "f7": {
        id: "f7",
        name: "Vintage Wash T-Shirt",
        brand: "adidas",
        price: 92000,
        images: ["IMAGE/products/f7.jpg", "IMAGE/products/f5.jpg", "IMAGE/products/f6.jpg", "IMAGE/products/f8.jpg"],
        description: "Get that perfect lived-in feel with the Vintage Wash T-Shirt. Each shirt undergoes a special garment-dyeing and washing process to achieve a unique, sun-faded look and incredible softness right out of the box."
    },
    "f8": {
        id: "f8",
        name: "Active Wear T-Shirt",
        brand: "adidas",
        price: 78000,
        images: ["IMAGE/products/f8.jpg", "IMAGE/products/f5.jpg", "IMAGE/products/f6.jpg", "IMAGE/products/f7.jpg"],
        description: "Designed for those on the move. The Active Wear T-Shirt features four-way stretch fabric and anti-odor treatment. Whether you're hitting the gym, running trails, or just running errands, this tee keeps up with your lifestyle."
    },

    // New Arrivals
    "n1": {
        id: "n1",
        name: "Fresh Drop Tee — Midnight",
        brand: "adidas",
        price: 82000,
        images: ["IMAGE/products/n1.jpg", "IMAGE/products/n2.jpg", "IMAGE/products/n3.jpg", "IMAGE/products/n4.jpg"],
        description: "The latest addition to our core collection. The Fresh Drop Tee in Midnight offers a sleek, monochromatic look with a subtle embroidered logo. Cut from premium mid-weight organic cotton for a sustainable and stylish choice."
    },
    "n2": {
        id: "n2",
        name: "Cali Surf Cotton Tee",
        brand: "adidas",
        price: 74000,
        images: ["IMAGE/products/n2.jpg", "IMAGE/products/n1.jpg", "IMAGE/products/n3.jpg", "IMAGE/products/n4.jpg"],
        description: "Bring the West Coast vibes wherever you go. The Cali Surf Cotton Tee features a relaxed, boxy fit and a retro surf-inspired graphic on the back. Washed for extreme softness, it feels like an old favorite from day one."
    },
    "n3": {
        id: "n3",
        name: "Tokyo Street Style Tee",
        brand: "adidas",
        price: 79000,
        images: ["IMAGE/products/n3.jpg", "IMAGE/products/n1.jpg", "IMAGE/products/n2.jpg", "IMAGE/products/n4.jpg"],
        description: "Inspired by the vibrant fashion of Harajuku. The Tokyo Street Style Tee boasts a slightly oversized drop-shoulder fit and bold contrast stitching. A statement piece that effortlessly elevates any urban outfit."
    },
    "n4": {
        id: "n4",
        name: "Urban Explorer Hoodie-Tee",
        brand: "adidas",
        price: 95000,
        images: ["IMAGE/products/n4.jpg", "IMAGE/products/n1.jpg", "IMAGE/products/n2.jpg", "IMAGE/products/n3.jpg"],
        description: "The perfect hybrid for unpredictable weather. The Urban Explorer Hoodie-Tee combines the lightweight feel of a t-shirt with the utility of a hood and kangaroo pocket. Ideal for layering during transitional seasons."
    },
    "n5": {
        id: "n5",
        name: "Essential Comfort Tee",
        brand: "adidas",
        price: 61000,
        images: ["IMAGE/products/n5.jpg", "IMAGE/products/n6.jpg", "IMAGE/products/n7.jpg", "IMAGE/products/n8.jpg"],
        description: "Your new everyday go-to. The Essential Comfort Tee focuses on the basics done perfectly: a flattering crew neckline, a regular fit that's not too tight or too loose, and a durable fabric blend that holds its shape wash after wash."
    },
    "n6": {
        id: "n6",
        name: "Bold Logo Statement Tee",
        brand: "adidas",
        price: 70000,
        images: ["IMAGE/products/n6.jpg", "IMAGE/products/n5.jpg", "IMAGE/products/n7.jpg", "IMAGE/products/n8.jpg"],
        description: "Make your mark with the Bold Logo Statement Tee. Showcasing our iconic branding front and center with a modern, oversized print. Constructed with high-density cotton for a crisp, structured drape."
    },
    "n7": {
        id: "n7",
        name: "Minimalist Black Tee",
        brand: "adidas",
        price: 85000,
        images: ["IMAGE/products/n7.jpg", "IMAGE/products/n5.jpg", "IMAGE/products/n6.jpg", "IMAGE/products/n8.jpg"],
        description: "An absolute essential. The Minimalist Black Tee is stripped back to pure simplicity. No visible branding, just immaculate tailoring, premium Pima cotton, and a pitch-black dye that resists fading over time."
    },
    "n8": {
        id: "n8",
        name: "Retro Wave Print Tee",
        brand: "adidas",
        price: 77000,
        images: ["IMAGE/products/n8.jpg", "IMAGE/products/n5.jpg", "IMAGE/products/n6.jpg", "IMAGE/products/n7.jpg"],
        description: "Channel 80s nostalgia with the Retro Wave Print Tee. The vibrant, neon-inspired graphic pops against the dark fabric background. A fun, conversation-starting piece for weekend adventures and summer festivals."
    }
};

// Function to get a product by ID
function getProductById(id) {
    return products[id] || null;
}
