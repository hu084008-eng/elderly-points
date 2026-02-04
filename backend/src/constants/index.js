/**
 * 常量定义
 */

const USER_ROLES = { ADMIN: 'admin', DIRECTOR: 'director' };
const PERSON_TYPES = { HELPER: 'helper', ELDERLY: 'elderly' };
const POINTS_TYPE = { EARN: 'earn', SPEND: 'spend' };
const SERVICE_CATEGORIES = { VISIT: '到院互助', HOME: '上门互助', INTERNAL: '院内互助', WORK: '生产劳动', ACTIVITY: '文娱活动', EXCHANGE: '商品兑换' };
const CALCULATION_TYPES = { FIXED: 'fixed', DYNAMIC: 'dynamic' };
const PRODUCT_CATEGORIES = { CLEANING: '清洁用品', FOOD: '食品', DAILY: '日用品', OTHER: '其他' };
const STATUS = { ACTIVE: 1, INACTIVE: 0 };
const FIXED_POINTS = { LESS_THAN_2_HOURS: 1, MORE_THAN_2_HOURS: 2, THRESHOLD: 2 };

module.exports = { USER_ROLES, PERSON_TYPES, POINTS_TYPE, SERVICE_CATEGORIES, CALCULATION_TYPES, PRODUCT_CATEGORIES, STATUS, FIXED_POINTS };
