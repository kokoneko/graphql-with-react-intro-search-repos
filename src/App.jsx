import React, { useState } from "react"
import { ApolloProvider } from "react-apollo"
import { Query } from "react-apollo"
import { client } from "./client"
import { SEARCH_REPOSITORIES } from "./graphql"

export const App = () => {

  const DEFAULT_STATE = {
    first: 5,
    after: null,
    last: null,
    before: null,
    query: "フロントエンドエンジニア"
  };

  const [variables, setVariables] = useState(DEFAULT_STATE);

  const handleChange = (event) => {
    setVariables({
      ...variables, query: event.target.value
    })
  };

  return (
    <>
      <ApolloProvider client={client}>
        <form action="">
          <input type="text" value={variables.query} onChange={handleChange} />
        </form>

        <Query 
          query={SEARCH_REPOSITORIES}
          variables={{...variables}}
        >
          {
            ({loading, error, data}) => {
              if (loading) return "Loading..."
              if (error) return `Error! ${error.message}`

              console.log(data);
              return <div></div>
            }
          }
        </Query>
      </ApolloProvider>
    </>
  );
};
