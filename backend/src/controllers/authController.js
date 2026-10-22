const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user, expiresAt } = await authService.login(email, password);
    res.status(200).json({ token, user, expires_at: expiresAt });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const { user, expiresAt } = await authService.getSession(req.authToken);
    res.status(200).json({ user, expires_at: expiresAt });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.authToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me, logout };
