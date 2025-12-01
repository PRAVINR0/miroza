const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../blogs');
const IMG_DIR = path.join(__dirname, '../assets/images/vehicles');
const DATA_FILE = path.join(__dirname, '../data/posts.json');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

const TOTAL_ITEMS = 20000;

// --- Data Sources ---
const CAR_BRANDS = [
    "BMW", "Mercedes-Benz", "Toyota", "Honda", "Rolls-Royce", "Aston Martin", "Ford", "Chevrolet", "Tesla", "Audi",
    "Porsche", "Ferrari", "Lamborghini", "Hyundai", "Kia", "Nissan", "Volkswagen", "Volvo", "Jaguar", "Land Rover",
    "Bentley", "Bugatti", "McLaren", "Maserati", "Lexus", "Subaru", "Mazda", "Jeep", "Dodge", "Cadillac"
];

const BIKE_BRANDS = [
    "Honda", "Yamaha", "Kawasaki", "Suzuki", "Ducati", "Harley-Davidson", "BMW Motorrad", "Triumph", "KTM",
    "Royal Enfield", "Hero", "Bajaj", "TVS", "Aprilia", "MV Agusta", "Indian", "Norton"
];

const AIRCRAFT_BRANDS = [
    "Boeing", "Airbus", "Lockheed Martin", "Cessna", "Bombardier", "Embraer", "Gulfstream", "Dassault"
];

const SHIP_TYPES = [
    "Superyacht", "Cruise Liner", "Container Ship", "Aircraft Carrier", "Submarine", "Frigate", "Destroyer", "Tanker"
];

const MODEL_SUFFIXES = ["GT", "X", "S", "R", "Pro", "Elite", "Sport", "Limited", "Turbo", "Hybrid", "Electric", "V8", "V12", "Mark I", "Mark II"];
const ADJECTIVES = ["Ultimate", "Fastest", "Luxurious", "Efficient", "Powerful", "Sleek", "Rugged", "Futuristic", "Classic", "Iconic"];

// --- Generators ---

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateModelName(category) {
    if (category === 'Car') {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const letter = letters[randomInt(0, 25)];
        const num = randomInt(1, 9) * 100;
        return `${letter}${randomInt(1,9)} ${randomItem(MODEL_SUFFIXES)}`;
    } else if (category === 'Bike') {
        const cc = [125, 150, 250, 300, 400, 600, 650, 1000, 1200][randomInt(0, 8)];
        return `${randomItem(["Ninja", "Duke", "Classic", "Monster", "Glide", "Blade", "Raptor"])} ${cc}`;
    } else if (category === 'Aircraft') {
        return `${randomInt(100, 900)}${randomItem(["MAX", "NEO", "Dreamliner", "X", "Jet"])}`;
    } else {
        return `${randomItem(["Star", "Sea", "Ocean", "Queen", "King"])} of the ${randomItem(["Seas", "North", "South", "East", "West"])}`;
    }
}

function generateTitle(brand, model, category) {
    const templates = [
        `The All-New 2026 ${brand} ${model} Review`,
        `Why the ${brand} ${model} is the ${category} of the Year`,
        `${brand} Unveils the ${randomItem(ADJECTIVES)} ${model}`,
        `5 Things You Didn't Know About the ${brand} ${model}`,
        `The Evolution of ${brand}: Introducing the ${model}`,
        `${brand} ${model} vs The Competition: A Detailed Comparison`,
        `Inside the Cockpit of the ${brand} ${model}`,
        `The Engineering Marvel Behind the ${brand} ${model}`,
        `Is the ${brand} ${model} Worth the Hype?`,
        `The Future of ${category}s: The ${brand} ${model} Concept`
    ];
    return randomItem(templates);
}

function generateContent(brand, model, category, title) {
    return `
    <p class="lead">The automotive and transport world is buzzing with the release of the <strong>${brand} ${model}</strong>. In this detailed review, we explore what makes this ${category.toLowerCase()} a true game-changer.</p>
    
    <h2>Design and Aesthetics</h2>
    <p>At first glance, the ${brand} ${model} strikes you with its ${randomItem(ADJECTIVES).toLowerCase()} design. The engineers at ${brand} have outdone themselves, blending aerodynamic efficiency with striking visual appeal. The chassis is sculpted to perfection, reducing drag while maximizing stability at high speeds.</p>
    
    <h2>Performance Specs</h2>
    <p>Under the hood (or fuselage/hull), the ${model} packs a punch. 
    ${category === 'Car' ? 'With a 0-60 mph time of just under 3 seconds, it rivals supercars twice its price.' : ''}
    ${category === 'Bike' ? 'The throttle response is instant, delivering torque that lifts the front wheel with ease.' : ''}
    ${category === 'Aircraft' ? 'It boasts a range of over 8,000 nautical miles, connecting continents effortlessly.' : ''}
    ${category === 'Ship' ? 'Powered by next-gen nuclear propulsion, it can traverse the globe without refueling.' : ''}
    </p>

    <h2>Interior and Features</h2>
    <p>Step inside, and you are greeted by a cockpit designed for the future. The ${model} features a fully digital interface, AI-assisted navigation, and materials sourced from the finest suppliers. Comfort is paramount, whether you are on a cross-country road trip or a trans-Atlantic flight.</p>

    <h2>Safety and Technology</h2>
    <p>${brand} has always been a pioneer in safety, and the ${model} is no exception. It comes equipped with autonomous capabilities, collision avoidance systems, and a reinforced structure that exceeds global safety standards.</p>

    <h2>Conclusion</h2>
    <p>The ${brand} ${model} is not just a ${category.toLowerCase()}; it is a statement. It represents the pinnacle of what ${brand} can achieve. For enthusiasts and professionals alike, this is the machine to beat in 2026.</p>
    `;
}

function generateSVG(brand, category) {
    // Simple silhouette generation based on category
    let pathData = "";
    let color = `hsl(${Math.random() * 360}, 60%, 40%)`;
    
    if (category === 'Car') {
        pathData = "M100,300 L150,250 L250,250 L300,200 L500,200 L550,250 L650,250 L700,300 Z"; // Crude car shape
    } else if (category === 'Bike') {
        pathData = "M200,300 L300,200 L400,300 L500,200 L600,300"; // Crude bike zig-zag
    } else if (category === 'Aircraft') {
        pathData = "M100,250 L300,250 L400,100 L500,250 L700,250 L400,350 Z"; // Crude plane
    } else {
        pathData = "M100,300 L200,350 L600,350 L700,300 L600,200 L200,200 Z"; // Crude ship
    }

    return `<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="450" fill="#1a1a1a" />
  <text x="400" y="100" font-family="Arial" font-size="80" fill="rgba(255,255,255,0.1)" text-anchor="middle" font-weight="bold">${brand.toUpperCase()}</text>
  <path d="${pathData}" fill="none" stroke="${color}" stroke-width="5" transform="translate(50, 50)" />
  <text x="400" y="400" font-family="Arial" font-size="40" fill="${color}" text-anchor="middle">${category.toUpperCase()} SERIES</text>
</svg>`;
}

// --- Main Execution ---
console.log("Starting generation of 20,000 Vehicle Blogs...");

// 1. Generate Brand Images
console.log("Generating brand images...");
const brandImages = {};

const allBrands = [
    ...CAR_BRANDS.map(b => ({ name: b, cat: 'Car' })),
    ...BIKE_BRANDS.map(b => ({ name: b, cat: 'Bike' })),
    ...AIRCRAFT_BRANDS.map(b => ({ name: b, cat: 'Aircraft' })),
    ...SHIP_TYPES.map(b => ({ name: b, cat: 'Ship' })) // Treat types as brands for ships
];

allBrands.forEach(item => {
    const filename = `vehicle-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`;
    const svg = generateSVG(item.name, item.cat);
    fs.writeFileSync(path.join(IMG_DIR, filename), svg);
    brandImages[item.name] = `/assets/images/vehicles/${filename}`;
});

// 2. Generate Blogs
let posts = [];
try {
    // Read existing posts to append
    // Note: Reading 32k items is fine.
    posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
} catch (e) {
    console.log("Creating new posts array.");
}

const newBlogs = [];
const usedTitles = new Set();

for (let i = 0; i < TOTAL_ITEMS; i++) {
    // Select Category
    const r = Math.random();
    let category, brandList;
    if (r < 0.4) { category = 'Car'; brandList = CAR_BRANDS; }
    else if (r < 0.7) { category = 'Bike'; brandList = BIKE_BRANDS; }
    else if (r < 0.85) { category = 'Aircraft'; brandList = AIRCRAFT_BRANDS; }
    else { category = 'Ship'; brandList = SHIP_TYPES; }

    const brand = randomItem(brandList);
    const model = generateModelName(category);
    let title = generateTitle(brand, model, category);

    if (usedTitles.has(title)) {
        title = `${title} (${randomInt(2026, 2030)})`;
    }
    usedTitles.add(title);

    const slug = `vehicle-${i}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    const date = new Date(2025, randomInt(0, 11), randomInt(1, 28)).toISOString();
    const image = brandImages[brand];
    const content = generateContent(brand, model, category, title);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — MIROZA Auto</title>
  <link rel="icon" type="image/svg+xml" href="/assets/icons/logo.svg" />
  <meta name="description" content="${title}. Detailed review of the ${brand} ${model}." />
  <link rel="stylesheet" href="/styles/main.min.css" />
</head>
<body data-page="blog-article">
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="logo" href="/">
        <img src="/assets/icons/logo.svg" alt="MIROZA" width="32" height="32" />
        <span class="logo-text">MIROZA</span>
      </a>
      <nav class="main-nav">
        <ul>
          <li><a href="/index.html">Home</a></li>
          <li><a href="/news/news.html">News</a></li>
          <li><a href="/articles/articles.html">Articles</a></li>
          <li><a href="/blogs/blogs.html">Blogs</a></li>
        </ul>
      </nav>
    </div>
  </header>
  <main id="main">
    <article class="single-article">
      <div class="content-navigation"><a href="/blogs/blogs.html" class="btn-back">← Back to Blogs</a></div>
      <header>
        <h1>${title}</h1>
        <p class="meta">By MIROZA Auto Team • <time datetime="${date}">${new Date(date).toLocaleDateString()}</time> • ${category}</p>
      </header>
      <figure>
        <img src="${image}" alt="${title}" width="800" height="450" loading="lazy" />
        <figcaption>${brand} ${model} - Official Concept Art</figcaption>
      </figure>
      <div class="article-content">${content}</div>
      
      <div class="related-posts">
        <h3>More from ${category}s</h3>
        <p>Explore more reviews in our <a href="/blogs/blogs.html">Auto Section</a>.</p>
      </div>
    </article>
  </main>
  <footer class="site-footer"><div class="copyright">&copy; 2025 MIROZA. All rights reserved.</div></footer>
  <script src="/scripts/app.min.js" defer></script>
</body>
</html>`;

    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), html);

    newBlogs.push({
        id: `vehicle-${i}`,
        title: title,
        excerpt: `Review: ${title}. We test drive the new ${brand} ${model}.`,
        url: `/blogs/${slug}.html`,
        image: image,
        category: category, // Car, Bike, Aircraft, Ship
        date: date,
        tags: ["Vehicle", category, brand, model]
    });

    if (i % 2000 === 0) console.log(`Generated ${i} vehicle blogs...`);
}

// 3. Update Index
// Add new blogs to the TOP
const allPosts = [...newBlogs, ...posts];
fs.writeFileSync(DATA_FILE, JSON.stringify(allPosts, null, 2));

console.log(`Completed! Generated ${TOTAL_ITEMS} vehicle blogs.`);
