from __future__ import annotations
import json
from datetime import date, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
BLOG_DIR = BASE_DIR / "blogs"
DATA_FILE = BASE_DIR / "data" / "blogs.json"
BLOG_DIR.mkdir(parents=True, exist_ok=True)
DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

START_DATE = date(2025, 11, 25)
AUTHORS = [
    "Miroza Editorial",
    "Miroza Research Desk",
    "Miroza Strategy Team",
    "Miroza Product Lab",
]

TOPICS = [
    {
        "base_title": "Artificial Intelligence in Everyday Life",
        "excerpt": "AI moved from novelty to utility and is now embedded inside chores, mobility, and wellness routines.",
        "focus": "Artificial intelligence is no longer trapped in research labs; it is now tasked with timing appliances, routing deliveries, and keeping medical diaries tidy.",
        "landscape": "Households expect assistants that learn preferences while enterprises demand automation that explains itself, which puts AI on the same maturity curve as broadband.",
        "momentum": "Edge models, regulatory guardrails, and specialized chips are redefining how AI shows up in homes without exhausting power budgets.",
        "signals_summary": "Clinics triaging symptoms, finance apps coaching spending, and adaptive learning stacks all indicate a future where AI is trusted rather than feared.",
        "action_summary": "Teams that translate AI into respectful everyday utilities win loyalty by promoting privacy, consent, and clarity.",
        "conclusion": "Everyday AI succeeds when it is reliable, private, and clearly accountable.",
        "drivers": [
            "Edge accelerators embedded in appliances",
            "Household robots that map and learn routines",
            "City services using AI for traffic and waste",
        ],
        "signals": [
            "Clinics piloting supervised AI triage",
            "Finance apps explaining decisions in plain language",
            "Schools layering adaptive tutoring",
        ],
        "actions": [
            "Audit training data for bias before scaling",
            "Offer a human override for every AI decision",
            "Explain privacy trade offs inside onboarding",
        ],
        "tags": ["AI", "Automation", "Consumer Tech"],
    },
    {
        "base_title": "Renewable Energy Economics",
        "excerpt": "Solar, wind, and storage are beating fossil fuel costs and forcing grids to reinvent incentives.",
        "focus": "Clean power crossed the tipping point where policy, economics, and public pressure all align.",
        "landscape": "Utilities planning new generation assets now default to wind, solar, and storage because they deliver predictable returns without carbon liabilities.",
        "momentum": "Record low bids in solar auctions plus community microgrids prove renewables thrive in both mega and micro deployments.",
        "signals_summary": "Grid operators invest in software defined substations and flexible demand programs that make intermittent sources dependable.",
        "action_summary": "Energy leaders win by pairing renewables with literacy so communities understand when clean electrons flow.",
        "conclusion": "Every contract can accelerate the transition if clean power is treated as the default choice.",
        "drivers": [
            "Falling battery prices unlocking night time solar",
            "Corporate PPAs securing multigigawatt projects",
            "Community owned wind farms sharing dividends",
        ],
        "signals": [
            "AI forecasting narrowing renewable variability",
            "Virtual power plants entering wholesale markets",
            "Industrial clusters electrifying heat",
        ],
        "actions": [
            "Map diesel replacement opportunities site by site",
            "Train facilities teams on storage safety",
            "Publish transparent emissions ledgers",
        ],
        "tags": ["Climate", "Energy", "Sustainability"],
    },
    {
        "base_title": "Productivity Systems That Last",
        "excerpt": "High performers mix ruthless prioritization with habits that protect recovery and creative energy.",
        "focus": "Attention is treated like capital, so schedules block shallow work and reserve time for focus or rest.",
        "landscape": "From engineers to negotiators, results come from clarity of outcomes, systems that remove friction, and communities that keep people accountable.",
        "momentum": "Daily planning rituals, async collaboration rules, and mindfulness audits are moving from experiments to operating norms.",
        "signals_summary": "Teams build productivity stacks that pair behavioral science with lightweight automation so focus survives chaotic weeks.",
        "action_summary": "Scaling productivity is less about more software and more about cultural defaults that respect deep work.",
        "conclusion": "Productivity systems only work when they honor both ambition and rest.",
        "drivers": [
            "Weekly outcome roadmaps reviewed publicly",
            "Meeting constraints baked into calendars",
            "Mindfulness sprints between releases",
        ],
        "signals": [
            "Async standups replacing status calls",
            "Teams automating recurring documentation",
            "Peer coaching circles sharing playbooks",
        ],
        "actions": [
            "Audit every recurring meeting for necessity",
            "Design focus blocks as non negotiable commitments",
            "Invest in coaching that covers rest and recovery",
        ],
        "tags": ["Productivity", "Leadership", "Work"],
    },
    {
        "base_title": "5G and Programmable Connectivity",
        "excerpt": "5G networks enable ultra low latency services from telemedicine to autonomous logistics.",
        "focus": "Connectivity is now a programmable utility for factories, hospitals, and city agencies.",
        "landscape": "Manufacturers, media firms, and civic teams harden edge infrastructure because critical workflows depend on resilient bandwidth.",
        "momentum": "Network slicing, private 5G campuses, and carrier grade edge clouds anchor a new era of connectivity.",
        "signals_summary": "Holographic calls, industrial sensors, and immersive media finally leave the lab thanks to dependable latency.",
        "action_summary": "Businesses that codesign services with telecom partners capture better coverage, SLAs, and innovation roadmaps.",
        "conclusion": "5G is about rewiring how machines, workers, and customers exchange context in real time.",
        "drivers": [
            "Manufacturing lines syncing robots over 5G",
            "Hospitals piloting wireless surgical suites",
            "Ports adopting private networks for cranes",
        ],
        "signals": [
            "AR support sessions on low latency links",
            "Connected cars sharing hazard data",
            "Sports venues streaming multiple camera angles",
        ],
        "actions": [
            "Map mission critical apps to latency targets",
            "Pilot with telecom partners inside one facility",
            "Budget for cybersecurity specific to 5G endpoints",
        ],
        "tags": ["5G", "Edge", "Infrastructure"],
    },
    {
        "base_title": "Sleep Science and Mental Wellness",
        "excerpt": "Sleep is a strategic asset, and circadian discipline is becoming board level conversation.",
        "focus": "Organizations redesign shifts, lighting, and benefits to support circadian rhythms because burnout is a risk factor.",
        "landscape": "Wearables, clinical grade coaching, and policy experiments give people actionable feedback on sleep debt.",
        "momentum": "Health teams blend CBT techniques with environmental tweaks so rest metrics improve without obsession.",
        "signals_summary": "Therapists, HR leads, and sports scientists align on one idea: mental wellness improves when sleep becomes predictable.",
        "action_summary": "The playbook blends technology with timeless habits so rest becomes a company wide advantage.",
        "conclusion": "Better sleep is the quiet infrastructure for resilient teams.",
        "drivers": [
            "Smart lighting that mimics daylight",
            "Shift rotations capped to protect circadian rhythm",
            "Mindfulness sessions embedded into onboarding",
        ],
        "signals": [
            "Clinics prescribing CBT before medication",
            "Sports teams sharing sleep dashboards",
            "Companies subsidizing sleep coaching",
        ],
        "actions": [
            "Audit meeting schedules that intrude on recovery",
            "Educate managers on stress biomarkers",
            "Reward teams for sustainable pace instead of heroics",
        ],
        "tags": ["Wellness", "HR", "Performance"],
    },
    {
        "base_title": "Coding Literacy as a Career Edge",
        "excerpt": "Coding fluency equals problem solving fluency thanks to AI pair programmers and ubiquitous APIs.",
        "focus": "Knowing how to code unlocks leverage because every team feels pressure to automate repetitive work.",
        "landscape": "Low code builders and AI copilots remove entry barriers, yet foundational logic still separates dabblers from digital leaders.",
        "momentum": "Companies reward people who translate messy workflows into scripts, bots, or data products.",
        "signals_summary": "Communities blend product thinking, ethics, and continuous learning so code remains aligned with human needs.",
        "action_summary": "Coding literacy now looks like language literacy: daily practice, peer review, and appreciation for clarity.",
        "conclusion": "Code is the most accessible way to turn ideas into leverage.",
        "drivers": [
            "AI copilots accelerating prototyping",
            "Internal hackathons solving operations pain",
            "Citizen developers pairing with IT for governance",
        ],
        "signals": [
            "Designers writing automations for research",
            "Finance teams scripting reconciliations",
            "HR groups building onboarding bots",
        ],
        "actions": [
            "Create safe sandboxes for experimentation",
            "Pair junior coders with mentors weekly",
            "Celebrate readable documentation as much as features",
        ],
        "tags": ["Careers", "Developer Experience", "Automation"],
    },
    {
        "base_title": "Minimalism for Focus and Happiness",
        "excerpt": "Minimalism streamlines choices, reduces stress, and frees cognitive bandwidth for meaningful work.",
        "focus": "Minimalism is about designing environments that protect attention, not just owning fewer things.",
        "landscape": "Remote work and digital overload pushed people to declutter calendars, apps, and even social feeds.",
        "momentum": "Families adopt capsule wardrobes, quiet work zones, and intentional spending to reclaim focus.",
        "signals_summary": "Workplaces mirror the trend with fewer internal tools, calmer layouts, and meeting hygiene commitments.",
        "action_summary": "The minimalist lens helps teams prioritize outcomes and relationships over vanity metrics.",
        "conclusion": "Minimalism delivers emotional ROI by letting curiosity and rest take up space once filled by clutter.",
        "drivers": [
            "One in one out rules for gear and software",
            "Shared calendars capped at essential rituals",
            "Mindful purchasing tied to long term values",
        ],
        "signals": [
            "Teams sunsetting redundant dashboards",
            "Leaders setting quiet hours by default",
            "Digital detox days added to wellbeing plans",
        ],
        "actions": [
            "Run quarterly audits of commitments",
            "Design restorative corners at home and work",
            "Teach budgeting that aligns with purpose",
        ],
        "tags": ["Lifestyle", "Focus", "Wellbeing"],
    },
    {
        "base_title": "Electric Vehicles Reshape Transportation",
        "excerpt": "EV adoption rewires supply chains, dealership models, and urban infrastructure planning.",
        "focus": "Electric vehicles shifted from halo products to mainstream offerings across every price band.",
        "landscape": "Battery innovation, software centric dashboards, and charging standards rewrite what it means to build a car.",
        "momentum": "Legacy automakers spin up EV only factories while startups pursue vertical integration.",
        "signals_summary": "Charging networks, grid partnerships, and subscription services show how transportation becomes an energy platform.",
        "action_summary": "Delightful EV ownership requires orchestrating hardware, software, and service touchpoints.",
        "conclusion": "The auto industry now competes on electrons and experiences, not horsepower.",
        "drivers": [
            "Gigafactories colocated with renewable power",
            "Software updates unlocking new driving modes",
            "Battery recycling programs closing the loop",
        ],
        "signals": [
            "Retailers installing fast chargers",
            "Utilities coinvesting in depot charging",
            "Ride hailing fleets announcing EV only pledges",
        ],
        "actions": [
            "Plan charging coverage before launching models",
            "Partner with cities on curbside infrastructure",
            "Upskill technicians on high voltage safety",
        ],
        "tags": ["Mobility", "EV", "Sustainability"],
    },
    {
        "base_title": "Remote Work and Global Freelancing",
        "excerpt": "Distributed teams blur borders as companies adopt async operations and talent marketplaces.",
        "focus": "Remote work matured from crisis response to a deliberate strategy for accessing global expertise.",
        "landscape": "Tax policy, collaboration software, and cultural rituals determine whether teams thrive across time zones.",
        "momentum": "Enterprises mix full time hubs with satellite freelancers, creating liquid staffing models.",
        "signals_summary": "People demand transparency around rates, feedback loops, and career progression regardless of location.",
        "action_summary": "Operational excellence depends on documentation that travels faster than meetings.",
        "conclusion": "Remote first cultures unlock resilience when they invest in trust, tooling, and equitable compensation.",
        "drivers": [
            "Async charters that outline response expectations",
            "Digital nomad visas opening new markets",
            "Marketplace platforms vetting specialists",
        ],
        "signals": [
            "Teams broadcasting project briefs publicly",
            "Comp reviews normalizing geo adjusted pay",
            "Onboarding kits mailed worldwide",
        ],
        "actions": [
            "Document every process inside shared wikis",
            "Budget for quarterly in person summits",
            "Coach managers on inclusive communications",
        ],
        "tags": ["Remote Work", "HR", "Future of Work"],
    },
    {
        "base_title": "Digital Privacy Hygiene",
        "excerpt": "Privacy hygiene now requires layered controls across devices, browsers, and cloud accounts.",
        "focus": "Digital privacy is table stakes as data brokers, AI models, and cross device tracking accelerate.",
        "landscape": "Consumers juggle multiple identities and expect tools that respect each context.",
        "momentum": "Privacy preserving defaults, encrypted messaging, and regional data residency are earning trust.",
        "signals_summary": "Governments and platforms push transparency dashboards so people can audit what is collected about them.",
        "action_summary": "A strong privacy posture mixes technical safeguards with habits that minimize oversharing.",
        "conclusion": "Staying safe online is an active discipline, not a one time settings check.",
        "drivers": [
            "Browser isolation for banking and finance",
            "Passwordless authentication replacing SMS codes",
            "Device level encryption enabled by default",
        ],
        "signals": [
            "Privacy nutrition labels on popular apps",
            "State laws mandating data portability",
            "Families adopting shared safety checklists",
        ],
        "actions": [
            "Schedule quarterly privacy audits",
            "Use hardware keys for critical accounts",
            "Teach kids to question every data prompt",
        ],
        "tags": ["Security", "Privacy", "Consumer Tech"],
    },
]

ANGLES = [
    {
        "label": "Playbook for 2025",
        "hook_short": "This edition packages the 2025 playbook teams are requesting.",
        "hook": "We collected the 2025 experiments operators lean on most, then distilled them into a clear playbook.",
        "lens": "Leaders want instructions more than inspiration, so we mapped where budgets, people, and policy collide.",
        "momentum": "Our research interviews highlighted how playbook style documentation accelerates adoption because teams can reuse proven rituals.",
        "signals": "Programs that publish their playbook publicly gain adoption faster because peers can remix the steps without guessing.",
        "action": "Use a playbook format for every change so teams understand the why, the checklist, and the scorecard in one glance.",
        "cta": "Share your version of the playbook and invite feedback to keep it alive.",
    },
    {
        "label": "Leadership Edition",
        "hook_short": "A leadership focused breakdown of the trend lines.",
        "hook": "Executives asked for the leadership view, so we focus on governance, incentives, and decision rights.",
        "lens": "This lens explains how to brief boards, align budgets, and communicate progress without drowning people in jargon.",
        "momentum": "Leadership teams that codify intent early are shipping roadmaps faster because they remove political drag.",
        "signals": "We observed steering committees using lightweight scorecards to keep technical and business stakeholders in sync.",
        "action": "Translate the narrative into leadership friendly OKRs so accountability lives beyond one team.",
        "cta": "Revisit leadership cadences quarterly to keep sponsorship strong.",
    },
    {
        "label": "Data Backed Outlook",
        "hook_short": "A data centric forecast packed with proof points.",
        "hook": "We analyzed hundreds of datasets and interviews to understand where adoption is real versus aspirational.",
        "lens": "Each paragraph ties to data points so planning teams can cite credible proof.",
        "momentum": "Dashboards we reviewed show double digit gains when teams combine telemetry with qualitative interviews.",
        "signals": "Data backed pilots stay funded because metrics make it easy to defend each experiment.",
        "action": "Instrument every milestone and publish the dataset internally so teams can self serve answers.",
        "cta": "Turn the outlook into a living dashboard that updates as new signals arrive.",
    },
    {
        "label": "Starter Guide",
        "hook_short": "Use this starter guide to launch without overwhelm.",
        "hook": "Not every team has a lab full of experts, so this starter guide explains the minimum viable moves.",
        "lens": "It highlights the first ninety days, the roles involved, and the red flags to avoid.",
        "momentum": "Starter teams that constrain scope build confidence because they celebrate early wins before scaling.",
        "signals": "Playful internal branding plus clear onboarding paths pull newcomers into the work quickly.",
        "action": "Outline the smallest viable project, pair it with a mentor, and schedule reflection windows.",
        "cta": "Treat the guide as a checklist you can reuse for every new cohort.",
    },
    {
        "label": "Field Report",
        "hook_short": "A field report drawn from on the ground interviews.",
        "hook": "We spent time with operators in the field to document the gritty realities behind the trend.",
        "lens": "The stories highlight constraints around budgets, compliance, and human change management.",
        "momentum": "Field teams iterate faster when they share play by play recaps instead of sanitized recaps.",
        "signals": "Communities of practice trade field reports to shortcut learning curves across regions.",
        "action": "Capture real world lessons weekly and circulate them so improvements compound.",
        "cta": "Close each project with a field retro so future crews start on third base.",
    },
]


def render_section(heading: str, paragraphs: list[str], bullets_title: str, bullets: list[str]) -> str:
    section_lines = [f"      <h2>{heading}</h2>"]
    for paragraph in paragraphs:
        section_lines.append(f"      <p>{paragraph}</p>")
    if bullets:
        section_lines.append(f"      <h3>{bullets_title}</h3>")
        section_lines.append("      <ul>")
        for bullet in bullets:
            section_lines.append(f"        <li>{bullet}</li>")
        section_lines.append("      </ul>")
    return "\n".join(section_lines)


def build_html(
    slug: str,
    title: str,
    excerpt: str,
    intro: list[str],
    sections: list[dict],
    conclusion: str,
    iso_date: str,
    display_date: str,
    author: str,
    tags: list[str],
    read_time: int,
    word_count: int,
) -> str:
    intro_html = "\n".join(f"      <p>{paragraph}</p>" for paragraph in intro)
    sections_html = "\n\n".join(
        render_section(section["heading"], section["paragraphs"], section["bullets_title"], section["bullets"])
        for section in sections
    )
    article_body = " ".join(intro + [para for section in sections for para in section["paragraphs"]] + [conclusion])
    ld_json = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": excerpt,
        "datePublished": iso_date,
        "dateModified": iso_date,
        "author": {"@type": "Organization", "name": author},
        "publisher": {
            "@type": "Organization",
            "name": "MIROZA",
            "logo": {
                "@type": "ImageObject",
                "url": "https://example.com/assets/icons/logo.svg",
            },
        },
        "wordCount": word_count,
        "timeRequired": f"PT{read_time}M",
        "keywords": ", ".join(tags),
        "mainEntityOfPage": f"https://example.com/blogs/{slug}.html",
        "articleBody": article_body,
    }
    ld_json_str = json.dumps(ld_json, indent=2)
    keywords = ", ".join(tags)
    return f"""<!DOCTYPE html>
<html lang=\"en\" data-theme=\"light\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>{title} - MIROZA Blog</title>
  <meta name=\"description\" content=\"{excerpt}\" />
  <meta name=\"author\" content=\"{author}\" />
  <meta name=\"date\" content=\"{iso_date}\" />
  <meta name=\"keywords\" content=\"{keywords}\" />
  <link rel=\"canonical\" href=\"https://example.com/blogs/{slug}.html\" />
  <meta property=\"og:title\" content=\"{title}\" />
  <meta property=\"og:description\" content=\"{excerpt}\" />
  <meta property=\"og:type\" content=\"article\" />
  <meta property=\"og:url\" content=\"https://example.com/blogs/{slug}.html\" />
  <meta property=\"article:published_time\" content=\"{iso_date}\" />
  <meta property=\"article:author\" content=\"{author}\" />
  <meta name=\"twitter:card\" content=\"summary\" />
  <meta name=\"twitter:title\" content=\"{title}\" />
  <meta name=\"twitter:description\" content=\"{excerpt}\" />
  <link rel=\"stylesheet\" href=\"/styles/styles.css\" />
  <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none';\" />
  <script>(function(){{try{{var t=localStorage.getItem('miroza_theme');if(t){{document.documentElement.dataset.theme=t;}}}}catch(e){{}}})();</script>
  <script type=\"application/ld+json\">{ld_json_str}</script>
</head>
<body data-page=\"blog-article\" data-blog-slug=\"{slug}\">
  <a href=\"#content\" class=\"skip-link\">Skip to content</a>
  <header class=\"site-header\"><div class=\"header-inner\"><a class=\"logo\" href=\"/\"><img src=\"/assets/icons/logo.svg\" alt=\"MIROZA logo\" width=\"40\" height=\"40\" loading=\"lazy\" /> MIROZA</a><nav class=\"main-nav\" aria-label=\"Primary navigation\"><ul><li><a href=\"/\">Home</a></li><li><a href=\"/news/index.html\">News</a></li><li><a href=\"/category/blog.html\">Blog</a></li><li><a href=\"/category/articles.html\">Articles</a></li></ul></nav><button class=\"theme-toggle\" aria-label=\"Toggle dark or light\"><img src=\"/assets/icons/moon.svg\" alt=\"Toggle theme\" width=\"24\" height=\"24\" /></button></div></header>
  <main id=\"content\" tabindex=\"-1\">
    <article class=\"single-article\" aria-labelledby=\"headline\">
      <header>
        <p class=\"hero-tag\">MIROZA Blog</p>
        <h1 id=\"headline\">{title}</h1>
        <p class=\"meta\">By {author} • Published {display_date} • {read_time} min read</p>
      </header>
{intro_html}
{sections_html}
      <h2>Conclusion</h2>
      <p>{conclusion}</p>
      <p><a class=\"back-link\" href=\"/index.html\">← Back to Home</a></p>
    </article>
  </main>
  <footer class=\"site-footer\"><div class=\"footer-grid\"><div><h3>MIROZA</h3><p>Modern news and articles hub.</p></div></div><p class=\"copyright\">© <span id=\"year\"></span> MIROZA.</p></footer>
  <script src=\"https://cdn.jsdelivr.net/npm/dompurify@3.0.11/dist/purify.min.js\" defer crossorigin=\"anonymous\"></script>
  <script src=\"/scripts/app.js\" defer></script>
</body>
</html>
"""


def estimate_word_count(intro: list[str], sections: list[dict], conclusion: str) -> int:
    paragraphs = intro + [para for section in sections for para in section["paragraphs"]]
    paragraphs.append(conclusion)
    return sum(len(paragraph.split()) for paragraph in paragraphs)


def build_blog_payload(index: int) -> dict:
    topic = TOPICS[(index - 1) % len(TOPICS)]
    angle = ANGLES[((index - 1) // len(TOPICS)) % len(ANGLES)]
    author = AUTHORS[(index - 1) % len(AUTHORS)]
    slug = f"blog-{index}"
    iso_date = (START_DATE - timedelta(days=index - 1)).isoformat()
    display_date = (START_DATE - timedelta(days=index - 1)).strftime("%B %d, %Y")
    title = f"{topic['base_title']} {angle['label']}"
    excerpt = f"{topic['excerpt']} {angle['hook_short']}"

    intro = [
        f"{topic['focus']} {angle['hook']}",
        f"{topic['landscape']} {angle['lens']}",
    ]
    sections = [
        {
            "heading": "Momentum Reshaping the Landscape",
            "paragraphs": [topic["momentum"], angle["momentum"]],
            "bullets_title": "Shifts to watch",
            "bullets": topic["drivers"],
        },
        {
            "heading": "Signals From the Field",
            "paragraphs": [topic["signals_summary"], angle["signals"]],
            "bullets_title": "Signals worth tracking",
            "bullets": topic["signals"],
        },
        {
            "heading": "Playbook Moves to Try",
            "paragraphs": [topic["action_summary"], angle["action"]],
            "bullets_title": "Action items",
            "bullets": topic["actions"],
        },
    ]
    conclusion = f"{topic['conclusion']} {angle['cta']}"
    word_count = estimate_word_count(intro, sections, conclusion)
    read_time = max(4, round(word_count / 180))
    tags = sorted(set(topic["tags"] + [angle["label"].replace(" ", "")]))

    return {
        "slug": slug,
        "title": title,
        "excerpt": excerpt,
        "intro": intro,
        "sections": sections,
        "conclusion": conclusion,
        "iso_date": iso_date,
        "display_date": display_date,
        "author": author,
        "tags": tags,
        "read_time": read_time,
        "word_count": word_count,
    }


def main() -> None:
    records: list[dict] = []
    for index in range(1, 51):
        payload = build_blog_payload(index)
        html = build_html(
            slug=payload["slug"],
            title=payload["title"],
            excerpt=payload["excerpt"],
            intro=payload["intro"],
            sections=payload["sections"],
            conclusion=payload["conclusion"],
            iso_date=payload["iso_date"],
            display_date=payload["display_date"],
            author=payload["author"],
            tags=payload["tags"],
            read_time=payload["read_time"],
            word_count=payload["word_count"],
        )
        (BLOG_DIR / f"{payload['slug']}.html").write_text(html, encoding="utf-8")
        records.append(
            {
                "id": index,
                "title": payload["title"],
                "slug": payload["slug"],
                "date": payload["iso_date"],
                "displayDate": payload["display_date"],
                "author": payload["author"],
                "excerpt": payload["excerpt"],
                "readTimeMinutes": payload["read_time"],
                "tags": payload["tags"],
                "canonical": f"https://example.com/blogs/{payload['slug']}.html",
                "url": f"/blogs/{payload['slug']}.html",
                "contentFile": f"/blogs/{payload['slug']}.html",
                "category": "Blog",
            }
        )
    DATA_FILE.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"Generated {len(records)} blog posts and {DATA_FILE}")


if __name__ == "__main__":
    main()
