import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/auth';
import User from './database';
// import { sendOtp, resendOtp, verifyOtp } from '../utils/msg91';

export default {
  Query: {
    me: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      return User.findOne({ _id: ctx.user.id });
    },
  },
  Mutation: {
    register: async (root, args) => {
      const { email, password, firstName, lastName } = args.input;
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        throw new Error('E-mail already registered.');
      }

      const data = {
        email,
        password,
        profile: { firstName, lastName },
      };

      user = new User(data);
      await user.save();

      const token = generateToken(user);
      return { user, jwt: token };
    },

    login: async (root, args) => {
      const user = await User.findOne({ email: args.input.email });

      if (!user) {
        throw new Error('Invalid username or password.');
      }
      const isPasswordValid = await user.comparePassword(args.input.password);
      if (!isPasswordValid) {
        throw new Error('Invalid username or password.');
      }

      const token = generateToken(user);
      return { user, jwt: token };
    },

    sendTelephoneOtp: async () => {},

    telephoneLogin: async () => {},

    changePassword: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      const user = await User.findOne({ _id: ctx.user.id });
      const isPasswordValid = await user.comparePassword(
        args.input.currentPassword,
      );

      if (!isPasswordValid) {
        throw new Error('Please enter valid current password.');
      }

      const salt = await bcrypt.genSaltSync(10);
      const hash = await bcrypt.hashSync(args.input.newPassword, salt);

      const data = {
        email: user.email,
        password: hash,
      };

      const userSave = await User.updateOne({ _id: ctx.user.id }, data);
      const token = generateToken(userSave);
      return { user, jwt: token };
    },

    updateMe: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const objFind = { _id: ctx.user.id };

      const objUpdate = {};

      if (args.input.firstName) {
        objUpdate['profile.firstName'] = args.input.firstName;
      }
      if (args.input.lastName) {
        objUpdate['profile.lastName'] = args.input.lastName;
      }
      if (args.input.image) {
        objUpdate.image = args.input.image;
      }

      await User.updateOne(objFind, objUpdate);

      return User.findOne({ _id: ctx.user.id });
    },
  },
};
