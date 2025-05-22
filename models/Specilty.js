module.exports = (sequelize, DataTypes) => {
  const Specialty = sequelize.define('Specialty', {
    speciltyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialtyImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specialtyDesc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Specialty.associate = (models) => {
    Specialty.hasMany(models.Doctor, {
      foreignKey: 'specialtyId',
      as: 'doctors',
    });
  };

  return Specialty;
};
