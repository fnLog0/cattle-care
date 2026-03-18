/* eslint-disable no-underscore-dangle */
import { toString } from 'lodash';
import Cattle from './database';
import { strainIndexCalculator } from '../utils/formula';

export default {
  Query: {
    allCattle: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      const allCattle = await Cattle.find({ user: ctx.user.id }).sort({
        'latestObservation.strainIndex': -1,
      });
      return allCattle;
    },

    singleCattle: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      try {
        const cattle = await Cattle.findOne({
          _id: args.id,
        });
        return cattle;
      } catch (err) {
        return null;
      }
    },
    searchCattle: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      try {
        const cattle = await Cattle.find({
          user: ctx.user.id,
          name: { $regex: args.query, $options: 'i' },
        });
        return args.query.length !== 0 ? cattle : [];
      } catch (err) {
        throw new Error(err);
      }
    },
    getRisks: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      try {
        const highRisk = await Cattle.find({
          user: ctx.user.id,
          'latestObservation.strainIndex': { $gte: 7, $lt: 11 },
        });

        const mildRisk = await Cattle.find({
          user: ctx.user.id,
          'latestObservation.strainIndex': { $gte: 4, $lt: 8 },
        });
        const goodHealth = await Cattle.find({
          user: ctx.user.id,
          'latestObservation.strainIndex': { $gte: 2, $lt: 6 },
        });
        return {
          highRisk: highRisk.map((item) => ({ id: item._id, ...item })),
          mildRisk,
          goodHealth,
        };
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    addCattle: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      const { name, age, category, weight } = args.input;
      const data = {
        name,
        age,
        category,
        weight,
        user: ctx.user.id,
      };
      const cattle = new Cattle(data);
      await cattle.save();

      return cattle;
    },
    updateCattle: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { name, age, description, category } = args.input;
      const objFind = { _id: args.id };
      const objUpdate = {
        name,
        age,
        description,
        category,
      };
      await Cattle.updateOne(objFind, objUpdate);
      const cattle = Cattle.findOne(objFind);
      return cattle;
    },
    deleteCattle: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      const objectId = { _id: args.id };
      const cattle = await Cattle.findOne(objectId);
      await Cattle.deleteOne(objectId);
      return cattle;
    },
    addObservation: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      const { obsTempRate, obsRespRate } = args.input;
      const cattle = await Cattle.findOne({ _id: args.id });

      const strainIndex = await strainIndexCalculator(
        parseFloat(obsTempRate),
        parseFloat(obsRespRate),
        cattle.category,
      );
      const observation = {
        obsTempRate,
        obsRespRate,
        strainIndex: toString(strainIndex),
        createdAt: new Date(),
      };
      const objFind = { _id: args.id };

      await Cattle.updateOne(objFind, {
        latestObservation: observation,
        $addToSet: { observation },
      });
      const updatedCattle = await Cattle.findOne(objFind);

      return updatedCattle;
    },
  },
};
