import Head from 'next/head'
import fs from 'fs'
import path from 'path'
import ArticleCard from '../src/components/ArticleCard'
import Layout from '../src/components/Layout'

export default function Home({ articles, news }) {
  return (
    <Layout>
      <Head>
        <title>Miroza — Blogging & News</title>
        <meta name="description" content="Miroza: Blogging and latest news for India & Tamil Nadu. SEO friendly, fast, and responsive." />
      </Head>

      <section className="hero">
        <h1>Miroza</h1>
        <p>Blogging and curated latest news for India & Tamil Nadu</p>
      </section>

      <section className="news">
        <h2>Latest News (India)</h2>
        <div className="grid">
          {(news?.india || []).slice(0,6).map((a) => (
            <ArticleCard key={a.url || a.title} article={a} />
          ))}
        </div>
      </section>

      <section className="news">
        <h2>Latest News (Tamil Nadu)</h2>
        <div className="grid">
          {(news?.tamilnadu || []).slice(0,6).map((a) => (
            <ArticleCard key={a.url || a.title} article={a} />
          ))}
        </div>
      </section>

      <section className="articles">
        <h2>Mini Articles</h2>
        <div className="grid">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  const dataDir = path.join(process.cwd(), 'data')
  const articlesFile = path.join(dataDir, 'articles.json')
  const newsFile = path.join(dataDir, 'news.json')

  const articles = JSON.parse(fs.readFileSync(articlesFile, 'utf8'))

  let news = { india: [], tamilnadu: [] }
  try {
    if (fs.existsSync(newsFile)) {
      news = JSON.parse(fs.readFileSync(newsFile, 'utf8'))
    }
  } catch (err) {
    // ignore — site will render without news.json
  }

  return {
    props: { articles, news }
  }
}
