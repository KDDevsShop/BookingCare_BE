module.exports = (sequelize, DataTypes) => {
  const DoctorPaymentMethod = sequelize.define(
    'DoctorPaymentMethod',
    {
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Doctors',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      paymentMethodId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'PaymentMethods',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      timestamps: false,
      tableName: 'DoctorPaymentMethod',
    }
  );

  return DoctorPaymentMethod;
};
