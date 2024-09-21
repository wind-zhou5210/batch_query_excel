
const axios = require('axios');

const cookie = 'tfstk=f4jrZEto_uEylVZIAL-e3AKGkgxJX3V_UMOBK9XHFQAoPLtnx1OjA6wpFwJeg6dWP9VR8s5AM_65dM7xYOBdV8KQe3BJvHV_1lsFeTKpRA8PCglcnd6mqYm3WzKiuHV_1oMhvn6DxwNAGI3VnIpeKpYltxXDMdDkxQYniqvMiHAhtUqDmd96ELmkKq22pIAHxHcxRBAs0d8uQWa24AkoaUAGEQX5wi0kP4BegmnA0Z8ysDRqxDj2UtH8JkiaRCb9NFOFioiyYtvFgF_z_05FKOQHuMluF1fc86vAkWue_wX5WwY4EuX24Q82FUkEr37hwM8RzveOn3fAWCLukSpVVGTe6El0Zt62ZF7FNSnHNNWcgFsjGctGWsSeShjyuXpc_MjdzX0erKp21-yV5aW6upypZR0KJUQv3Cw8e23prKp21-yqJ2LJXKR_e8C..; undefined__tenant=ThfundPremise; undefined__project=ThfundPremise; isEnableLocale=disabled; LOCALE=zh_CN; authorization=hmac%200000013950-1%3AaWpwWkxJRGtyOUlQanhsYVd5cFFMR3g3MkkzOUpnMkw%3D~0; acLoginFrom=antcloud_login; nav_original_path=; 0000013950__tenant=ThfundPremise; 0000013950__project=ThfundPremise; tenantName=ThfundPremise'
// 获取发布单列表
async function fetchReleaseList() {
    console.log('==========================开始获取发布单列表==========================');
    var config = {
        method: 'get',


        url: 'http://linkeapi.thyun.thfund.com.cn/linke/webapi/releases?tenantId=60efa25718126c3eb835f650&page=1&keyword=&participationType=&status=&type=DAILY',
        headers: {
            'Accept': ' application/json',
            'Accept-Language': ' zh-CN',
            'Connection': ' keep-alive',
            'Cookie': cookie,
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            'Host': 'linkeapi.thyun.thfund.com.cn'
        }
    };

    // try {
    const response = await axios(config);
    return response?.data?.result || []; // 返回列表数据
    // } catch (error) {
    //     // console.error('Error fetching list:', error);
    //     return [];
    // }
}

// 根据ID获取发布单详情
async function fetchReleaseDetailsByExternalId(externalId) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linke/webapi/releaseByExternalId/${externalId}`,
        headers: {
            'Cookie': cookie,
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    // try {
    const response = await axios(config); // 使用ID请求详情接口
    return response?.data?.result; // 返回详情数据
    // } catch (error) {
    //     // console.error(`Error fetching details for ID ${externalId}:`, error);
    //     return null;
    // }
}

// http://linkeapi.thyun.thfund.com.cn/linke/webapi/iteration/release/66e145010358b5272cc5da21

// 根据id 获取发布单下的迭代列表
async function fetchiterationById(id) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linke/webapi/iteration/release/${id}`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': cookie,
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    // console.log('====当前正在请求的发布单ID====', id);
    // try {
    const response = await axios(config);
    return response?.data?.result;
    // } catch (error) {
    //     // console.error(`Error fetching details for ID ${id}:`, error);
    //     return null;
    // }
}

// http://linkeapi.thyun.thfund.com.cn/linke/webapi/iteration/getWorkItems?iterationExternalId=ECI10026689
// 根据 迭代ExternalId 迭代下的需求列表
async function fetchDemandByExternalId(ExternalId) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linke/webapi/iteration/getWorkItems?iterationExternalId=${ExternalId}`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': cookie,
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    // console.log('====当前正在请求的迭代ExternalId====', ExternalId);
    // try {
    const response = await axios(config);
    return response?.data?.result;
    // } catch (error) {
    //     // console.error(`Error fetching details for ID ${ExternalId}:`, error);
    //     return null;
    // }
}

// http://linkeapi.thyun.thfund.com.cn/linke/webapi/tasks/approval?iterationId=66ebd3ae0358b5272cc6013e
// 查询迭代下的审批列表
async function fetchApprovalById(id) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linke/webapi/tasks/approval?iterationId=${id}`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': cookie,
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    console.log('====当前正在请求的迭代ID====', id);
    // try {
    const response = await axios(config);
    return response?.data?.result;
    // } catch (error) {
    //     // console.error(`Error fetching details for ID ${id}:`, error);
    //     return null;
    // }
}

// http://linkeapi.thyun.thfund.com.cn/linkflow/webapi/process/log/ab90edfa-765e-11ef-a6a6-9228587ecc0d
// 查询审批下的发布审批信息
async function fetchRealseApprovalById(id) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linkflow/webapi/process/log/${id}`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': cookie,
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    console.log('====当前正在请求的审批ID====', id);
    // try {
    const response = await axios(config);
    return response?.data?.data;
    // } catch (error) {
    //     // console.error(`Error fetching details for ID ${id}:`, error);
    //     return null;
    // }
}
// http://linkeapi.thyun.thfund.com.cn/linkflow/webapi/task/search?processInstanceId=ab90edfa-765e-11ef-a6a6-9228587ecc0d
// 查询审批下的已完成任务列表
async function fetchRealseApprovalDoneTaskById(id) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linkflow/webapi/task/search?processInstanceId=${id}`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': cookie,
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    console.log('====当前正在请求的审批ID====', id);
    // try {
    const response = await axios(config);
    return response?.data?.data;
    // } catch (error) {
    //     // console.error(`Error fetching details for ID ${id}:`, error);
    //     return null;
    // }
}

// http://linkeapi.thyun.thfund.com.cn/linkflow/webapi/variables?taskId=f61cd5a5-765f-11ef-a6a6-9228587ecc0d
// 查询发布评审任务详情（查询变量）
async function fetchRealseReviewDetailVarByTaskId(taskId) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linkflow/webapi/variables?taskId=${taskId}`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': cookie,
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    console.log('====当前正在请求的发布评审任务taskId====', taskId);
    // try {
    const response = await axios(config);
    return response?.data?.data;
    // } catch (error) {
    //     // console.error(`Error fetching details for ID ${taskId}:`, error);
    //     return null;
    // }
}

// http://linkeapi.thyun.thfund.com.cn/linke/webapi/release/ECR10026717/apps
// 查询发布单下的应用信息
async function fetchRealseAppsByExternalId(ExternalId) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linke/webapi/release/${ExternalId}/apps`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': cookie,
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    console.log(' 正在请求应用信息：====当前正在请求的发布单ExternalId ====', ExternalId);
    // try {
    const response = await axios(config);
    return response?.data?.result;
    // } catch (error) {
    //     // console.error(`Error fetching details for ID ${ExternalId}:`, error);
    //     return null;
    // }
}

module.exports = {
    fetchReleaseList,
    fetchReleaseDetailsByExternalId,
    fetchiterationById,
    fetchDemandByExternalId,
    fetchApprovalById,
    fetchRealseApprovalById,
    fetchRealseApprovalDoneTaskById,
    fetchRealseReviewDetailVarByTaskId,
    fetchRealseAppsByExternalId
}