import React, { useState } from "react"
import { ApolloProvider, Mutation, Query } from "react-apollo"
import { client } from "./client"
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from "./graphql"

const StarButton = (props) => {
  const {node, variables} = props;
  const totalCount = node.stargazers.totalCount;
  const viewerHasStarred = node.viewerHasStarred;
  const starCount = totalCount === 1 ? "1 star" : `${totalCount} stars`
  
  const StarStatus = ({addOrRemoveStar}) => {
    const onClickStar = (starrableId) => {
      addOrRemoveStar({
        variables: {input: {starrableId: starrableId}},
        update: (store, {data: {addStar, removeStar}}) => {
          const {starrable} = addStar || removeStar
          const data = store.readQuery({
            query: SEARCH_REPOSITORIES,
            variables: {...variables}
          })
          const edges = data.search.edges
          const newEdges = edges.map(edge => {
            if (edge.node.id === node.id) {
              const totalCount = edge.node.stargazers.totalCount
              const diff = starrable.viewerHasStarred ? 1 : -1
              const newTotalCount = totalCount + diff
              edge.node.stargazers.totalCount = newTotalCount
            }
            return edge
          })
          data.search.edges = newEdges
          store.writeQuery({
            query: SEARCH_REPOSITORIES,
            data
          })
        }
      })
    }

    return (
      <button onClick={() => onClickStar(node.id)}>
        {starCount} | {viewerHasStarred ? 'starred' : '-'}
      </button>
    )
  }

  return (
    <Mutation 
      mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
    >
      {
        addOrRemoveStar => <StarStatus addOrRemoveStar={addOrRemoveStar}/>
      }
    </Mutation>
  );
}

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

  const goPrevious = (search) => {
    const newVariables = {
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor,
      query: variables.query
    };

    setVariables(newVariables);
  }

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
                            &nbsp;
                            <StarButton node={node} variables={variables}/>
                          </li>
                        )
                      })
                    }
                  </ul>

                  {
                    search.pageInfo.hasPreviousPage === true ? 
                      <button onClick={() => goPrevious(search)}>Previous</button>
                    :
                    null
                  }

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
