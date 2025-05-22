module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    bookingStartTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    bookingEndTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    bookingReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bookingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient',
      onDelete: 'CASCADE',
    });
    Booking.belongsTo(models.Doctor, {
      foreignKey: 'doctorId',
      as: 'doctor',
      onDelete: 'CASCADE',
    });
    Booking.hasOne(models.Prescription, {
      foreignKey: 'bookingId',
      as: 'prescription',
      onDelete: 'CASCADE',
    });
  };

  return Booking;
};
