module.exports = (sequelize, DataTypes) => {
  const DoctorSchedule = sequelize.define('DoctorSchedule', {
    workDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: 'doctor_schedule_unique', // Unique per doctor
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
