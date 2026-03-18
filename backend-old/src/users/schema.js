import { gql } from 'apollo-server';

const typeDefs = gql`
  enum UserStatus {
    active
    notActive
    banned
  }

  type SuccessResponse {
    success: Boolean
  }

  type Profile {
    firstName: String
    lastName: String
    image: String
  }

  type User {
    id: ID! # "!" denotes a required field
    email: String
    telephone: String
    profile: Profile
    status: UserStatus
    emailVerified: Boolean
  }

  type JwtUser {
    jwt: String
    user: User
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String
    lastName: String
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    image: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input TelephoneOtpInput {
    telephone: String!
    resend: Boolean
  }

  input TelephoneLoginInput {
    telephone: String!
    otp: Int!
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  # This type specifies the entry points into our API. In this case
  # there is only one - "me" - which returns a current user.
  type Query {
    me: User # returns a current user
  }

  # The mutation root type, used to define all mutations.
  type Mutation {
    register(input: RegisterInput): JwtUser
    login(input: LoginInput): JwtUser
    updateMe(input: UpdateUserInput): User
    sendTelephoneOtp(input: TelephoneOtpInput): SuccessResponse
    telephoneLogin(input: TelephoneLoginInput): JwtUser
    changePassword(input: ChangePasswordInput): JwtUser
  }
`;

export default typeDefs;
