// 输出 发布单-迭代-维度 excel数据
const { fetchReleaseList, fetchReleaseDetailsByExternalId, fetchiterationById, fetchDemandByExternalId } = require('./servies.js');
const async = require('async');
const dayjs = require('dayjs');
const axios = require('axios');
const { saveListToFile, saveToExcel_demand } = require('./util.js');


// 请求重试函数 
async function fetchWithRetry(fn, id, retries = 3) {
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
            const newData = {
                // 发布单id (id)
                id: details?.id,
                // 发布单名称
                releaseName: details?.name,
                // 发布单id (externalId)
                releaseId: details?.externalId,
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
            list.push(newData);
        } catch (error) {
            console.error(`请求 发布单id：${item.externalId} 的详情失败，重试后仍然失败。`);
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
            const demandList = await fetchWithRetry(fetchDemandByExternalId, item.iterationExtrnalId) || [];
            // 没有迭代数据时， 迭代信息填充为空
            if (!demandList?.length) {
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
    //1. 获取发布单列表
    const releaselist = await fetchReleaseList();
    console.log('共查询到发布单', releaselist.length, '条');
    // 将发布列表数据保存到文件中
    saveListToFile(releaselist, 'release_list.json');
    //2. 拼接发布详情数据
    const detailsList = await createDetailList(releaselist?.slice(0, 300));
    console.log('详情列表拼接结束=共有', detailsList.length, '条');
    // 将发布详情列表数据保存到文件中
    saveListToFile(detailsList, 'release_detail_list.json');
    //3. 拼接迭代数据 【 发布单-迭代 为一对多】
    const iterationList = await createIterationList(detailsList);
    saveListToFile(iterationList, 'release_iteration_list.json');
    console.log('迭代列表拼接结束=共有', iterationList.length, '条')
    //4. 拼接需求数据
    const demandList = await createDemandList(iterationList);
    saveListToFile(demandList, 'release_demand_list.json');
    console.log('需求列表拼接结束=共有', demandList.length, '条');

    // 输出到 Excel 文件
    if (demandList.length > 0) {
        saveToExcel_demand(demandList, 'demand_output.xlsx'); // 保存为 details_output.xlsx
    } else {
        console.log('No details found to save.');
    }
}

// 运行主函数
main();