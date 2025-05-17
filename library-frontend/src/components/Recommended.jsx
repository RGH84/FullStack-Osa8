import { gql, useQuery } from "@apollo/client"

const ME = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`

const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
    }
  }
`

const Recommended = ({ show }) => {
  const { data: meData, loading: meLoading } = useQuery(ME)

  const favoriteGenre = meData?.me?.favoriteGenre
  const { data, loading } = useQuery(ALL_BOOKS, {
    skip: !favoriteGenre,
    variables: { genre: favoriteGenre },
  })

  if (!show) return null
  if (meLoading || loading) return <p>Loading...</p>
  if (!favoriteGenre) return <p>No favorite genre found.</p>

  return (
    <div>
      <h2>Recommended Books</h2>
      <p>Books in your favorite genre <strong>{favoriteGenre}</strong>:</p>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          {data.allBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended
