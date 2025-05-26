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

  DoctorPaymentMethod.associate = (models) => {
    DoctorPaymentMethod.belongsTo(models.Doctor, {
      foreignKey: 'doctorId',
      as: 'doctor',
      onDelete: 'CASCADE',
    });
    DoctorPaymentMethod.belongsTo(models.PaymentMethod, {
      foreignKey: 'paymentMethodId',
      as: 'paymentMethod',
      onDelete: 'CASCADE',
    });
  };

  return DoctorPaymentMethod;
};
