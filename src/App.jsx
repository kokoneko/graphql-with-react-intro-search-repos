import React, { useState } from "react"
import { ApolloProvider } from "react-apollo"
import { Query } from "react-apollo"
import { client } from "./client"
import { SEARCH_REPOSITORIES } from "./graphql"

export const App = () => {

  const VARIABLES = {
    first: 5,
    after: null,
    last: null,
    before: null,
    query: "フロントエンドエンジニア"
  };

  const [variables, setVariables] = useState(VARIABLES);
  
  return (
    <>
      <ApolloProvider client={client}>

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
