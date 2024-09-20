// 输出 发布单-迭代-维度 excel数据
const { fetchReleaseList, fetchReleaseDetailsByExternalId, fetchiterationById, fetchDemandByExternalId } = require('./servies.js');
const async = require('async');
const dayjs = require('dayjs');
const { saveListToFile, saveToExcel } = require('./util.js');


// 请求重试函数 todo...
async function fetchWithRetry(externalId, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fetchReleaseDetailsByExternalId(externalId);
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${externalId}:`, error);
            if (attempt === retries) throw error; // 如果达到最大重试次数，抛出错误
        }
    }

}

// 根据发布单列表查询详情数据并拼接详情数组
async function createDetailList(releaselist) {
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(releaselist, 30, async (item) => {
        const details = await fetchReleaseDetailsByExternalId(item.externalId);
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
        list.push(newData);
    });

    return list;
}

// 查询发布单下的迭代数据 并拼接
async function createIterationList(detailsList) {
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(detailsList, 30, async (item) => {
        const iterationList = await fetchiterationById(item.id) || [];

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
        }
    });
    return list;
}

// 查询迭代下的需求数据 并拼接
async function createDemandList(iterationList) {
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(iterationList, 30, async (item) => {
        const demandList = await fetchDemandByExternalId(item.iterationExtrnalId) || [];
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
        }
    });
    console.log('需求列表拼接结束', list);

    return list;
}


// 主逻辑
async function main() {
    // 获取发布单列表
    const releaselist = await fetchReleaseList();
    console.log('共查询到发布单', releaselist.length, '条')
    // 将发布列表数据保存到文件中
    // saveListToFile(releaselist, 'release_list.json');
    // 拼接发布详情数据
    const detailsList = await createDetailList(releaselist);
    console.log('详情列表拼接结束=共有', detailsList.length, '条')
    // 将发布详情列表数据保存到文件中
    // saveListToFile(detailsList, 'release_detail_list.json');
    // 拼接迭代数据 【 发布单-迭代 为一对多】
    const iterationList = await createIterationList(detailsList);
    // saveListToFile(iterationList, 'release_iteration_list.json');
    console.log('迭代列表拼接结束=共有', iterationList.length, '条')
    // 拼接需求数据
    const demandList = await createDemandList(iterationList);
    // saveListToFile(demandList, 'release_demand_list.json');
    console.log('需求列表拼接结束=共有', demandList.length, '条');

    // 输出到 Excel 文件
    if (demandList.length > 0) {
        saveToExcel(demandList, 'demand_output.xlsx'); // 保存为 details_output.xlsx
    } else {
        console.log('No details found to save.');
    }
}

// 运行主函数
main();