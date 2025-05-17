import { useQuery, useMutation, gql } from "@apollo/client";
import { useState } from "react";
import Select from "react-select";

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`;

const Authors = ({ show, token }) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS);
  const [born, setBorn] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  if (!show) return null;
  if (loading) return <p>Loading authors...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const options = data.allAuthors.map((a) => ({
    value: a.name,
    label: a.name,
  }));

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedAuthor) return;

    try {
      await editAuthor({
        variables: {
          name: selectedAuthor.value,
          setBornTo: Number(born),
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      setSelectedAuthor(null);
      setBorn("");
    } catch (error) {
      console.error("Error setting birth year:", error.message);
    }
  };

  return (
    <div>
      <h2>Authors</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Born</th>
            <th>Books</th>
          </tr>
        </thead>
        <tbody>
          {data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born || "?"}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Set birth year</h3>
      <form onSubmit={submit}>
        <div>
          name
          <Select
            options={options}
            value={selectedAuthor}
            onChange={setSelectedAuthor}
            placeholder="Select author..."
          />
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
