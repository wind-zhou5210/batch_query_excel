/**
 * 生成发布-迭代-应用-审批 excel 表格
 */
const { fetchReleaseList, fetchReleaseDetailsByExternalId, fetchiterationById, fetchApprovalById, fetchRealseApprovalById, fetchRealseApprovalDoneTaskById, fetchRealseReviewDetailVarByTaskId, fetchRealseAppsByExternalId } = require('./servies.js');
const async = require('async');
const dayjs = require('dayjs');
const { saveListToFile, saveToExcel_approval } = require('./util.js');


// 请求重试函数 
async function fetchWithRetry(fn, id, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn(id);
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${externalId}:`, error);
            if (attempt === retries) throw error; // 如果达到最大重试次数，抛出错误
        }
    }

}

// 根据发布单列表查询详情数据并拼接详情数组
async function createDetailList(releaselist) {
    console.log('==========================开始查询发布单详情信息==========================');
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(releaselist, 30, async (item) => {
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
        list.push(newData);
    });

    return list;
}

// 查询发布单下的迭代数据 并拼接
async function createIterationList(detailsList) {
    console.log('==========================开始查询迭代信息==========================');
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(detailsList, 30, async (item) => {
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
    console.log('==========================开始查询审批列表信息==========================');
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(iterationList, 30, async (item) => {
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
        }
    });
    return list;
}
// 查询审批的发布审批信息 并拼接
async function createReleaseApprovalList(approvalList) {
    console.log('==========================开始查询发布审批信息==========================');
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(approvalList, 30, async (item) => {
        const releaseApprovalInfo = await fetchWithRetry(fetchRealseApprovalById, item.approvalId) || [];
        const newData = {
            ...item,
            releaseApprovalInfo: JSON.stringify(releaseApprovalInfo)
        }
        list.push(newData)
    });
    return list;
}

// 查询审批下已完成任务列表 并拼接发布评审任务id
async function createReviewList(approvalList) {
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(approvalList, 30, async (item) => {
        const releaseApprovalDoneList = await fetchWithRetry(fetchRealseApprovalDoneTaskById, item.approvalId) || [];
        // 找出发布评审任务数据数据
        const release_review_task = releaseApprovalDoneList?.find(item => item.key === 'release-assessment-task');
        const newData = {
            ...item,
            release_review_task_id: release_review_task?.id
        }
        list.push(newData)
    });
    return list;
}
// 查询发布评审任务详情 并拼接
async function createReviewDetailList(approvalList) {
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(approvalList, 30, async (item) => {
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
        list.push(newData)
    });
    return list;
}


// 查询发布单下的应用信息 并拼接
async function createDetailListWithAppInfo(detailsList) {
    const list = [];
    // 使用 async.eachLimit 来限制并发数量
    await async.eachLimit(detailsList, 30, async (item) => {
        const appListsInfo = await fetchWithRetry(fetchRealseAppsByExternalId, item.releaseId) || {};
        const appLists = appListsInfo?.releaseRepos
        const newData = {
            ...item,
            appLists
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
    // saveListToFile(releaselist, 'release_list.json');
    //2.  拼接发布详情数据
    const detailsList = await createDetailList(releaselist.slice(0, 10));
    console.log('详情列表拼接结束=共有', detailsList.length, '条')
    // saveListToFile(detailsList, 'release_detail_list.json');
    //3.  拼接应用信息数据
    const detailListWithAppInfo = await createDetailListWithAppInfo(detailsList);
    console.log('======================应用信息拼接结束=共有', detailListWithAppInfo.length, '条', '======================')
    //4. 拼接迭代数据 【 发布单-迭代 为一对多】
    const iterationList = await createIterationList(detailListWithAppInfo);
    console.log('======================迭代列表拼接结束=共有', iterationList.length, '条', '======================');
    // saveListToFile(iterationList, 'release_iteration_list.json');
    //5. 拼接审批id 信息
    const approvalList = await createApprovalList(iterationList);
    console.log('======================审批列表拼接结束=共有', approvalList.length, '条', '======================');
    // saveListToFile(approvalList, 'release_iteration_withapproval_list.json');
    //6. 拼接发布审批信息 （拼接个json即可）
    const releaseApprovalList = await createReleaseApprovalList(approvalList);
    console.log('======================发布审批列表拼接结束=共有', releaseApprovalList.length, '条', '======================');
    // saveListToFile(releaseApprovalList, 'release_approval_list.json');
    //7. 拼接发布评审任务id
    const reviewList = await createReviewList(releaseApprovalList);
    console.log('评审列表拼接结束=共有', reviewList.length, '条');
    // saveListToFile(reviewList, 'release_review_list.json');
    //8. 拼接 发布评审任务详情信息
    const reviewDetailList = await createReviewDetailList(reviewList);
    console.log('评审详情列表拼接结束=共有', reviewDetailList.length, '条');
    // saveListToFile(reviewDetailList, 'release_review_detail_list.json');
    //9.输出到 Excel 文件
    if (reviewDetailList.length > 0) {
        saveToExcel_approval(reviewDetailList, 'approval_output.xlsx'); // 保存为 details_output.xlsx
    } else {
        console.log('No details found to save.');
    }
}

// 运行主函数
main();