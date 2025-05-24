const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Account, Patient, Doctor } = require('../models');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const signup = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      userDoB,
      userGender,
      userAddress = '',
      accountStatus = true,
      isAdmin = false,
    } = req.body;
    const existingAccount = await Account.findOne({ where: { username } });

    if (
      !username ||
      !password ||
      !email ||
      !userDoB ||
      userGender === undefined
    ) {
      console.log(req.body);
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (existingAccount) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await Account.create({
      username,
      password: hashedPassword,
      email,
      userGender,
      userDoB,
      userAddress,
      accountStatus,
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
    if (account.accountStatus === false) {
      return res.status(403).json({
        message: 'This account has been blocked. Please contact support.',
      });
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
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const account = await Account.findOne({
      where: { email, resetToken: token },
    });
    if (!account) {
      return res
        .status(404)
        .json({ message: 'Invalid or expired reset token' });
    }
    if (!account.resetTokenExpire || account.resetTokenExpire < Date.now()) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    account.resetToken = null;
    account.resetTokenExpire = null;
    await account.save();
    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Password reset failed', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    // Find account by email (assuming Account has an email field)
    const account = await Account.findOne({ where: { email } });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = Date.now() + 1000 * 60 * 60; // 1 hour
    // Save token and expiry to account (add fields if needed)
    account.resetToken = resetToken;
    account.resetTokenExpire = resetTokenExpire;
    await account.save();
    // Send email
    const resetUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:5173'
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Cập nhật lại mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px #f0f0f0; padding: 32px 24px; background: #fff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src='https://cdn-icons-png.flaticon.com/512/3064/3064197.png' alt='Reset Password' width='64' height='64' style='margin-bottom: 12px;' />
            <h2 style="color: #1976d2; margin: 0 0 8px 0;">Cập nhật lại mật khẩu</h2>
          </div>
          <p style="font-size: 16px; color: #333; margin-bottom: 24px;">Xin chào, <br>Chúng tôi đã nhận được yêu cầu thay đổi mật khẩu. Vui lòng nhấn vào nút dưới đây để thay đổi. Liên kết này sẽ hết hạn trong vòng 1 giờ.</p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: #1976d2; color: #fff; border-radius: 4px; text-decoration: none; font-size: 16px; font-weight: bold;">Thay đổi mật khẩu</a>
          </div>
          <p style="font-size: 14px; color: #888; margin-bottom: 0;">Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này. Mật khẩu cũ của bạn vẫn sẽ không thay đổi.</p>
          <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;" />
          <div style="font-size: 12px; color: #bbb; text-align: center;">&copy; ${new Date().getFullYear()} Thu Cúc. All rights reserved.</div>
        </div>
      `,
    });
    return res.status(200).json({ message: 'Reset password email sent' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Forgot password failed', error: error.message });
  }
};

const blockAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findByPk(id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    account.accountStatus = false;
    await account.save();
    return res
      .status(200)
      .json({ message: 'Account has been blocked', account });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Block account failed', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  resetPassword,
  forgotPassword,
  blockAccount,
};
