/**
 * 生成发布-迭代-应用-审批 excel 表格
 */
const { fetchReleaseList, fetchReleaseDetailsByExternalId, fetchiterationById, fetchApprovalById, fetchRealseApprovalById } = require('./servies.js');
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

// 查询迭代下审批单数据 并拼接
async function createApprovalList(iterationList) {
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(iterationList, 30, async (item) => {
        const approvalList = await fetchApprovalById(item.iterationId) || [];

        // 没有迭代数据时， 迭代信息填充为空
        if (!approvalList?.length) {
            const tempObj = {
                ...item,
                // 拼接审批信息
                approvalId: undefined,
            }
            list.push(tempObj);
        } else {
            approvalList?.forEach(approval => {
                const tempObj = {
                    ...item,
                    // 拼接审批信息
                    approvalId: approval?.id,
                }
                list.push(tempObj);
            });
        }
    });
    return list;
}
// 查询审批的发布审批信息 并拼接
async function createReleaseApprovalList(approvalList) {
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(approvalList, 30, async (item) => {
        const releaseApprovalInfo = await fetchRealseApprovalById(item.approvalId) || [];
        const newData = {
            ...item,
            releaseApprovalInfo: JSON.stringify(releaseApprovalInfo)
        }
        list.push(newData)
    });
    return list;
}


// 主逻辑
async function main() {
    //1.  获取发布单列表
    const releaselist = await fetchReleaseList();
    console.log('共查询到发布单', releaselist.length, '条')
    saveListToFile(releaselist, 'release_list.json');
    //2.  拼接发布详情数据
    const detailsList = await createDetailList(releaselist.slice(0, 20));
    console.log('详情列表拼接结束=共有', detailsList.length, '条')
    saveListToFile(detailsList, 'release_detail_list.json');
    //3. 拼接迭代数据 【 发布单-迭代 为一对多】
    const iterationList = await createIterationList(detailsList);
    console.log('迭代列表拼接结束=共有', iterationList.length, '条');
    saveListToFile(iterationList, 'release_iteration_list.json');
    // 4. 拼接审批id 信息
    const approvalList = await createApprovalList(iterationList);
    console.log('审批列表拼接结束=共有', approvalList.length, '条')
    saveListToFile(approvalList, 'release_iteration_withapproval_list.json');
    //5. 拼接发布审批信息 （拼接个json即可）
    const releaseApprovalList = await createReleaseApprovalList(approvalList);
    console.log('发布审批列表拼接结束=共有', releaseApprovalList.length, '条')
    saveListToFile(releaseApprovalList, 'release_approval_list.json');





    // // 5.输出到 Excel 文件
    // if (demandList.length > 0) {
    //     saveToExcel(demandList, 'demand_output.xlsx'); // 保存为 details_output.xlsx
    // } else {
    //     console.log('No details found to save.');
    // }
}

// 运行主函数
main();