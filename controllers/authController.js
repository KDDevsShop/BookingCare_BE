const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Account, Patient, Doctor } = require('../models');
require('dotenv').config();

const signup = async (req, res) => {
  try {
    const {
      username,
      password,
      userGender,
      userDoB,
      userAddress,
      userAvatar,
      isAdmin,
    } = req.body;
    const existingAccount = await Account.findOne({ where: { username } });
    if (existingAccount) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await Account.create({
      username,
      password: hashedPassword,
      userGender,
      userDoB,
      userAddress,
      userAvatar,
      isAdmin: isAdmin || false,
    });
    return res
      .status(201)
      .json({ message: 'Account created successfully', account });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Signup failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const account = await Account.findOne({ where: { username } });
    if (!account) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { id: account.id, isAdmin: account.isAdmin },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );
    return res
      .status(200)
      .json({ message: 'Login successful', token, account });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Login failed', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const account = await Account.findOne({ where: { username } });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    await account.save();
    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Password reset failed', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  resetPassword,
};
