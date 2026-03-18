import convict from 'convict';
import fs from 'fs';
import dotenv from 'dotenv';

// to load .env file
dotenv.config();
convict.addFormat(require('convict-format-with-validator').ipaddress);

const conf = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  ip: {
    doc: 'The ip address to bind.',
    format: 'ipaddress',
    default: '127.0.0.1',
    env: 'IP_ADDRESS',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 4000,
    env: 'PORT',
  },
  mongodb: {
    doc: 'URL to mongodb.',
    format: String,
    default:
      '',
    env: 'MONGODB',
  },
  s3: {
    bucket: {
      doc: 'S3 Bucket name.',
      format: String,
      default: 'luxurylimoland',
    },
    key: {
      doc: 'S3 AWS_ACCESS_KEY_ID.',
      format: String,
      default: '',
    },
    secret: {
      doc: 'S3 AWS_SECRET_ACCESS_KEY.',
      format: String,
      default: '',
    },
    region: {
      doc: 'S3 Region.',
      format: String,
      default: 'us-west-2',
    },
  },
  jwtSecret: {
    doc: 'JWT secret.',
    format: String,
    default: 'hellmynameisnasim',
    env: 'JWTSECRET',
  },
  plivo: {
    authId: {
      doc: 'Plivo AuthId',
      format: String,
      default: '',
    },
    authToken: {
      doc: 'Plivo AuthToken',
      format: String,
      default: '',
    },
  },
});

const env = conf.get('env');
try {
  const path = `${__dirname}/${env}.json`;

  console.log('trying to access %s', path);
  fs.accessSync(path, fs.F_OK);

  conf.loadFile(path);
} catch (error) {
  console.log("file doesn't exist, loading defaults");
}

conf.validate({ allowed: 'strict' });

export default conf;
