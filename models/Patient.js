module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    patientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    patientPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    patientEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Patient.associate = (models) => {
    Patient.belongsTo(models.Account, {
      foreignKey: 'accountId',
      as: 'account',
    });
    Patient.hasMany(models.Booking, {
      foreignKey: 'patientId',
      as: 'bookings',
      onDelete: 'CASCADE',
    });
  };

  return Patient;
};
