-- 初始化数据库
CREATE DATABASE IF NOT EXISTS elderly_care DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elderly_care;

-- 1. 账号表（仅管理员和院长可登录）
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '登录账号',
    password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt加密密码',
    role ENUM('admin','director') NOT NULL COMMENT '角色',
    name VARCHAR(50) COMMENT '姓名',
    phone VARCHAR(20),
    institution_id INT COMMENT '院长绑定院点ID，管理员为NULL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账号表';

-- 2. 院点表
CREATE TABLE institutions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '院点名称（李河/武陵/甘宁）',
    address VARCHAR(200),
    director_id INT COMMENT '关联院长user_id',
    status TINYINT DEFAULT 1 COMMENT '1启用 0停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='院点表';

-- 3. 护工表（极简，无账号）
CREATE TABLE helpers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL COMMENT '所属院',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    total_points INT DEFAULT 0 COMMENT '当前积分余额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='护工表';

-- 4. 老人表（极简，无账号）
CREATE TABLE elderly (
    id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL COMMENT '所属院',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    total_points INT DEFAULT 0 COMMENT '当前积分余额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='老人表';

-- 5. 文娱活动类型表（动态计分配置）
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '活动名称（如舞蹈表演）',
    points_per_hour INT NOT NULL COMMENT '每小时积分（如2）',
    status TINYINT DEFAULT 1 COMMENT '1启用 0停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文娱活动类型表';

-- 6. 商品表（积分超市）
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '商品名称',
    category ENUM('清洁用品','食品','日用品','其他') DEFAULT '日用品',
    points_price INT NOT NULL COMMENT '兑换所需积分',
    stock_quantity INT DEFAULT 0 COMMENT '库存数量',
    unit VARCHAR(20) COMMENT '单位（瓶/袋/提/个）',
    status TINYINT DEFAULT 1 COMMENT '1上架 0下架',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 7. 积分流水表（所有积分变动记录）
CREATE TABLE points_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL COMMENT '所属院（冗余，方便查询）',
    target_type ENUM('helper','elderly') NOT NULL COMMENT '对象类型',
    target_id INT NOT NULL COMMENT '护工ID或老人ID',
    target_name VARCHAR(50) COMMENT '姓名冗余',
    type ENUM('earn','spend') NOT NULL COMMENT '赚取/消费',
    amount INT NOT NULL COMMENT '积分值（earn为正，spend为负）',
    service_category VARCHAR(50) COMMENT '到院互助/上门互助/院内互助/生产劳动/文娱活动/商品兑换',
    service_duration VARCHAR(20) COMMENT '服务时长（固定分值类：<2小时/≥2小时；文娱活动：小时数如1.5）',
    calculation_type ENUM('fixed','dynamic') COMMENT '计分方式：fixed固定分值/dynamic动态计算',
    activity_id INT COMMENT '关联activities表（文娱活动时）',
    activity_name VARCHAR(100) COMMENT '活动名称冗余',
    points_per_hour INT COMMENT '每小时积分冗余（文娱活动时）',
    description TEXT COMMENT '备注',
    image_url VARCHAR(500) COMMENT '服务照片URL（发放时必填）',
    operator_id INT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名冗余',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分流水表';

-- 8. 兑换记录表（商品兑换台账）
CREATE TABLE exchanges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL,
    target_type ENUM('helper','elderly') NOT NULL,
    target_id INT NOT NULL,
    target_name VARCHAR(50),
    product_id INT NOT NULL,
    product_name VARCHAR(100) COMMENT '商品名冗余',
    quantity INT NOT NULL COMMENT '数量',
    unit VARCHAR(20) COMMENT '单位冗余',
    total_points INT NOT NULL COMMENT '消耗总积分',
    status ENUM('completed') DEFAULT 'completed' COMMENT '默认完成（现场兑换）',
    exchange_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    handler_id INT COMMENT '操作院长ID',
    FOREIGN KEY (institution_id) REFERENCES institutions(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='兑换记录表';

-- 9. 系统日志表
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    module VARCHAR(50) COMMENT '操作模块',
    description TEXT COMMENT '操作描述',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    request_data JSON COMMENT '请求数据',
    response_status INT COMMENT '响应状态码',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统日志表';

-- 插入院点
INSERT INTO institutions (name, address) VALUES 
('李河院', '李河镇平安村'),
('武陵院', '武陵镇'),
('甘宁院', '甘宁镇');

-- 插入测试账号（密码均为123456）
-- admin密码: 123456
-- 为每个院点创建一个对应的院长账号
INSERT INTO users (username, password_hash, role, name, institution_id) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN.v1r3W6z7lKq', 'admin', '总部管理员', NULL),
('lihe_yz', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN.v1r3W6z7lKq', 'director', '李河院长', 1),
('wuling_yz', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN.v1r3W6z7lKq', 'director', '武陵院长', 2),
('ganning_yz', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN.v1r3W6z7lKq', 'director', '甘宁院长', 3);

-- 更新院点的 director_id
UPDATE institutions SET director_id = 2 WHERE id = 1;
UPDATE institutions SET director_id = 3 WHERE id = 2;
UPDATE institutions SET director_id = 4 WHERE id = 3;

-- 插入测试护工（李河院7人、武陵院6人、甘宁院6人）
INSERT INTO helpers (institution_id, name, total_points) VALUES
-- 李河院护工（7人）
(1, '邬时中', 0), (1, '魏文举', 0), (1, '文启利', 0), (1, '蒋孝生', 0), 
(1, '李国庆', 0), (1, '赖理秀', 0), (1, '谭其秋', 0),
-- 武陵院护工（6人）
(2, '万良忠', 0), (2, '牟方田', 0), (2, '廖荣华', 0), (2, '廖祥富', 0), 
(2, '李方贵', 0), (2, '应茂祥', 0),
-- 甘宁院护工（6人）
(3, '万启兰', 0), (3, '何光亮', 0), (3, '罗洪友', 0), (3, '李世秀', 0), 
(3, '万德莲', 0), (3, '魏文兴', 0);

-- 插入测试老人（每院6人）
INSERT INTO elderly (institution_id, name, total_points) VALUES
-- 李河院老人（6人）
(1, '李文琼', 0), (1, '周富才', 0), (1, '余元秀', 0), (1, '何光华', 0), 
(1, '何之玉', 0), (1, '余真玉', 0),
-- 武陵院老人（6人）
(2, '万加碧', 0), (2, '毛开元', 0), (2, '陈之忠', 0), (2, '梁定金', 0), 
(2, '罗大前', 0), (2, '万世才', 0),
-- 甘宁院老人（6人）
(3, '王远富', 0), (3, '何之全', 0), (3, '万福江', 0), (3, '刘富瑶', 0), 
(3, '熊学林', 0), (3, '熊德礼', 0);

-- 插入文娱活动类型
INSERT INTO activities (name, points_per_hour, status) VALUES
('重阳节舞蹈表演', 2, 1),
('健康讲座', 1, 1),
('集体生日会', 3, 1),
('戏曲表演', 2, 1);

-- 插入商品（17种）
INSERT INTO products (name, category, points_price, stock_quantity, unit, status) VALUES
('洗衣液', '清洁用品', 15, 100, '瓶', 1),
('洗衣粉', '清洁用品', 12, 100, '袋', 1),
('洗洁精', '清洁用品', 10, 100, '瓶', 1),
('香皂', '日用品', 5, 200, '块', 1),
('肥皂', '日用品', 5, 200, '块', 1),
('卫生纸（卷纸）', '日用品', 8, 150, '提', 1),
('卫生纸（抽纸）', '日用品', 8, 150, '盒', 1),
('食用油', '食品', 30, 80, '瓶', 1),
('拖鞋', '日用品', 15, 50, '双', 1),
('酱油', '食品', 8, 100, '瓶', 1),
('醋', '食品', 6, 100, '瓶', 1),
('盐', '食品', 3, 200, '袋', 1),
('毛巾', '日用品', 10, 100, '条', 1),
('面盆', '日用品', 12, 60, '个', 1),
('袜子', '日用品', 8, 100, '双', 1),
('牙膏', '日用品', 8, 120, '支', 1),
('牙刷', '日用品', 5, 150, '支', 1);
