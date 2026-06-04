const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');
const env = require('./env');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

async function connectMongo() {
  await mongoose.connect(env.mongoUrl);
  logger.info('MongoDB connected');
}

async function connectPrisma() {
  await prisma.$connect();
  logger.info('MySQL (Prisma) connected');
}

module.exports = {
  prisma,
  connectMongo,
  connectPrisma
};
