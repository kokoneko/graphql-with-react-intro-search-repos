import React, { useState } from "react"
import { ApolloProvider } from "react-apollo"
import { Query } from "react-apollo"
import { client } from "./client"
import { SEARCH_REPOSITORIES } from "./graphql"

export const App = () => {

  const PER_PAGE = 5
  const DEFAULT_STATE = {
    first: PER_PAGE,
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

  const goNext = (search) => {
    const newVariables = {
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null,
      query: variables.query
    };

    setVariables(newVariables);
  }

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

              const search = data.search;
              const repositoryCount = search.repositoryCount;
              const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories';
              const title = `GitHub Repositories Search Results - ${repositoryCount} ${repositoryUnit}`
              return (
                <>
                  <h2>{title}</h2>
                  <ul>
                    {
                      search.edges.map(edge => {
                        const node = edge.node
                        return (
                          <li key={node.id}>
                            <a href={node.url} target="_blank" rel="noopener noreferrer">{node.name}</a>
                          </li>
                        )
                      })
                    }
                  </ul>

                  {
                    search.pageInfo.hasNextPage === true ? 
                      <button onClick={() => goNext(search)}>Next</button>
                    :
                    null
                  }
                  
                </>
              )
            }
          }
        </Query>
      </ApolloProvider>
    </>
  );
};
