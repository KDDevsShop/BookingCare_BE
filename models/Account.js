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
    accountStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  });

  Account.associate = (models) => {
    Account.hasOne(models.Patient, {
      foreignKey: 'accountId',
      as: 'patient',
    });
  };

  return Account;
};
