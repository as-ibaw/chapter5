import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import fs from 'fs';
import { GraphQLScalarType, Kind } from 'graphql';

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    console.log(`Parsed Valually : ${value}`);
    return new Date(value);
  },
  parseLiteral(ast) {
    console.log(`Parsed Literally : ${ast}`);
    return ast.kind == Kind.STRING ? new Date(ast.value) : undefined;
  },
});

let aboutMessage = 'Issue Tracker API v1.0';

const issuesDB = [
  {
    id: 1,
    status: 'New',
    owner: 'Ravan',
    effort: 5,
    created: new Date('2023-11-28'),
    due: undefined,
    title: 'Error in console when clicking Add',
  },
  {
    id: 2,
    status: 'Assigned',
    owner: 'Eddie',
    effort: 14,
    created: new Date('2023-11-16'),
    due: new Date('2023-11-17'),
    title: 'Missing bottom border on panel',
  },
];

const resolvers = {
  Query: {
    about: () => aboutMessage,
    issueList,
  },
  Mutation: {
    setAboutMessage,
    issueAdd,
  },
};

function issueAdd(_, { issue }) {
  issue.created = new Date();
  issue.id = issuesDB.length + 1;
  if (issue.status == undefined) issue.status = 'New';
  issuesDB.push(issue);
  return issue;
}

function setAboutMessage(_, { message }) {
  return (aboutMessage = message);
}

function issueList() {
  return issuesDB;
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./schema.graphql', 'utf-8'),
  resolvers,
});

const app = express();

app.use(express.static('public'));
server.applyMiddleware({ app, path: '/graphql' });

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
