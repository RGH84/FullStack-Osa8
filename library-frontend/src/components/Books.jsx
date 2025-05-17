import { useQuery, gql } from "@apollo/client"
import { useState } from "react"
import { ALL_BOOKS } from '../queries'

const Books = ({ show }) => {
  const [genre, setGenre] = useState(null)

  const { loading, error, data } = useQuery(ALL_BOOKS, {
    variables: { genre },
  })

  const allBooksResult = useQuery(ALL_BOOKS)

  if (!show) return null
  if (loading || allBooksResult.loading) return <p>Loading books...</p>
  if (error || allBooksResult.error) return <p>Error: {error?.message || allBooksResult.error.message}</p>

  const books = data.allBooks

  const uniqueGenres = Array.from(
    new Set(allBooksResult.data?.allBooks.flatMap((b) => b.genres) || [])
  )

  return (
    <div>
      <h2>Books</h2>
      {genre && <p>in genre: <strong>{genre}</strong></p>}

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "1em" }}>
        {uniqueGenres.map((g) => (
          <button key={g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenre(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books

