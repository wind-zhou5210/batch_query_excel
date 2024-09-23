const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 创建指定目录（如果不存在）
function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }); // 使用 recursive: true 创建多级目录
    }
}

// 修改 saveListToFile 函数
function saveListToFile(list, filename, directory) {
    const dirPath = path.resolve(__dirname, directory);
    ensureDirectoryExists(dirPath); // 确保目录存在
    const filePath = path.resolve(dirPath, filename); // 构建完整路径
    fs.writeFile(filePath, JSON.stringify(list, null, 2), (err) => {
        if (err) {
            console.error(`Error saving list to file: ${err}`);
        } else {
            console.log(`List saved to ${filePath}`);
        }
    });
}

// 【需求维度】将数据保存到Excel的函数
function saveToExcel_demand(data, filename) {
    console.log('正在保存数据到Excel：', filename)
    // 将数据映射为符合自定义 header 的格式
    const customData = data.map(item => ({
        'id': item.id,
        '发布单名称': item.releaseName,
        "发布单id": item.releaseId,
        "环境": item.env,
        "发布名称": item.releaseItemName,
        "发布接口人": item.release_jiekouren_name,
        "发布接口人账号": item.releaselist_jiekouren_account,
        "最早合并时间": item.mergeStartTime,
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
    const header = ["id", "发布单名称", "发布单id", "环境", "发布名称", "发布接口人", "发布接口人账号",  "最早合并时间","合并截止时间", "提交预发截止时间", "提交发布截止时间", "预计发布日期", "迭代名称", "迭代ID", "迭代ExternalId", "需求标题", "需求ID"];
    const worksheet = XLSX.utils.json_to_sheet(customData, { header }); // 将 JSON 转换为 Excel sheet
    const workbook = XLSX.utils.book_new(); // 创建一个新的工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Details'); // 将sheet附加到工作簿中
    XLSX.writeFile(workbook, filename); // 将工作簿写入文件
    console.log(`Excel file saved as ${filename}`);
}

// {
//     id: '66ed0f6e0358b5272cc60612',
//     releaseName: '销售资金利息分配产品需求-报表',
//     releaseId: 'ECR10026726',
//     env: '[{"cloudTenantId":"6310986fe37cd926d2c01d27","cloudTenantName":"金融云租户","prodEnvReleaseInfo":{"envId":"110","info":"已经提交发布，请至发布单确认","status":"SUBMITTED","ticket":"http://consoleng.thsofa.thfund/ui/#/deps/releases/summary/r1_202409201513388078?projectName=ANTCLOUD&workspaceName=dx-core-prod","workspaceId":"632bcdcfe514b526d1e44dc2","workspaceName":"大兴核心业务生产环境"}},{"cloudTenantId":"648823232219a826d183798a","cloudTenantName":"房山生产租户","prodEnvReleaseInfo":{"envId":"122","info":"已经提交发布，请至发布单确认","status":"SUBMITTED","ticket":"http://consoleng.thsofa.thfund/ui/#/deps/releases/summary/r1_202409201513395857?projectName=FSSCZH&workspaceName=fscoresprod","workspaceId":"6488236d52772b2712592e21","workspaceName":"房山核心业务区"}}]',
//     releaseItemName: '销售资金利息分配产品需求-报表',
//     release_jiekouren_name: '王涛[王涛-0000012014]',
//     releaselist_jiekouren_account: 'wangt',
//     mergeEndTime: undefined,
//     preReleaseEndTime: undefined,
//     releaseEndTime: undefined,
//     releaseDate: undefined,
//     iterationName: '销售资金利息分配产品需求-报表',
//     iterationExtrnalId: 'ECI10026676',
//     approvalId: 'f5772805-7715-11ef-a6a6-9228587ecc0d',
//     codeRepo: 'http://code.thyun.thfund.com.cn/thfundpremise/TA/salefr-front.git',
//     appName: 'sale_fr_front',
//     stage: '发布阶段',
//     isRelease: true,
//     releaseApprovalInfo: '[{"id":"f5772817-7715-11ef-a6a6-9228587ecc0d","processInstanceId":"f5772805-7715-11ef-a6a6-9228587ecc0d","processDefinitionId":"linke-release-assessment:3:56eaeac8-7ac3-11ec-9909-62f8173cc775","activityId":"start","activityName":"开始","activityType":"startEvent","assignee":null,"startTime":"2024-09-20T06:02:47.000+0000","endTime":"2024-09-20T06:02:47.000+0000","duration":0,"taskId":null,"comment":null},{"id":"f577281b-7715-11ef-a6a6-9228587ecc0d","processInstanceId":"f5772805-7715-11ef-a6a6-9228587ecc0d","processDefinitionId":"linke-release-assessment:3:56eaeac8-7ac3-11ec-9909-62f8173cc775","activityId":"prepare-to-submit","activityName":"准备提交","activityType":"userTask","assignee":"王涛(wangt)","startTime":"2024-09-20T06:19:28.000+0000","endTime":"2024-09-20T06:19:28.000+0000","duration":218,"taskId":"f577281c-7715-11ef-a6a6-9228587ecc0d","comment":null},{"id":"4a5b90ec-7718-11ef-a6a6-9228587ecc0d","processInstanceId":"f5772805-7715-11ef-a6a6-9228587ecc0d","processDefinitionId":"linke-release-assessment:3:56eaeac8-7ac3-11ec-9909-62f8173cc775","activityId":"release-assessment-task","activityName":"发布评审任务","activityType":"userTask","assignee":"张朋(zhangpeng)","startTime":"2024-09-20T07:06:42.000+0000","endTime":"2024-09-20T07:06:42.000+0000","duration":407,"taskId":"4a5b90ed-7718-11ef-a6a6-9228587ecc0d","comment":"同意"},{"id":"e3aa2f29-771e-11ef-a6a6-9228587ecc0d","processInstanceId":"f5772805-7715-11ef-a6a6-9228587ecc0d","processDefinitionId":"linke-release-assessment:3:56eaeac8-7ac3-11ec-9909-62f8173cc775","activityId":"end","activityName":"结束","activityType":"endEvent","assignee":null,"startTime":"2024-09-20T07:06:42.000+0000","endTime":"2024-09-20T07:06:42.000+0000","duration":0,"taskId":null,"comment":null}]',
//     release_review_task_id: '4a5b90ed-7718-11ef-a6a6-9228587ecc0d',
//     release_iterationId: 'ECI10026676',
//     release_iterationName: '销售资金利息分配产品需求-报表',
//     release_appName: 'sale_fr_front',
//     release_desc: 'https://yuque.thfund.com.cn/staff-zosslv/gqo879/ylsfkhftc0dx66ws',
//     release_impact: undefined,
//     release_prepare: undefined,
//     release_steps: undefined,
//     release_plan: undefined
//   },
// 【审批维度】将数据保存到Excel的函数
function saveToExcel_approval(data, filename) {
    console.log('正在保存数据到Excel：', filename)
    // 将数据映射为符合自定义 header 的格式
    const customData = data.map(item => ({
        'id': item.id,
        '发布单名称': item.releaseName,
        "发布单id": item.releaseId,
        "环境": item.env,
        "发布名称": item.releaseItemName,
        "发布接口人": item.release_jiekouren_name,
        "发布接口人账号": item.releaselist_jiekouren_account,
        "最早合并时间": item.mergeStartTime,
        "合并截止时间": item.mergeEndTime,
        "提交预发截止时间": item.preReleaseEndTime,
        "提交发布截止时间": item.releaseEndTime,
        "预计发布日期": item.releaseDate,
        "迭代名称": item.iterationName,
        "迭代ID": item.iterationExtrnalId,
        "代码库": item?.codeRepo,
        "用于提交发布的应用": item?.appName,
        "状态/阶段": item?.stage,
        "是否发布": item?.isRelease,
        "发布审批信息": item.releaseApprovalInfo,
        "迭代iD": item.release_iterationId,
        "迭代名": item.release_iterationName,
        "应用名": item.release_appName,
        "功能描述": item.release_desc,
        "发布影响": item.release_impact,
        "发布前准备": item.release_prepare,
        "发布步骤": item.release_steps,
        "回退预案": item.release_plan
    }));

    // 自定义 header
    const header = ["id", "发布单名称", "发布单id", "环境", "发布名称",
        "发布接口人", "发布接口人账号", "最早合并时间", "合并截止时间", "提交预发截止时间",
        "提交发布截止时间", "预计发布日期", "迭代名称", "迭代ID", "代码库",
        "用于提交发布的应用", "状态/阶段", "是否发布", "发布审批信息",
        "迭代iD", "迭代名", "应用名", "功能描述", "发布影响", "发布前准备",
        "发布步骤", "回退预案",
    ];
    const worksheet = XLSX.utils.json_to_sheet(customData, { header }); // 将 JSON 转换为 Excel sheet
    const workbook = XLSX.utils.book_new(); // 创建一个新的工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Details'); // 将sheet附加到工作簿中
    XLSX.writeFile(workbook, filename); // 将工作簿写入文件
    console.log(`Excel file saved as ${filename}`);
}

// 读取日志文件并筛选发布单 ID
function extractReleaseIdsFromLog(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(`读取文件出错: ${err}`);
                return;
            }
            // 使用正则表达式匹配 "发布单id: ECR" 后面的ID
            const idRegex = /发布单id：([A-Z0-9]+)/g;
            const ids = [];
            let match;

            // 遍历文件内容匹配到的所有发布单ID
            while ((match = idRegex.exec(data)) !== null) {
                ids.push(match[1]); // 提取出ID并推入数组
            }
            resolve(ids);
        });
    });
}

module.exports = {
    saveListToFile,
    saveToExcel_demand,
    saveToExcel_approval,
    extractReleaseIdsFromLog
}