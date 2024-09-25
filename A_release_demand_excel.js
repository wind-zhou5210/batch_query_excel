// 输出 发布单-迭代-维度 excel数据
const { fetchReleaseList, fetchReleaseDetailsByExternalId, fetchiterationById, fetchDemandByExternalId } = require('./servies.js');
const async = require('async');
const dayjs = require('dayjs');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { saveListToFile, saveToExcel_demand } = require('./util.js');
const { retry } = require('./retry_demand.js');

// 创建 logs/demand 目录（如果不存在）
const demandDir = path.resolve(__dirname, 'logs', 'demand');
if (!fs.existsSync(demandDir)) {
    fs.mkdirSync(demandDir, { recursive: true }); // 创建多级目录
}

//  创建日志写入流
const logStream = fs.createWriteStream(path.resolve(demandDir, 'demand_execution_log.txt'), { flags: 'a' });
// 查询详情失败的发布单 写入流
const fialAppStream = fs.createWriteStream(path.resolve(demandDir, 'demand_fail_release_list.txt'), { flags: 'a' });
// 记录查询的发布单详情为空的数据 写入流
const emptyAppStream = fs.createWriteStream(path.resolve(demandDir, 'demand_empty_release_list.txt'), { flags: 'a' });
// 记录查询的发布单迭代为空的数据 写入流
const emptyAppIterationStream = fs.createWriteStream(path.resolve(demandDir, 'demand_empty_iteration_list.txt'), { flags: 'a' });
// 记录查询的发布单迭代需求列表为空的数据 写入流
const emptyAppTaskStream = fs.createWriteStream(path.resolve(demandDir, 'demand_empty_task_list.txt'), { flags: 'a' });

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
            // console.error(`Attempt ${attempt} failed for ${id}:`, error);
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
                // 发布单链接
                releaseUrl: details?.ticket,
                // 发布名称
                releaseItemName: details?.name,
                // 发布接口人 （中文名）
                release_jiekouren_name: details?.creator?.displayName,
                // 发布接口人 （账号）
                releaselist_jiekouren_account: details?.creator?.account,
                // 最早合并时间 
                mergeStartTime: details?.mergeStartTime ? dayjs(details?.mergeStartTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
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
            fialAppStream.write(`查询发布单详情失败，发布单id：${item?.externalId}\n`); // 写入日志文件
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
            const iterationList = await fetchWithRetry(fetchiterationById, item.id);
            if(!iterationList){
                // 如果iterationList 为空 （可能是网络问题）
                // 记录下当前查询为空的 应用信息
                console.log('查询发布单迭代列表失败', '发布单id:', item?.id);
                emptyAppIterationStream.write(`查询发布单迭代失败，发布单id：${item?.releaseId}\n`)
            }
            // 没有迭代数据时， 迭代信息填充为空（非网络问题，只是数组列表为空）
            if (Array.isArray(iterationList) &&!iterationList?.length) {
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
                console.log(`正在请求发布单下的迭代信息：布单ID: ${item.id} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
            }
        } catch (error) {
            console.error(`请求 发布单 id：${item.id} 的迭代信息失败，重试后仍然失败。`);
        }
    });
    return list;
}

// 查询迭代下的需求数据 并拼接
async function createDemandList(iterationList) {
    console.log('==========================开始查询需求信息==========================');
    const totalItems = iterationList?.length; // 获取列表总数
    let processedItems = 0; // 处理的条目计数
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(iterationList, 30, async (item) => {
        try {
            const demandList = await fetchWithRetry(fetchDemandByExternalId, item.iterationExtrnalId) ;
            if(!demandList){
                // demandList 为空 （可能是网络问题）
                // 记录下当前查询为空的 应用信息
                console.log('查询发布单-迭代-需求列表失败', ",发布单id",item.releaseId,'迭代id:', item?.iterationId);
                emptyAppTaskStream.write(`查询发布单-迭代-需求列表失败，发布单id：${item?.releaseId}\n`)
            }
            // 没有迭代数据时， 迭代信息填充为空
            if ( Array.isArray(demandList) && !demandList?.length) {
                const tempObj = {
                    ...item,
                    // 拼接需求信息
                    // 需求标题
                    demandnName: undefined,
                    // 需求id
                    demandId: undefined,
                }
                // 增加已处理条目计数，并计算进度
                processedItems++;
                const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
                // 打印当前请求的id和进度日志
                console.log(`正在请求迭代下的需求信息：迭代ID: ${item.iterationExtrnalId} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
                list.push(tempObj);
            } else {
                demandList?.forEach(demand => {
                    const tempObj = {
                        ...item,
                        // 拼接需求信息
                        // 需求标题
                        demandnName: demand?.subject,
                        // 需求id
                        demandId: demand?.externalId,

                    }
                    list.push(tempObj);
                });
                // 增加已处理条目计数，并计算进度
                processedItems++;
                const progress = ((processedItems / totalItems) * 100).toFixed(2); // 计算进度百分比
                // 打印当前请求的id和进度日志
                console.log(`正在请求迭代下的需求信息：迭代ID: ${item.iterationExtrnalId} (${processedItems}/${totalItems}, 进度: ${progress}%)`);
            }
        } catch (error) {
            console.error(`请求 迭代id：${item.iterationExtrnalId}需求信息 失败，重试后仍然失败。`);
        }
    });
    return list;
}

// 主逻辑
async function main() {
    // 记录开始时间
    const startTime = Date.now();
    console.log('脚本开始运行...');
    //1. 获取发布单列表
    const releaselist = await fetchReleaseList();
    console.log('共查询到发布单', releaselist.length, '条');
    // 将发布列表数据保存到文件中
    saveListToFile(releaselist, 'demand_release_list.json', 'logs/demand');
    //2. 拼接发布详情数据
    const detailsList = await createDetailList(releaselist);
    console.log('详情列表拼接结束=共有', detailsList.length, '条');
    // 将发布详情列表数据保存到文件中
    saveListToFile(detailsList, 'demand_release_detail_list.json', 'logs/demand');
    //3. 拼接迭代数据 【 发布单-迭代 为一对多】
    const iterationList = await createIterationList(detailsList);
    saveListToFile(iterationList, 'demand_release_iteration_list.json', 'logs/demand');
    console.log('迭代列表拼接结束=共有', iterationList.length, '条')
    //4. 拼接需求数据
    const demandList = await createDemandList(iterationList);
    saveListToFile(demandList, 'demand_release_demand_list.json', 'logs/demand');
    console.log('需求列表拼接结束=共有', demandList.length, '条');
    //5. 对错误发布单数据进行重试
    const retryList = await retry();
    console.log('需求列表重试结束=共有', retryList.length, '条');
    const resultList = [...demandList, ...retryList];
    // 输出到 Excel 文件
    if (resultList.length > 0) {
        saveToExcel_demand(resultList, 'demand_output.xlsx'); // 保存为 details_output.xlsx
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