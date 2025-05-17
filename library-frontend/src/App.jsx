import { useState, useEffect } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import LoginForm from "./components/LoginForm"
import Recommended from "./components/Recommended"
import { useApolloClient, useSubscription } from '@apollo/client'
import { BOOK_ADDED, ALL_BOOKS } from './queries'


const App = () => {
  const [page, setPage] = useState("authors")
  const [token, setToken] = useState(null)

  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      console.log('Uusi kirja lisätty:', addedBook)
  
      client.cache.updateQuery({
        query: ALL_BOOKS,
        variables: { genre: null },
      }, (existing) => {
        if (!existing) return { allBooks: [addedBook] }
        if (existing.allBooks.some(b => b.title === addedBook.title)) return existing
        return {
          allBooks: existing.allBooks.concat(addedBook),
        }
      })
  
      addedBook.genres.forEach((g) => {
        client.cache.updateQuery({
          query: ALL_BOOKS,
          variables: { genre: g },
        }, (existing) => {
          if (!existing) return { allBooks: [addedBook] }
          if (existing.allBooks.some(b => b.title === addedBook.title)) return existing
          return {
            allBooks: existing.allBooks.concat(addedBook),
          }
        })
      })
    },
  })

  useEffect(() => {
    const saved = localStorage.getItem("library-user-token")
    if (saved) setToken(saved)
  }, [])

  const logout = () => {
    setToken(null)
    localStorage.removeItem("library-user-token")
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={() => setPage("recommended")}>recommended</button>}
        {!token ? (
          <button onClick={() => setPage("login")}>login</button>
        ) : (
          <button onClick={logout}>logout</button>
        )}
      </div>

      <Authors show={page === "authors"} token={token} />
      <Books show={page === "books"} />
      <NewBook show={page === "add"} token={token} />
      <Recommended show={page === "recommended"} />
      <LoginForm show={page === "login"} setToken={setToken} />
    </div>
  )
}

export default App
