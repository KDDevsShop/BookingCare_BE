module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define('Doctor', {
    doctorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    doctorSortDesc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    doctorDetailDesc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    examinationPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });

  Doctor.associate = (models) => {
    Doctor.belongsTo(models.Account, {
      foreignKey: 'accountId',
      as: 'account',
      onDelete: 'CASCADE',
    });
    Doctor.belongsTo(models.Specialty, {
      foreignKey: 'specialtyId',
      as: 'specialty',
      onDelete: 'SET NULL',
    });
    Doctor.belongsToMany(models.PaymentMethod, {
      through: 'DoctorPaymentMethod',
      foreignKey: 'doctorId',
      otherKey: 'paymentMethodId',
      as: 'paymentMethods',
    });
    Doctor.hasMany(models.Booking, {
      foreignKey: 'doctorId',
      as: 'bookings',
      onDelete: 'CASCADE',
    });
    Doctor.hasMany(models.DoctorSchedule, {
      foreignKey: 'doctorId',
      as: 'doctorSchedules',
      onDelete: 'CASCADE',
    });
  };

  return Doctor;
};
