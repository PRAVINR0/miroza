import Head from 'next/head'

export default function Layout({ children }) {
  return (
    <div>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className="site-header">
        <div className="container">
          <a className="brand" href="/">Miroza</a>
          <nav>
            <a href="#">Home</a>
            <a href="#articles">Articles</a>
          </nav>
        </div>
      </header>

      <main className="container">{children}</main>

      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} Miroza — Curated content</div>
      </footer>
    </div>
  )
}
