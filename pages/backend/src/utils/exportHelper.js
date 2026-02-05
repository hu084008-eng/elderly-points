const ExcelJS = require('exceljs');

async function exportTransactionsToExcel(transactions) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('积分流水');

  worksheet.columns = [
    { header: '序号', key: 'index', width: 8 },
    { header: '时间', key: 'created_at', width: 20 },
    { header: '院点', key: 'institution_name', width: 15 },
    { header: '人员姓名', key: 'target_name', width: 12 },
    { header: '人员类型', key: 'target_type', width: 12 },
    { header: '类型', key: 'type', width: 10 },
    { header: '积分变动', key: 'amount', width: 12 },
    { header: '服务类型', key: 'service_category', width: 15 },
    { header: '服务时长', key: 'service_duration', width: 12 },
    { header: '活动名称', key: 'activity_name', width: 20 },
    { header: '备注', key: 'description', width: 30 },
    { header: '操作人', key: 'operator_name', width: 12 }
  ];

  worksheet.getRow(1).font = { bold: true, size: 11 };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

  transactions.forEach((item, index) => {
    worksheet.addRow({
      index: index + 1,
      created_at: formatDate(item.created_at),
      institution_name: item.institution_name || '',
      target_name: item.target_name,
      target_type: item.target_type === 'helper' ? '护工' : '老人',
      type: item.type === 'earn' ? '赚取' : '消费',
      amount: item.amount,
      service_category: item.service_category || '',
      service_duration: item.service_duration || '',
      activity_name: item.activity_name || '',
      description: item.description || '',
      operator_name: item.operator_name || ''
    });
  });

  return workbook;
}

async function exportExchangesToExcel(exchanges) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('兑换记录');

  worksheet.columns = [
    { header: '序号', key: 'index', width: 8 },
    { header: '兑换时间', key: 'exchange_date', width: 20 },
    { header: '院点', key: 'institution_name', width: 15 },
    { header: '兑换人', key: 'target_name', width: 12 },
    { header: '人员类型', key: 'target_type', width: 12 },
    { header: '商品名称', key: 'product_name', width: 20 },
    { header: '数量', key: 'quantity', width: 10 },
    { header: '单位', key: 'unit', width: 10 },
    { header: '消耗积分', key: 'total_points', width: 12 }
  ];

  worksheet.getRow(1).font = { bold: true, size: 11 };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

  exchanges.forEach((item, index) => {
    worksheet.addRow({
      index: index + 1,
      exchange_date: formatDate(item.exchange_date),
      institution_name: item.institution_name || '',
      target_name: item.target_name,
      target_type: item.target_type === 'helper' ? '护工' : '老人',
      product_name: item.product_name,
      quantity: item.quantity,
      unit: item.unit,
      total_points: item.total_points
    });
  });

  return workbook;
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

module.exports = { exportTransactionsToExcel, exportExchangesToExcel };
