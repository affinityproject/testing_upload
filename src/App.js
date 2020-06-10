import React from 'react';
import logo from './logo.svg';
import './App.css';
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'
import {ApolloClient} from "apollo-client"
import {ApolloProvider} from "react-apollo"
import gql from "graphql-tag"
import { Mutation } from "react-apollo"
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.log('graphQLErrors', graphQLErrors);
  }
  if (networkError) {
    console.log('networkError', networkError);
  }
});


const apolloCache = new InMemoryCache()

const uploadLink = createUploadLink({
  uri: 'http://localhost:4000/', // Apollo Server is served from port 4000
  headers: {
    "keep-alive": "true"
  }
})

const client = new ApolloClient({
  cache: apolloCache,
  // link: uploadLink
  link:  ApolloLink.from([errorLink, uploadLink])
})

const fileUpload = ({target: { files }}) => {
    const file = files[0]
    console.log(file)
}

const UPLOAD_FILE = gql`
  mutation singleUpload($file: Upload!) {
    singleUpload(file: $file) {
      filename
      mimetype
      encoding
    }
  }
`;

const UPLOAD_FILE_STREAM = gql`
  mutation generalImageUpload($file: Upload!) {
    generalImageUpload(file: $file) 
  }
`;


function App() {
  return (
    <div className="App">
      <ApolloProvider client={client}>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Upload to Trident China Server</h2>
        <Mutation mutation={UPLOAD_FILE_STREAM}>
          {(generalImageUpload, { data, loading }) => {
            console.log(data)
            return (<form onSubmit={fileUpload} encType={'multipart/form-data'}>
          <input name={'document'} type={'file'} onChange={({target: { files }}) => {
            const file = files[0]
            console.log(file)
            file && generalImageUpload({ variables: { file: file } })
          }}/>
              {loading && <p>Loading.....</p>}
          </form>)
          }
          }
        </Mutation>
      </header>
        </ApolloProvider>
    </div>
  );
}

export default App;
