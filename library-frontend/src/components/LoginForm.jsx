import { useState, useEffect } from "react"
import { gql, useMutation, useApolloClient } from "@apollo/client"

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const LoginForm = ({ setToken, show }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const client = useApolloClient()

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.error(error.graphQLErrors[0]?.message)
    },
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem("library-user-token", token)
      client.resetStore()
    }
  }, [result.data])

  const submit = async (event) => {
    event.preventDefault()
    await login({ variables: { username, password } })
  }

  if (!show) return null

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          username
          <input value={username} onChange={({ target }) => setUsername(target.value)} />
        </div>
        <div>
          password
          <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
