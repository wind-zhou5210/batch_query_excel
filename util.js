const XLSX = require('xlsx');
const fs = require('fs');
// 将列表保存到文件的函数
function saveListToFile(list, filename) {
    fs.writeFile(filename, JSON.stringify(list, null, 2), (err) => {
        if (err) {
            console.error(`Error saving list to file: ${err}`);
        } else {
            console.log(`List saved to ${filename}`);
        }
    });
}



// 将数据保存到Excel的函数
function saveToExcel(data, filename) {
    // 将数据映射为符合自定义 header 的格式
    const customData = data.map(item => ({
        'id': item.id,
        '发布单名称': item.releaseName,
        "发布单id": item.releaseId,
        "环境": item.env,
        "发布名称": item.releaseItemName,
        "发布接口人": item.release_jiekouren_name,
        "发布接口人账号": item.releaselist_jiekouren_account,
        "合并截止时间": item.mergeEndTime,
        "提交预发截止时间": item.preReleaseEndTime,
        "提交发布截止时间": item.releaseEndTime,
        "预计发布日期": item.releaseDate,
        "迭代名称": item.iterationName,
        "迭代ID": item.iterationId,
        "迭代ExternalId": item.iterationExtrnalId,
        "需求标题": item.demandnName,
        "需求ID": item.demandId

    }));

    // 自定义 header
    const header = ["id", "发布单名称", "发布单id", "环境", "发布名称", "发布接口人", "发布接口人账号", "合并截止时间", "提交预发截止时间", "提交发布截止时间", "预计发布日期", "迭代名称", "迭代ID", "迭代ExternalId", "需求标题", "需求ID"];
    const worksheet = XLSX.utils.json_to_sheet(customData, { header }); // 将 JSON 转换为 Excel sheet
    const workbook = XLSX.utils.book_new(); // 创建一个新的工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Details'); // 将sheet附加到工作簿中
    XLSX.writeFile(workbook, filename); // 将工作簿写入文件
    console.log(`Excel file saved as ${filename}`);
}

module.exports = {
    saveListToFile,
    saveToExcel
}