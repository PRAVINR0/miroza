const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const blogsDir = path.join(root, 'blogs');
const dataFile = path.join(root, 'data', 'posts.json');

if(!fs.existsSync(blogsDir)) fs.mkdirSync(blogsDir, { recursive: true });
if(!fs.existsSync(path.join(root, 'data'))) fs.mkdirSync(path.join(root, 'data'));

function slugify(s){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

function randomDate(start, end, index){
  // spread across last 12 months
  const startMs = +new Date(start);
  const endMs = +new Date(end);
  const t = startMs + Math.floor((endMs - startMs) * (index/100));
  return new Date(t).toISOString().slice(0,10);
}

function sample(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

const topics = [
  'AI-Powered Productivity Hacks for Hybrid Teams',
  'Nutrition Strategies for Sustainable Energy',
  'Home Workouts that Build Strength Without Equipment',
  'Microlearning: Short Lessons that Boost Retention',
  'Slow Travel Essentials for Deeper Cultural Immersion',
  'Plant-Based Recipes for Busy Weeknights',
  'Budgeting for Early-Career Professionals in 2026',
  'Daily Habits that Improve Focus and Creativity',
  'Breakthroughs in Quantum Computing Explained',
  'Designing a Morning Routine that Scales',
  'Mindful Running: Techniques for Sustainable Endurance',
  'The Future of Remote Education Platforms',
  'Underrated European Destinations for 2026',
  'Fermentation at Home: Safety and Flavor Tips',
  'Crypto Tax Basics for Casual Investors',
  'How to Build a Reading Habit That Sticks',
  'Citizen Science: How Anyone Can Contribute to Research',
  'Minimalist Home Office Setup for Peak Focus',
  'Recovery Protocols for Amateur Athletes',
  'Starting a Side Hustle While Working Full Time',
  'Creative Writing Prompts to Unlock a Novel',
  'The Role of Satellites in Climate Monitoring',
  'Hybrid Event Planning: Mixing Virtual and Physical',
  'Ferroelectric RAM and Next-Gen Memory',
  'Fermented Foods and Gut Health: Evidence Review',
  'Optimizing Sleep with Light and Temperature',
  'Career Ladders in Small Startups',
  'DIY Bike Maintenance for Urban Riders',
  'Sourdough Science: Gluten and Texture',
  'Passive Income Strategies for Creatives',
  'Public Speaking Tips for Remote Presentations',
  'A Beginner Guide to Sustainable Investing',
  'Home Energy Efficiency on a Budget',
  'Learning a Language Fast: Evidence-Based Methods',
  'How to Plan a Solo Road Trip Safely',
  'Fermentation: Kombucha vs. Kefir',
  'Understanding Central Bank Digital Currencies',
  'Breathing Techniques for Stress Resilience',
  'Urban Gardening in Small Spaces',
  'The Science of Habit Formation',
  'Running a Podcast: Tools and Workflow',
  'Affordable Travel Photography Tips',
  'Nutrition Timing for Athletes',
  'AI Tools for Small Business Automation',
  'Cold Exposure and Health: What Studies Say',
  'Creating Accessible Online Courses',
  'The Rise of Micro-Communities Online',
  'Electric Vehicles: Charging at Home',
  'Mindset Shifts for Long-Term Projects',
  'Healthy Meal Prep for Families',
  'Intro to Backyard Beekeeping',
  'Low-Code Tools for Rapid Prototyping',
  'Effective Meetings: Agenda and Follow-up',
  'Ocean Conservation You Can Support Locally',
  'Time Blocking for Deep Work',
  'Legacy Planning for Creatives',
  'Home Coffee Brewing Techniques',
  'The Role of AI in Medical Imaging',
  'Balancing Screen Time in Childhood',
  'Microbial Diversity in Food Systems',
  'Negotiation Tactics for Salary Raises',
  'Restorative Yoga for Desk Workers',
  'Designing a Personal Knowledge System',
  'Healthy Aging: Mobility and Strength',
  'Solo Business Travel Safety Checklist',
  'The Ethics of Generative AI',
  'Fermentation Safety: Avoiding Contamination',
  'Weekend Hiking Itineraries Near Major Cities',
  'Cold-Brew vs. Hot Coffee: Flavor Chemistry',
  'Financial Planning for New Parents',
  'The Science Behind Habit Stacking',
  'Creating a Capsule Wardrobe Mindfully',
  'Pacing for Marathon Runners',
  'Open Source Tools for Data Analysis',
  'How to Teach Critical Thinking',
  'Sustainable Fashion Choices on a Budget',
  'The Future of Vertical Farming',
  'Resilience Practices for Entrepreneurs',
  'Home Studio Setup for Musicians',
  'Remote Team Rituals that Build Culture',
  'Nutrition Myths Debunked by Research',
  'How to Read Academic Papers Efficiently',
  'Building a Home Library That Inspires',
  'The Impact of Microplastics on Food Chains',
  'Habit Tracking for Behavioral Change',
  'How to Make Better Decisions with Bayesian Thinking',
  'Community-Led Renewable Energy Projects',
  'Creative Uses for Leftover Groceries',
  'The History of Navigation and Exploration',
  'Practical Biohacking for Everyday Performance',
  'Design Systems for Small Teams',
  'Mindful Eating Practices for Better Digestion',
  'What to Pack for a Research Expedition',
  'Using Public Data to Tell Better Stories',
  'How to Start a Local Volunteer Group'
];

// ensure we have 100 topics: if fewer, repeat variations
while(topics.length < 100){
  topics.push(topics[topics.length % 100] + ' — expanded');
}

const author = 'MIROZA Editorial Team';
const category = 'Blogs';

let existing = [];
try{ existing = JSON.parse(fs.readFileSync(dataFile,'utf8')); }catch(e){ existing = []; }

const start = new Date();
const end = new Date();
start.setFullYear(start.getFullYear()-1);

const postsToAdd = [];

for(let i=0;i<100;i++){
  const title = topics[i];
  const slug = slugify(title).slice(0,60);
  const date = randomDate(start, end, i);
  const excerpt = title + ' — A concise exploration of practical takeaways and real-world applications.';
  const keywords = title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).slice(0,8);
  const imagePrompt = `High-quality photo of ${title.toLowerCase()}, natural lighting, 16:9, editorial style`;
  const content = generateContent(title);

  const post = { title, slug, date, author, category, excerpt, keywords, imagePrompt };
  postsToAdd.push(post);

  const html = renderBlogHTML(post, content);
  const outPath = path.join(blogsDir, `${slug}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
}

// append to data/posts.json
const combined = existing.concat(postsToAdd.map(p=>({
  title: p.title,
  slug: p.slug,
  category: p.category,
  date: p.date,
  excerpt: p.excerpt,
  imagePrompt: p.imagePrompt,
  keywords: p.keywords,
  contentPath: `/blogs/${p.slug}.html`
})));
fs.writeFileSync(dataFile, JSON.stringify(combined, null, 2), 'utf8');
console.log('Generated 100 blogs and updated posts.json');

// regenerate blogs/blogs.html (simple list)
const blogIndexPath = path.join(blogsDir, 'blogs.html');
const listHtml = renderBlogsIndex(combined);
fs.writeFileSync(blogIndexPath, listHtml, 'utf8');
console.log('Updated /blogs/blogs.html');

// update index.html to show latest 6
try{
  const indexPath = path.join(root, 'index.html');
  let indexHtml = fs.readFileSync(indexPath,'utf8');
  const latest = combined.slice(-6).reverse();
  const cards = latest.map(p=>`<article class="post-card"><a href="${p.contentPath}"><h3>${p.title}</h3><p class="meta">${p.date}</p><p>${p.excerpt}</p></a></article>`).join('\n');
  // replace between <!-- BLOGS_START --> and <!-- BLOGS_END --> if present, else insert before </main>
  if(indexHtml.includes('<!-- BLOGS_START -->')){
    indexHtml = indexHtml.replace(/<!-- BLOGS_START -->[\s\S]*?<!-- BLOGS_END -->/, `<!-- BLOGS_START -->\n<section class="latest-blogs">${cards}</section>\n<!-- BLOGS_END -->`);
  }else{
    indexHtml = indexHtml.replace('</main>', `</main>\n<section class="latest-blogs">${cards}</section>`);
  }
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log('Updated index.html with latest blogs');
}catch(e){ console.warn('Could not update index.html:', e && e.message); }

function renderBlogHTML(post, content){
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(post.title)} — MIROZA Blog</title>
  <link rel="icon" href="/assets/icons/favicon.ico">
  <meta name="description" content="${escapeHtml(post.excerpt)}" />
  <meta name="author" content="${escapeHtml(post.author)}" />
  <meta name="date" content="${post.date}" />
  <meta name="keywords" content="${post.keywords.join(', ')}" />
  <link rel="canonical" href="https://miroza.online/blogs/${post.slug}.html" />
  <meta property="og:title" content="${escapeHtml(post.title)}" />
  <meta property="og:description" content="${escapeHtml(post.excerpt)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://miroza.online/blogs/${post.slug}.html" />
  <meta property="og:image" content="/assets/placeholder.jpg" />
  <script src="/js/theme.js"></script>
  <link rel="stylesheet" href="/styles/styles.min.css" />
  <link rel="stylesheet" href="/styles/theme.css" />
</head>
<body data-page="blog-article" data-blog-slug="${post.slug}">
  <a href="#content" class="skip-link">Skip to content</a>
  <header class="site-header"><div class="header-inner"><a class="logo" href="/"><img src="/assets/icons/logo.svg" alt="MIROZA logo" width="40" height="40" loading="lazy" /> MIROZA</a><nav class="main-nav" aria-label="Primary navigation"><ul><li><a href="/index.html">Home</a></li><li><a href="/news/news.html">News</a></li><li><a href="/articles/articles.html">Articles</a></li><li><a href="/blogs/blogs.html">Blogs</a></li></ul></nav><button class="theme-toggle" aria-label="Toggle dark or light"><img src="/assets/icons/moon.svg" alt="Toggle theme" width="24" height="24" /></button></div></header>
  <main id="content" tabindex="-1">
    <article class="single-article" aria-labelledby="headline">
      <header>
        <p class="hero-tag">MIROZA Blog</p>
        <h1 id="headline">${escapeHtml(post.title)}</h1>
        <p class="meta">By ${escapeHtml(post.author)} — Published ${post.date}</p>
      </header>
      <figure class="hero-image"><img src="/assets/placeholder.jpg" alt="${escapeHtml(post.title)}" loading="lazy" /></figure>
      ${content}
      <p><a class="back-link" href="/blogs/blogs.html">← Back to Blogs</a></p>
    </article>
  </main>
  <footer class="site-footer"><div class="footer-grid"><div><h3>MIROZA</h3><p>Modern news and articles hub.</p></div></div><p class="copyright">&copy; <span id="year"></span> MIROZA.</p></footer>
  <script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.11/dist/purify.min.js" defer crossorigin="anonymous"></script>
  <script src="/scripts/app.js" defer></script>
</body>
</html>`;
}

function renderBlogsIndex(posts){
  const items = posts.map(p=>`<article class="post-card"><a href="/blogs/${p.slug}.html"><h3>${escapeHtml(p.title)}</h3><p class="meta">${p.date}</p><p>${escapeHtml(p.excerpt)}</p><p><button>Read More</button></p></a></article>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Blogs — MIROZA</title>
  <link rel="icon" href="/assets/icons/favicon.ico">
  <script src="/js/theme.js"></script>
  <link rel="stylesheet" href="/styles/styles.min.css" />
  <link rel="stylesheet" href="/styles/theme.css" />
</head>
<body>
  <header class="site-header"><div class="header-inner"><a class="logo" href="/"><img src="/assets/icons/logo.svg" alt="MIROZA logo" width="40" height="40" loading="lazy" /> MIROZA</a><nav class="main-nav" aria-label="Primary navigation"><ul><li><a href="/index.html">Home</a></li><li><a href="/news/news.html">News</a></li><li><a href="/articles/articles.html">Articles</a></li><li><a href="/blogs/blogs.html">Blogs</a></li></ul></nav><button class="theme-toggle" aria-label="Toggle dark or light"><img src="/assets/icons/moon.svg" alt="Toggle theme" width="24" height="24" /></button></div></header>
  <main id="content">
    <h1>Blogs</h1>
    <section class="posts-grid">
      ${items}
    </section>
  </main>
  <footer class="site-footer"><div class="footer-grid"><div><h3>MIROZA</h3><p>Modern news and articles hub.</p></div></div><p class="copyright">&copy; <span id="year"></span> MIROZA.</p></footer>
  <script src="/scripts/app.js" defer></script>
</body>
</html>`;
}

function generateContent(title){
  // produce 5 paragraphs with subheadings and list
  const p1 = `<p>${escapeHtml(title)} explores practical strategies, emerging research, and actionable tips for readers seeking to apply insights in daily life. This article synthesizes expert opinions and recent findings to provide grounded recommendations.</p>`;
  const p2 = `<h2>Background and Context</h2><p>Understanding the history and recent developments helps frame why this topic matters today. We cover the evolution, current trends, and barriers to adoption.</p>`;
  const p3 = `<h2>Practical Takeaways</h2><ul><li>Start small and build consistency.</li><li>Prioritize evidence-based approaches.</li><li>Measure progress and iterate.</li></ul>`;
  const p4 = `<h3>Implementation Tips</h3><p>Concrete steps and common pitfalls to avoid when applying these ideas.</p>`;
  const p5 = `<p>In conclusion, ${escapeHtml(title)} offers a balanced view—combining optimism about possibilities with caution about limitations. Readers should adapt recommendations to their context.</p>`;
  return `${p1}\n${p2}\n${p3}\n${p4}\n${p5}`;
}

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
