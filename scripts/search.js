const contentIndex = [
    { title: "Global Digital Currency Standard Adopted by G20", url: "news/global-digital-currency.html", type: "News" },
    { title: "Universal Flu Vaccine Enters Final Trials", url: "news/universal-flu-vaccine.html", type: "News" },
    { title: "Great Barrier Reef Shows Record Recovery", url: "news/reef-recovery-success.html", type: "News" },
    { title: "Construction Begins on First Lunar Hotel", url: "news/moon-hotel-construction.html", type: "News" },
    { title: "Holographic Smartphones Hit the Market", url: "news/holographic-phones.html", type: "News" },
    { title: "UN Launches $50 Billion Global Food Security Fund", url: "news/global-food-security-fund.html", type: "News" },
    { title: "Quantum Computing Breakthrough: 1 Million Qubits Reached", url: "news/quantum-computing-breakthrough.html", type: "News" },
    { title: "Global Tech Summit 2025: Key Highlights", url: "news/tech-summit-highlights.html", type: "News" },
    { title: "Electric Vehicles Overtake Gas Cars in Global Sales", url: "news/ev-overtake-gas.html", type: "News" },
    { title: "New AI Regulations: What You Need to Know", url: "news/ai-regulations-2025.html", type: "News" },
    { title: "The Future of Work: What to Expect in 2030", url: "articles/future-of-work-2030.html", type: "Article" },
    { title: "A Guide to Building Sustainable Cities", url: "articles/sustainable-cities-guide.html", type: "Article" },
    { title: "Practicing Mindfulness in the Digital Age", url: "articles/mindfulness-digital-age.html", type: "Article" },
    { title: "The Rise of Vertical Farming", url: "articles/vertical-farming-cities.html", type: "Article" },
    { title: "The Future of Fashion is Circular", url: "articles/sustainable-fashion-future.html", type: "Article" },
    { title: "The AI Revolution of 2025", url: "articles/ai-revolution-2025.html", type: "Article" },
    { title: "Mars Mission: The First 100 Days", url: "articles/mars-mission-100-days.html", type: "Article" },
    { title: "Best Movies of the Year 2025", url: "articles/best-movies-2025.html", type: "Article" },
    { title: "Mars Water Discovery Confirmed", url: "news/mars-water-discovery.html", type: "News" },
    { title: "Flying Car Regulations Passed", url: "news/flying-car-regulations.html", type: "News" },
    { title: "Ocean Plastic Cleanup Milestone", url: "news/ocean-plastic-cleanup-milestone.html", type: "News" },
    { title: "Telepathy Chip Human Trials", url: "news/telepathy-chip-human-trials.html", type: "News" },
    { title: "Fusion Power Grid Integration", url: "news/fusion-power-grid.html", type: "News" },
    { title: "AI Education Reform", url: "news/ai-education-reform.html", type: "News" },
    { title: "Smart Contact Lenses Released", url: "news/smart-contact-lenses.html", type: "News" },
    { title: "The Psychology of Long-Duration Space Travel", url: "articles/psychology-of-space-travel.html", type: "Article" },
    { title: "A Brief History of Internet 3.0", url: "articles/history-of-internet-3.0.html", type: "Article" },
    { title: "The Future of Sports Technology", url: "articles/future-of-sports-tech.html", type: "Article" },
    { title: "Deep Sea Exploration: A Beginner's Guide", url: "articles/deep-sea-exploration-guide.html", type: "Article" },
    { title: "Minimalist Living: A Practical Guide", url: "articles/minimalist-living-guide.html", type: "Article" },
    { title: "Urban Gardening Masterclass", url: "articles/urban-gardening-masterclass.html", type: "Article" },
    { title: "The Ethics of Human Cloning", url: "articles/ethics-of-cloning.html", type: "Article" },
    { title: "Top Digital Detox Retreats of 2025", url: "articles/digital-detox-retreats.html", type: "Article" },
    { title: "The Future of Music in the Age of AI", url: "articles/future-of-music-ai.html", type: "Article" },
    { title: "Sustainable Travel Trends for 2030", url: "articles/sustainable-travel-2030.html", type: "Article" },
    { title: "Biohacking for Longevity: Fact vs. Fiction", url: "articles/biohacking-longevity.html", type: "Article" },
    { title: "The Meteoric Rise of Esports", url: "articles/rise-of-esports.html", type: "Article" },
    { title: "My Week with an AI Personal Assistant", url: "blogs/my-week-with-ai-assistant.html", type: "Blog" },
    { title: "The Reality of Van Life: It's Not All Sunsets", url: "blogs/van-life-reality.html", type: "Blog" },
    { title: "Learning to Code at 40: My Journey", url: "blogs/learning-coding-at-40.html", type: "Blog" },
    { title: "How Meditation Transformed My Productivity", url: "blogs/meditation-transformation.html", type: "Blog" },
    { title: "30 Days Vegan: My Results", url: "blogs/vegan-challenge-results.html", type: "Blog" },
    { title: "10 Tips for Developer Productivity", url: "blogs/developer-productivity.html", type: "Blog" }
];

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const resultsContainer = document.getElementById('searchResults');

    if (query && resultsContainer) {
        const lowerQuery = query.toLowerCase();
        const results = contentIndex.filter(item => 
            item.title.toLowerCase().includes(lowerQuery)
        );

        if (results.length > 0) {
            results.forEach(item => {
                const div = document.createElement('div');
                div.className = 'article-card';
                div.style.marginBottom = '20px';
                div.style.paddingBottom = '20px';
                div.style.borderBottom = '1px solid #eee';
                div.innerHTML = `
                    <h2 style="font-size: 22px; margin-bottom: 10px;"><a href="${item.url}" class="hover-red">${item.title}</a></h2>
                    <span style="font-size: 12px; color: #888; text-transform: uppercase;">${item.type}</span>
                `;
                resultsContainer.appendChild(div);
            });
        } else {
            resultsContainer.innerHTML = '<p>No results found.</p>';
        }
    }
});
