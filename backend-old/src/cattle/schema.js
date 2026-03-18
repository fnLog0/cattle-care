import { gql } from 'apollo-server';

const typeDefs = gql`
  enum Breed {
    zebu
    crossBreed
    murrah
  }

  type Observation {
    _id: ID
    obsTempRate: Float
    obsRespRate: Float
    strainIndex: Float
    createdAt: String
  }

  type Cattle {
    id: ID # "!" denotes a required field
    name: String
    age: Int
    weight: Float
    latestObservation: Observation
    observation: [Observation]
    category: Breed
    user: String
    createdAt: String
  }

  type Risks {
    highRisk: [Cattle]
    mildRisk: [Cattle]
    goodHealth: [Cattle]
  }

  input CattleInput {
    name: String!
    age: Int!
    category: Breed!
    weight: Float!
  }

  input ObservationInput {
    obsTempRate: Float!
    obsRespRate: Float!
  }

  # This type specifies the entry points into our API. In this case
  # there is only one - "me" - which returns a current user.
  type Query {
    allCattle: [Cattle] # returns a current user
    singleCattle(id: ID!): Cattle
    searchCattle(query: String): [Cattle]
    getRisks: Risks
  }

  # The mutation root type, used to define all mutations.
  type Mutation {
    addCattle(input: CattleInput!): Cattle
    updateCattle(id: ID!, input: CattleInput!): Cattle
    deleteCattle(id: ID!): Cattle
    addObservation(id: ID!, input: ObservationInput): Cattle
  }
`;

export default typeDefs;
