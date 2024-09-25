
const axios = require('axios');

const cookie = 'undefined__tenant=ThfundPremise; undefined__project=ThfundPremise; isEnableLocale=disabled; LOCALE=zh_CN; acLoginFrom=antcloud_login; nav_original_path=; 0000013950__tenant=ThfundPremise; 0000013950__project=ThfundPremise; tenantName=ThfundPremise; JSESSIONID=A9960EFF9840FE2C0ECC6AB9E9A39DB2; tfstk=fI9-G-YUmq0obbcHF3GcKoVWLlnmoLKPHU-_KwbuOELvqhIuZ0-CAkL9X6vHA48ppZLFtaThEyHpkT1eZwblJ9KeWm0iIAxy49WSSVDGffrmSOr7dwahc-s3-HIbbAxy4oZ8RcAjIWdsl93dRe15hoshlWaBRwwjDMs3PWwWRniAYZa7d9_CcsslfwTPy2QbVw2pO1UHZmmmNJepHigF83ETpivR2_Q6VLeQdlsRwNt5uVf75W5XY6pUYJBHVC8FfUaSJwJvcLO65qVlPCIpjBLtCJS2NUpf9KmEInXJMKBkF2PwmnQ56tAmg4fheUdN7_GqueKAre9RGz3c-CxDFsLso-LF9B9lhLgjBgPpIdCphPjVH7ixDWPFNimMTVMDWIYhoiQi2vFUTsoVDNmxDWPFgmSAS038TW52U; authorization=hmac%200000013950-1%3AZ3RTUEZaa05RaGU0dTF3WkpIWW5RcU84eFdudEdnTGM%3D~0; utoken_CLOUD=ACAg4vzVDjZUhn1S%3BVcwCyRrckxD5IhakuhB3rjW5Emepshx-4ChKn_ZgoaLfmhR_t5wLcrxcGJ8zFanE%231727148212231'
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
    const response = await axios(config);
    return response?.data?.result || []; // 返回列表数据
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
    const response = await axios(config); // 使用ID请求详情接口
    return response?.data?.result; // 返回详情数据
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
    const response = await axios(config);
    if ( response?.data?.success===true) {
        return response?.data?.result || [];
    }
    if( response?.data?.success===false) {
        return [];
    }

    return null;
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
    const response = await axios(config);
    return response?.data?.result;
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
    // console.log('====当前正在请求的迭代ID====', id);
    const response = await axios(config);
    if ( response?.data?.success===true) {
        return response?.data?.result || [];
    }
    if( response?.data?.success===false)
     {
        return [];
    }

    return null;
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
    // console.log('====当前正在请求的审批ID====', id);
    const response = await axios(config);
    return response?.data?.data;
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
    // console.log('====当前正在请求的审批ID====', id);
    const response = await axios(config);
    return response?.data?.data;
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
    // console.log('====当前正在请求的发布评审任务taskId====', taskId);
    const response = await axios(config);
    return response?.data?.data;
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
    // console.log(' 正在请求应用信息：====当前正在请求的发布单ExternalId ====', ExternalId);
    const response = await axios(config);
    return response?.data?.result;
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