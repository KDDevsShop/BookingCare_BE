module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define('Schedule', {
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  });

  Schedule.associate = (models) => {
    Schedule.hasMany(models.DoctorSchedule, {
      foreignKey: 'scheduleId',
      as: 'doctorSchedules',
      onDelete: 'CASCADE',
    });
  };

  return Schedule;
};
