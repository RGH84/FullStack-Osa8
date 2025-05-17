import { useState } from 'react'
import { useMutation, gql } from '@apollo/client'

const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`

const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      published
      genres
      author {
        name
      }
    }
  }
`

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    update: (cache, response) => {
      const addedBook = response.data.addBook

      addedBook.genres.forEach((genre) => {
        try {
          const existing = cache.readQuery({
            query: ALL_BOOKS,
            variables: { genre }
          })

          if (existing && existing.allBooks) {
            cache.writeQuery({
              query: ALL_BOOKS,
              variables: { genre },
              data: {
                allBooks: [...existing.allBooks, addedBook]
              }
            })
          }
        } catch {}

      })

      try {
        const existing = cache.readQuery({
          query: ALL_BOOKS,
          variables: { genre: null }
        })

        if (existing && existing.allBooks) {
          cache.writeQuery({
            query: ALL_BOOKS,
            variables: { genre: null },
            data: {
              allBooks: [...existing.allBooks, addedBook]
            }
          })
        }
      } catch {}
    }
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    try {
      await addBook({
        variables: {
          title,
          author,
          published: Number(published),
          genres,
        },
      })
    } catch (error) {
      console.error('Virhe lisätessä kirjaa:', error.message)
    }

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <h2>Add Book</h2>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
