module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userGender: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    userDoB: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAvatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpire: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    accountStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'doctor', 'patient'),
      defaultValue: 'patient',
      allowNull: false,
    },
  });

  Account.associate = (models) => {
    Account.hasOne(models.Patient, {
      foreignKey: 'accountId',
      as: 'patient',
    });
    Account.hasOne(models.Doctor, {
      foreignKey: 'accountId',
      as: 'doctor',
    });
  };

  return Account;
};
