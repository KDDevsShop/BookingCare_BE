module.exports = (sequelize, DataTypes) => {
  const DoctorSchedule = sequelize.define('DoctorSchedule', {
    workDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    currentPatients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  DoctorSchedule.associate = (models) => {
    DoctorSchedule.belongsTo(models.Doctor, {
      foreignKey: 'doctorId',
      as: 'doctor',
      onDelete: 'CASCADE',
    });
    DoctorSchedule.belongsTo(models.Schedule, {
      foreignKey: 'scheduleId',
      as: 'schedule',
      onDelete: 'CASCADE',
    });
  };

  return DoctorSchedule;
};
