const bcrypt = require('bcryptjs');
const { User, Institution, Helper, Elderly, Activity, Product, ServiceRule } = require('./models');

const initData = async () => {
  try {
    console.log('开始初始化数据...');

    // 检查是否已有院点
    const institutionCount = await Institution.count();
    if (institutionCount > 0) {
      console.log('数据库已有院点数据，跳过初始化');
      return;
    }

    // 创建超级管理员
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password_hash: adminPassword,
      name: '系统管理员',
      role: 'super_admin'
    });
    console.log('创建超级管理员: admin');

    // 定义三个院点的数据
    const institutionsData = [
      {
        name: '李河院',
        username: 'lihe_yz',
        password: '123456',
        address: '李河村养老服务中心',
        contact_person: '李院长',
        contact_phone: '13800138001',
        helpers: [
          { name: '邬时中', total_points: 0 },
          { name: '魏文举', total_points: 0 },
          { name: '文启利', total_points: 0 },
          { name: '蒋孝生', total_points: 0 },
          { name: '李国庆', total_points: 0 },
          { name: '赖理秀', total_points: 0 },
          { name: '谭其秋', total_points: 0 }
        ],
        elderly: [
          { name: '李文琼', total_points: 0 },
          { name: '周富才', total_points: 0 },
          { name: '余元秀', total_points: 0 },
          { name: '何光华', total_points: 0 },
          { name: '何之玉', total_points: 0 },
          { name: '余真玉', total_points: 0 }
        ]
      },
      {
        name: '武陵院',
        username: 'wuling_yz',
        password: '123456',
        address: '武陵村养老服务中心',
        contact_person: '武院长',
        contact_phone: '13800138002',
        helpers: [
          { name: '万良忠', total_points: 0 },
          { name: '牟方田', total_points: 0 },
          { name: '廖荣华', total_points: 0 },
          { name: '廖祥富', total_points: 0 },
          { name: '李方贵', total_points: 0 },
          { name: '应茂祥', total_points: 0 }
        ],
        elderly: [
          { name: '万加碧', total_points: 0 },
          { name: '毛开元', total_points: 0 },
          { name: '陈之忠', total_points: 0 },
          { name: '梁定金', total_points: 0 },
          { name: '罗大前', total_points: 0 },
          { name: '万世才', total_points: 0 }
        ]
      },
      {
        name: '甘宁院',
        username: 'ganning_yz',
        password: '123456',
        address: '甘宁村养老服务中心',
        contact_person: '甘院长',
        contact_phone: '13800138003',
        helpers: [
          { name: '万启兰', total_points: 0 },
          { name: '何光亮', total_points: 0 },
          { name: '罗洪友', total_points: 0 },
          { name: '李世秀', total_points: 0 },
          { name: '万德莲', total_points: 0 },
          { name: '魏文兴', total_points: 0 }
        ],
        elderly: [
          { name: '王远富', total_points: 0 },
          { name: '何之全', total_points: 0 },
          { name: '万福江', total_points: 0 },
          { name: '刘富瑶', total_points: 0 },
          { name: '熊学林', total_points: 0 },
          { name: '熊德礼', total_points: 0 }
        ]
      }
    ];

    // 创建院点、院长、护工、老人
    for (const data of institutionsData) {
      // 创建院点
      const institution = await Institution.create({
        name: data.name,
        address: data.address,
        contact_person: data.contact_person,
        contact_phone: data.contact_phone,
        status: 1
      });
      console.log(`创建院点: ${data.name}`);

      // 创建院长账号
      const directorPassword = await bcrypt.hash(data.password, 10);
      const director = await User.create({
        username: data.username,
        password_hash: directorPassword,
        name: data.contact_person,
        role: 'director',
        institution_id: institution.id
      });
      console.log(`创建院长: ${data.username}`);

      // 更新院点的院长ID
      institution.director_id = director.id;
      await institution.save();

      // 创建护工
      for (const helperData of data.helpers) {
        await Helper.create({
          name: helperData.name,
          institution_id: institution.id,
          total_points: helperData.total_points
        });
      }
      console.log(`创建护工: ${data.helpers.length}人`);

      // 创建老人
      for (const elderlyData of data.elderly) {
        await Elderly.create({
          name: elderlyData.name,
          institution_id: institution.id,
          total_points: elderlyData.total_points
        });
      }
      console.log(`创建老人: ${data.elderly.length}人`);
    }

    // 创建默认文娱活动（每小时积分标准）
    const activities = [
      { name: '舞蹈表演', points_per_hour: 2, status: 1 },
      { name: '歌唱表演', points_per_hour: 2, status: 1 },
      { name: '乐器演奏', points_per_hour: 3, status: 1 },
      { name: '戏曲表演', points_per_hour: 3, status: 1 },
      { name: '魔术表演', points_per_hour: 2, status: 1 },
      { name: '书法展示', points_per_hour: 2, status: 1 }
    ];

    for (const act of activities) {
      await Activity.create(act);
    }
    console.log('创建文娱活动:', activities.length);

    // 创建默认商品
    const products = [
      { name: '洗衣粉', category: '清洁用品', points_price: 10, stock_quantity: 50, unit: '袋', status: 1 },
      { name: '洗洁精', category: '清洁用品', points_price: 8, stock_quantity: 40, unit: '瓶', status: 1 },
      { name: '香皂', category: '清洁用品', points_price: 5, stock_quantity: 100, unit: '块', status: 1 },
      { name: '面条', category: '食品', points_price: 6, stock_quantity: 80, unit: '把', status: 1 },
      { name: '食用油', category: '食品', points_price: 25, stock_quantity: 30, unit: '瓶', status: 1 },
      { name: '大米', category: '食品', points_price: 30, stock_quantity: 50, unit: '袋', status: 1 },
      { name: '毛巾', category: '日用品', points_price: 8, stock_quantity: 60, unit: '条', status: 1 },
      { name: '牙膏', category: '日用品', points_price: 6, stock_quantity: 70, unit: '支', status: 1 },
      { name: '雨伞', category: '日用品', points_price: 15, stock_quantity: 25, unit: '把', status: 1 }
    ];

    for (const prod of products) {
      await Product.create(prod);
    }
    console.log('创建商品:', products.length);

    // 创建服务积分规则（统一使用每小时积分）
    const serviceRules = [
      { 
        code: 'dao_yuan', 
        name: '到院互助服务', 
        points_per_hour: 1,
        description: '邻里互助员到敬老院/养老服务中心为院内老人提供互助服务',
        status: 1 
      },
      { 
        code: 'shang_men', 
        name: '上门互助服务', 
        points_per_hour: 1,
        description: '邻里互助员为村/社区独居、失能老人提供上门互助服务',
        status: 1 
      },
      { 
        code: 'yuan_nei', 
        name: '院内互助服务', 
        points_per_hour: 1,
        description: '院内低龄老人服务高龄老人，健康老人服务失能老人',
        status: 1 
      },
      { 
        code: 'sheng_chan', 
        name: '生产劳动', 
        points_per_hour: 1,
        description: '参加生产劳动获得积分',
        status: 1 
      }
    ];

    for (const rule of serviceRules) {
      await ServiceRule.create(rule);
    }
    console.log('创建服务积分规则:', serviceRules.length);

    console.log('数据初始化完成！');
    console.log('');
    console.log('默认账号:');
    console.log('  超级管理员: admin / admin123');
    console.log('  李河院院长: lihe_yz / 123456');
    console.log('  武陵院院长: wuling_yz / 123456');
    console.log('  甘宁院院长: ganning_yz / 123456');
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
};

module.exports = initData;
