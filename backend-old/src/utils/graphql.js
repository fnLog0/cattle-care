import mongoose from 'mongoose-fill';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import UsersSchema from '../users/schema';
import UsersResolvers from '../users/resolvers';
import CattleSchema from '../cattle/schema';
import CattleResolvers from '../cattle/resolvers';

// fix graphql mongodb ID issue
const { ObjectId } = mongoose.Types;
ObjectId.prototype.valueOf = function () {
  return this.toString();
};

export const typeDefs = mergeTypeDefs([UsersSchema, CattleSchema]);
export const resolvers = mergeResolvers([UsersResolvers, CattleResolvers]);
