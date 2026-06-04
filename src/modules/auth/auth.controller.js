const asyncHandler = require("../../utils/asyncHandler");
const { ok } = require("../../utils/response");
const authService = require("./auth.service");

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.validated.body;
    const data = await authService.login(email, password);
    return ok(res, data, "Login success");
});

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.validated.body;
    const data = await authService.register({ name, email, password });
    return ok(res, data, "Register success");
});

module.exports = {
    login,
    register,
};
