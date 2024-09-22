/**
 * 生成发布-迭代-应用-审批 excel 表格
 */
const { fetchReleaseList, fetchReleaseDetailsByExternalId, fetchiterationById, fetchApprovalById, fetchRealseApprovalById, fetchRealseApprovalDoneTaskById, fetchRealseReviewDetailVarByTaskId, fetchRealseAppsByExternalId } = require('./servies.js');
const async = require('async');
const dayjs = require('dayjs');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { saveListToFile, saveToExcel_approval } = require('./util.js');
const { retry } = require('./retry_approval.js');
// 创建 logs/approval 目录（如果不存在）
const approvalDir = path.resolve(__dirname, 'logs', 'approval');                  
if (!fs.existsSync(demandDir)) {
    fs.mkdirSync(demandDir, { recursive: true }); // 创建多级目录
}

// 创建日志写入流
const logStream = fs.createWriteStream(path.resolve(approvalDir, 'approval_execution_log.txt'), { flags: 'a' });
// 查询详情失败的发布单 写入流
const fialAppStream = fs.crSeateWriteStream(path.resolve(approvalDir, 'approval_fail_release_list.txt'), { flags: 'a' });
// 记录查询的发布单详情为空的数据 写入流
const emptyAppStream = fs.createWriteStream(path.resolve(azsSSSS, 'approval_empty_release_list.txt'), { flags: 'a' });

// ANSI 转义码：黄色
const yellow = '\x1b[33m';
const reset = '\x1b[0m'; // 重置颜色

// 重定向 console.log 和 console.error 输出到日志文件
console.log = (function (logFunc) {
    return function (...args) {
        const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const formattedTime = `${yellow}${timestamp}${reset}`; // 高亮时间
        logFunc.apply(console, [formattedTime, ...args]); // 保持原始的 console.log 行为，并高亮时间
        logStream.write(`${timestamp} - LOG: ${args.join(' ')}\n`); // 写入日志文件
    };
}(console.log));

console.error = (function (errorFunc) {
    return function (...args) {
        const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const formattedTime = `${yellow}${timestamp}${reset}`; // 高亮时间
        errorFunc.apply(console, [formattedTime, ...args]); // 保持原始的 console.error 行为，并高亮时间
        logStream.write(`${timestamp} - ERROR: ${args.join(' ')}\n`); // 写入日志文件
    };
}(console.error));


// 请求重试函数 
async function fetchWithRetry(fn, id, retries = 5) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn(id);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Attempt ${attempt} failed for ${id}:`, {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                });
            } else {
                console.error('Unexpected error:', error);
            }
            if (attempt === retries) throw error; // 如果达到最大重试次数，抛出错误
        }
    }
}

// 根据发布单列表查询详情数据并拼接详情数组
async function createDetailList(releaselist) {
    console.log('==========================开始查询发布单详情信息==========================');
    const totalItems = releaselist?.length; // 获取列表总数
    let processedItems = 0; // 处理的条目计数
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(releaselist, 30, async (item) => {
        try {
            const details = await fetchWithRetry(fetchReleaseDetailsByExternalId, item.externalId);
            if (!details) {
                console.log('查询发布单详情为空', '发布单id:', item?.externalId);
                emptyAppStream.write(`查询发布单详情为空，发布单id：${item?.externalId}\n`);
            }
            const newData = {
                // 发布单id (id)
                id: details?.id,
                // 发布单名称
                releaseName: details?.name,
                // 发布单id (externalId)
                releaseId: item?.externalId,
                // 环境 (json)
                env: JSON.stringify(details?.tenantReleaseInfos),
                // 发布名称
                releaseItemName: details?.name,
                // 发布接口人 （中文名）
                release_jiekouren_name: details?.creator?.displayName,
                // 发布接口人 （账号）
                releaselist_jiekouren_account: details?.creator?.account,
                // 最早合并时间 TODO...
                // earliestMergeTime: item?.earliestMergeTime,
                // 合并截止时间
                mergeEndTime: details?.deadlines?.FAST_DEV ? dayjs(details?.deadlines?.FAST_DEV).format('YYYY-MM-DD HH:mm:ss') : undefined,
                // 提交预发截止时间
                preReleaseEndTime: details?.deadlines.FAST_SIT ? dayjs(details?.deadlines.FAST_SIT).format('YYYY-MM-DD HH:mm:ss') : undefined,
                // 提交发布截止时间
                releaseEndTime: details?.deadlines.FAST_PRE ? dayjs(details?.deadlines.FAST_PRE).format('YYYY-MM-DD HH:mm:ss') : undefined,
                // 预计发布日期
                releaseDate: details?.releaseDate ? dayjs(details?.releaseDate).format('YYYY-MM-DD HH:mm:ss') : undefined,
            }
            // 增加已处理条目计数，并计算进度
            processedItems++;
            const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
            // 打印当前请求的id和进度日志
            console.log(`正在请求发布单详情数据：发布单ID: ${item.externalId} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
            //    没有值的时候不在放入空对象，会做日志文件记录
            if (details) list.push(newData);
        } catch (error) {
            console.error(`请求 发布单id：${item.externalId} 的详情失败，重试后仍然失败。`);
            // 写入日志文件
            fialAppStream.write(`请求 发布单id：${item.externalId} 的详情失败，重试后仍然失败。\n`); // 写入日志文件
        }

    });

    return list;
}


// 查询发布单下的迭代数据 并拼接
async function createIterationList(detailsList) {
    console.log('==========================开始查询迭代信息==========================');
    const totalItems = detailsList?.length; // 获取列表总数
    let processedItems = 0; // 处理的条目计数
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(detailsList, 30, async (item) => {
        try {
            const iterationList = await fetchWithRetry(fetchiterationById, item.id) || [];
            // 没有迭代数据时， 迭代信息填充为空
            if (!iterationList?.length) {
                const tempObj = {
                    ...item,
                    // 拼接迭代信息
                    // 迭代名称
                    iterationName: undefined,
                    // 迭代id （todo... 最终需要过过滤）
                    iterationId: undefined,
                    // 迭代 externalId 
                    iterationExtrnalId: undefined,
                }
                // 增加已处理条目计数，并计算进度
                processedItems++;
                const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
                // 打印当前请求的id和进度日志
                console.log(`正在请求发布单下的迭代信息：发布单ID: ${item.id} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
                list.push(tempObj);
            } else {
                iterationList?.forEach(iterat => {
                    const tempObj = {
                        ...item,
                        // 拼接迭代信息
                        // 迭代名称
                        iterationName: iterat?.name,
                        // 迭代id （todo... 最终需要过过滤）
                        iterationId: iterat?.id,
                        // 迭代 externalId 
                        iterationExtrnalId: iterat?.externalId,
                    }
                    list.push(tempObj);
                });
                // 增加已处理条目计数，并计算进度
                processedItems++;
                const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
                // 打印当前请求的id和进度日志
                console.log(`正在请求发布单下的迭代信息：发布单ID: ${item.id} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
            }
        } catch (error) {
            console.error(`请求 发布单 id：${item.id} 的迭代信息失败，重试后仍然失败。`);
        }
    });
    return list;
}
// 查询迭代下审批单数据 并拼接
async function createApprovalList(iterationList) {
    console.log('==========================开始查询审批列表信息==========================');
    const totalItems = iterationList?.length; // 获取列表总数
    let processedItems = 0; // 处理的条目计数
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(iterationList, 30, async (item) => {
        try {
            const approvalList = await fetchWithRetry(fetchApprovalById, item.iterationId) || [];
            // 没有迭代数据时， 迭代信息填充为空
            if (!approvalList?.length) {
                const appInfoObj = {
                    // 代码仓库
                    codeRepo: undefined,
                    // 用于提交发布的应用
                    appName: undefined,
                    // 状态阶段
                    stage: undefined,
                    // 是否发布
                    isRelease: undefined
                }
                const tempObj = {
                    ...item,
                    // 拼接审批信息
                    approvalId: undefined,
                    ...appInfoObj,
                }
                delete tempObj.appLists;
                // 增加已处理条目计数，并计算进度
                processedItems++;
                const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
                // 打印当前请求的id和进度日志
                console.log(`正在请求迭代下的审批单：迭代ID: ${item.iterationId} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
                list.push(tempObj);
            } else {
                approvalList?.forEach(approval => {
                    // 审批关联的 应用
                    const targetAppName = approval?.appNames?.[0];
                    // 筛选对应的应用
                    const targetAppInfo = item?.appLists?.find(app => app?.releaseApps?.[0]?.appName === targetAppName);
                    const appInfoObj = {
                        // 代码仓库
                        codeRepo: targetAppInfo?.repoName,
                        // 用于提交发布的应用
                        appName: targetAppInfo?.releaseApps?.[0]?.appName,
                        // 状态阶段
                        stage: targetAppInfo?.releaseApps?.[0]?.appUnits?.[0]?.stageStep?.displayName,
                        // 是否发布
                        isRelease: targetAppInfo?.releaseApps?.[0]?.release
                    }
                    const tempObj = {
                        ...item,
                        // 拼接审批信息
                        approvalId: approval?.id,
                        ...appInfoObj
                    }
                    delete tempObj.appLists;
                    list.push(tempObj);
                });
                // 增加已处理条目计数，并计算进度
                processedItems++;
                const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
                // 打印当前请求的id和进度日志
                console.log(`正在请求迭代下的审批单：迭代ID: ${item.iterationId} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
            }
        } catch (error) {
            console.error(`请求 迭代 id：${item.iterationId} 的审批单失败，重试后仍然失败。`);
        }
    });
    return list;
}
// 查询审批的发布审批信息 并拼接
async function createReleaseApprovalList(approvalList) {
    console.log('==========================开始查询发布审批信息==========================');
    const totalItems = approvalList?.length; // 获取列表总数
    let processedItems = 0; // 处理的条目计数
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(approvalList, 30, async (item) => {
        try {
            const releaseApprovalInfo = await fetchWithRetry(fetchRealseApprovalById, item.approvalId) || [];
            const newData = {
                ...item,
                releaseApprovalInfo: JSON.stringify(releaseApprovalInfo)
            }
            // 增加已处理条目计数，并计算进度
            processedItems++;
            const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
            // 打印当前请求的id和进度日志
            console.log(`正在请求审批单下的发布审批信息：审批单ID: ${item.approvalId} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
            list.push(newData)
        } catch (error) {
            console.error(`请求 审批单ID：${item.approvalId} 下的发布审批信息失败，重试后仍然失败。`);
        }
    });
    return list;
}

// 查询审批下已完成任务列表 并拼接发布评审任务id
async function createReviewList(approvalList) {
    console.log('=============正在查询审批单下的已完成任务列表信息============');
    const totalItems = approvalList?.length; // 获取列表总数
    let processedItems = 0; // 处理的条目计数
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(approvalList, 30, async (item) => {
        try {
            const releaseApprovalDoneList = await fetchWithRetry(fetchRealseApprovalDoneTaskById, item.approvalId) || [];
            // 找出发布评审任务数据数据
            const release_review_task = releaseApprovalDoneList?.find(item => item.key === 'release-assessment-task');
            const newData = {
                ...item,
                release_review_task_id: release_review_task?.id
            }
            // 增加已处理条目计数，并计算进度
            processedItems++;
            const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
            // 打印当前请求的id和进度日志
            console.log(`正在请求审批单下的已完成任务列表：审批单ID: ${item.approvalId} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
            list.push(newData)
        } catch (error) {
            console.error(`请求 审批单ID：${item.approvalId} 下的已完成任务列表失败，重试后仍然失败。`);
        }

    });
    return list;
}
// 查询发布评审任务详情 并拼接
async function createReviewDetailList(approvalList) {
    console.log('=============正在查询发布评审任务详情============');
    const totalItems = approvalList?.length; // 获取列表总数
    let processedItems = 0; // 处理的条目计数
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(approvalList, 30, async (item) => {

        try {
            const release_review_detail_list = await fetchWithRetry(fetchRealseReviewDetailVarByTaskId, item.release_review_task_id) || [];
            // 迭代id
            let release_iterationId = undefined;
            // 迭代名
            let release_iterationName = undefined;
            // 应用名
            let release_appName = undefined;
            // 功能描述
            let release_desc = undefined;
            // 发布影响
            let release_impact = undefined;
            // 发布前准备
            let release_prepare = undefined;
            // 发布步骤
            let release_steps = undefined;
            // 回退预案
            let release_plan = undefined;

            release_review_detail_list?.forEach(detail => {
                switch (detail.key) {
                    case 'iterationId':
                        release_iterationId = detail.value
                        break;
                    case 'iterationName':
                        release_iterationName = detail.value
                        break;
                    case 'appName':
                        release_appName = detail.value
                        break;
                    case 'functionDesc':
                        release_desc = detail.value
                        break;
                    case 'releaseInfluence':
                        release_impact = detail.value
                        break;
                    case 'releasePrepare':
                        release_prepare = detail.value
                        break;
                    case 'releaseStep':
                        release_steps = detail.value
                        break;
                    case 'revert':
                        release_plan = detail.value
                        break;
                    default:
                        break;
                }
            })
            const newData = {
                ...item,
                release_iterationId,
                release_iterationName,
                release_appName,
                release_desc,
                release_impact,
                release_prepare,
                release_steps,
                release_plan
            }
            delete newData.iterationId;
            delete newData.approvalId;
            delete newData.release_review_task_id;

            // 增加已处理条目计数，并计算进度
            processedItems++;
            const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
            // 打印当前请求的id和进度日志
            console.log(`正在请求审批单下发布审批任务信息：审批单ID: ${item.approvalId} ，任务ID：${item.release_review_task_id} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
            list.push(newData)
        } catch (error) {
            console.error(`请求 审批单ID：${item.approvalId} 下 任务ID：${item.release_review_task_id} 的发布审批任务信息失败，重试后仍然失败。`);
        }

    });
    return list;
}
// 查询发布单下的应用信息 并拼接
async function createDetailListWithAppInfo(detailsList) {
    console.log('==========================开始查询发布单下的应用信息==========================');
    const totalItems = detailsList?.length; // 获取列表总数
    let processedItems = 0; // 处理的条目计数
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(detailsList, 30, async (item) => {
        try {
            const appListsInfo = await fetchWithRetry(fetchRealseAppsByExternalId, item.releaseId) || {};
            const appLists = appListsInfo?.releaseRepos
            const newData = {
                ...item,
                appLists
            }
            // 增加已处理条目计数，并计算进度
            processedItems++;
            const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
            // 打印当前请求的id和进度日志
            console.log(`正在请求发布单下的应用信息：发布单ID: ${item.releaseId} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
            list.push(newData)
        } catch (error) {
            console.error(`请求 发布单id：${item.releaseId} 下的应用信息失败，重试后仍然失败。`);
        }

    });
    return list;
}



// 主逻辑
async function main() {
    // 记录开始时间
    const startTime = Date.now();
    console.log('脚本开始运行...');
    //1.  获取发布单列表
    const releaselist = await fetchReleaseList();
    console.log('共查询到发布单', releaselist.length, '条')
    saveListToFile(releaselist, 'approval_release_list.json', 'logs/approval');
    //2.  拼接发布详情数据
    const detailsList = await createDetailList(releaselist);
    console.log('详情列表拼接结束=共有', detailsList.length, '条')
    saveListToFile(detailsList, 'approval_release_detail_list.json', 'logs/approval');
    //3.  拼接应用信息数据
    const detailListWithAppInfo = await createDetailListWithAppInfo(detailsList);
    console.log('======================应用信息拼接结束=共有', detailListWithAppInfo.length, '条', '======================')
    //4. 拼接迭代数据 【 发布单-迭代 为一对多】
    const iterationList = await createIterationList(detailListWithAppInfo);
    console.log('======================迭代列表拼接结束=共有', iterationList.length, '条', '======================');
    saveListToFile(iterationList, 'approval_release_iteration_list.json', 'logs/approval');
    //5. 拼接审批id 信息
    const approvalList = await createApprovalList(iterationList);
    console.log('======================审批列表拼接结束=共有', approvalList.length, '条', '======================');
    saveListToFile(approvalList, 'approval_release_iteration_withapproval_list.json', 'logs/approval');
    //6. 拼接发布审批信息 （拼接个json即可）
    const releaseApprovalList = await createReleaseApprovalList(approvalList);
    console.log('======================发布审批列表拼接结束=共有', releaseApprovalList.length, '条', '======================');
    saveListToFile(releaseApprovalList, 'approval_release_approval_list.json', 'logs/approval');
    //7. 拼接发布评审任务id
    const reviewList = await createReviewList(releaseApprovalList);
    console.log('评审列表拼接结束=共有', reviewList.length, '条');
    saveListToFile(reviewList, 'approval_release_review_list.json', 'logs/approval');
    //8. 拼接 发布评审任务详情信息
    const reviewDetailList = await createReviewDetailList(reviewList);
    console.log('评审详情列表拼接结束=共有', reviewDetailList.length, '条');
    saveListToFile(reviewDetailList, 'approval_release_review_detail_list.json', 'logs/approval');
    //9. 对错误发布单数据进行重试
    const retryList = await retry();
    console.log('需求列表重试结束=共有', retryList.length, '条');
    const resultList = [...reviewDetailList, ...retryList];
    //10.输出到 Excel 文件
    if (resultList.length > 0) {
        saveToExcel_approval(resultList, 'approval_output.xlsx'); // 保存为 details_output.xlsx
    } else {
        console.log('No details found to save.');
    }
    // 记录结束时间并计算总耗时
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000; // 转换为秒
    console.log(`脚本运行结束，总耗时: ${totalTime} 秒`);
}

// 运行主函数
main();