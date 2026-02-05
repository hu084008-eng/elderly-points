const bcrypt = require('bcryptjs');
const { User, Institution, sequelize } = require('./models');

const initData = async () => {
  try {
    console.log('开始初始化数据...');

    // 检查是否已有用户
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('数据库已有数据，跳过初始化');
      return;
    }

    // 创建默认院点
    const institution = await Institution.create({
      name: '莲花镇养老院',
      address: '莲花镇中心街1号',
      contact_person: '张院长',
      contact_phone: '13800138001',
      status: 1
    });
    console.log('创建默认院点:', institution.name);

    // 创建超级管理员
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      password_hash: adminPassword,
      real_name: '系统管理员',
      role: 'super_admin',
      status: 1
    });
    console.log('创建管理员:', admin.username);

    // 创建测试院长
    const directorPassword = await bcrypt.hash('123456', 10);
    const director = await User.create({
      username: 'director_lh',
      password_hash: directorPassword,
      real_name: '李院长',
      role: 'director',
      institution_id: institution.id,
      status: 1
    });
    console.log('创建院长:', director.username);

    // 更新院点的院长
    institution.director_id = director.id;
    await institution.save();

    console.log('数据初始化完成！');
    console.log('默认账号:');
    console.log('  管理员: admin / admin123');
    console.log('  院长: director_lh / 123456');
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
};

module.exports = initData;
