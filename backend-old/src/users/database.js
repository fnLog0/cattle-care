import mongoose from 'mongoose-fill';
import bcrypt from 'bcryptjs';

mongoose.Promise = global.Promise;

const ProfileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
  },
  image: {
    type: String,
  },
});

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      index: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 4,
      trim: true,
    },
    telephone: {
      type: String,
      index: true,
      minlength: 8,
      trim: true,
    },
    telephoneOtp: { type: String },
    profile: ProfileSchema,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'notActive', 'banned'],
    },
  },
  {
    strict: false,
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        // eslint-disable-next-line no-param-reassign
        delete ret.password;
      },
    },
  },
);

UserSchema.pre('save', async function(done) { // eslint-disable-line
  // only hash the password if it has been modified (or is new)
  if (this.isNew && this.isModified('password')) {
    try {
      const salt = await bcrypt.genSaltSync(10);
      const hash = await bcrypt.hashSync(this.password, salt);
      this.password = hash;
    } catch (err) {
      console.log(err);
    }
  }

  return done();
});

UserSchema.methods.comparePassword = async function (candidatePassword) { // eslint-disable-line
  const result = await bcrypt.compareSync(candidatePassword, this.password);
  return result;
};

export default mongoose.model('User', UserSchema);
