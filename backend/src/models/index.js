const sequelize = require('../config/database');
const User = require('./User');
const Institution = require('./Institution');
const Helper = require('./Helper');
const Elderly = require('./Elderly');
const Activity = require('./Activity');
const Product = require('./Product');
const PointsTransaction = require('./PointsTransaction');
const Exchange = require('./Exchange');
const SystemLog = require('./SystemLog');
const ServiceRule = require('./ServiceRule');

// 定义关联关系
Institution.hasMany(Helper, { foreignKey: 'institution_id' });
Helper.belongsTo(Institution, { foreignKey: 'institution_id' });

Institution.hasMany(Elderly, { foreignKey: 'institution_id' });
Elderly.belongsTo(Institution, { foreignKey: 'institution_id' });

Institution.hasMany(PointsTransaction, { foreignKey: 'institution_id' });
PointsTransaction.belongsTo(Institution, { foreignKey: 'institution_id' });

Activity.hasMany(PointsTransaction, { foreignKey: 'activity_id' });
PointsTransaction.belongsTo(Activity, { foreignKey: 'activity_id' });

Product.hasMany(Exchange, { foreignKey: 'product_id' });
Exchange.belongsTo(Product, { foreignKey: 'product_id' });

// 院点和院长账号的关联
Institution.belongsTo(User, { foreignKey: 'director_id', as: 'director' });
User.belongsTo(Institution, { foreignKey: 'institution_id', as: 'institution' });

module.exports = {
  sequelize,
  User,
  Institution,
  Helper,
  Elderly,
  Activity,
  Product,
  PointsTransaction,
  Exchange,
  SystemLog,
  ServiceRule
};
