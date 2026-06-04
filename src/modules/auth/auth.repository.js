const { prisma } = require("../../config/database");

async function findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
}

async function createUser(data) {
    return prisma.user.create({ data });
}

module.exports = {
    findUserByEmail,
    createUser,
};
