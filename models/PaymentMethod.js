module.exports = (sequelize, DataTypes) => {
  const PaymentMethod = sequelize.define('PaymentMethod', {
    paymentMethodName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  PaymentMethod.associate = (models) => {
    PaymentMethod.belongsToMany(models.Doctor, {
      through: 'DoctorPaymentMethod',
      foreignKey: 'paymentMethodId',
      otherKey: 'doctorId',
      as: 'doctors',
    });
  };

  return PaymentMethod;
};
