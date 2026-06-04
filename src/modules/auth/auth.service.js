const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");
const authRepository = require("./auth.repository");

async function login(email, password) {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign(
        {
            sub: user.id,
            email: user.email,
            name: user.name,
        },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn },
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };
}

async function register({ name, email, password }) {
    const existing = await authRepository.findUserByEmail(email);

    if (existing) {
        throw new ApiError(400, "Email already in use");
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await authRepository.createUser({
        name,
        email,
        password: hashed,
    });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };
}

module.exports = {
    login,
    register,
};
