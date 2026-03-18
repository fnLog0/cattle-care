import mongoose from 'mongoose-fill';

mongoose.Promise = global.Promise;

const ObservationSchema = new mongoose.Schema({
  id: String,
  obsTempRate: Number,
  obsRespRate: Number,
  strainIndex: Number,
  createdAt: String,
});

const CattleSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    weight: Number,
    latestObservation: ObservationSchema,
    observation: [ObservationSchema],
    category: String,
    user: mongoose.Schema.Types.ObjectId,
  },
  {
    strict: false,
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export default mongoose.model('Cattle', CattleSchema);
