const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Config = sequelize.define('Config', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      defaultValue: 'string',
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'configs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['key'] },
      { fields: ['is_public'] },
    ],
  });

  // 实例方法：获取解析后的值
  Config.prototype.getParsedValue = function() {
    if (!this.value) return null;
    
    switch (this.type) {
      case 'number':
        return parseFloat(this.value);
      case 'boolean':
        return this.value === 'true';
      case 'json':
        try {
          return JSON.parse(this.value);
        } catch (e) {
          return null;
        }
      default:
        return this.value;
    }
  };

  return Config;
};
