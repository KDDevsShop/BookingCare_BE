module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    prescriptionImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  Prescription.associate = (models) => {
    Prescription.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
      onDelete: 'CASCADE',
      unique: true,
    });
  };

  return Prescription;
};
