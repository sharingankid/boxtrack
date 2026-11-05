const memberService = require('../services/memberService');

async function register(req, res, next) {
  try {
    const { token, member, expiresAt } = await memberService.register(req.body);
    res.status(201).json({ token, member, expires_at: expiresAt });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, member, expiresAt } = await memberService.login(email, password);
    res.status(200).json({ token, member, expires_at: expiresAt });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await memberService.logout(req.authToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  res.status(200).json({ member: req.member, expires_at: req.memberExpiresAt });
}

async function listScores(req, res, next) {
  try {
    res.status(200).json({ scores: await memberService.listScores(req.member.id) });
  } catch (err) {
    next(err);
  }
}

async function submitScore(req, res, next) {
  try {
    res.status(201).json(await memberService.submitScore(req.member.id, req.body));
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, listScores, submitScore };
