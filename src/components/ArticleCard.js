export default function ArticleCard({ article }) {
  const title = article.title || article.name || 'Untitled'
  const excerpt = article.description || article.excerpt || ''
  const image = article.urlToImage || article.image || article.thumbnail || `/placeholder.jpg`

  return (
    <article className="card">
      <img src={image} alt={title} className="card-image" />
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p className="card-excerpt">{excerpt}</p>
        {article.url ? (
          <a className="card-link" href={article.url} target="_blank" rel="noreferrer">Read more</a>
        ) : null}
      </div>
    </article>
  )
}
