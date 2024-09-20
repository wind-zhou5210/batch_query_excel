
const axios = require('axios');
// 获取发布单列表
async function fetchReleaseList() {
    var config = {
        method: 'get',
        url: 'http://linkeapi.thyun.thfund.com.cn/linke/webapi/releases?tenantId=60efa25718126c3eb835f650&page=4&keyword=&participationType=&status=&type=DAILY',
        headers: {
            'Accept': ' application/json',
            'Accept-Language': ' zh-CN',
            'Connection': ' keep-alive',
            'Cookie': ' undefined__tenant=ThfundPremise; undefined__project=ThfundPremise; isEnableLocale=disabled; LOCALE=zh_CN; acLoginFrom=antcloud_login; nav_original_path=; 0000013950__tenant=ThfundPremise; 0000013950__project=ThfundPremise; tenantName=ThfundPremise; JSESSIONID=A9960EFF9840FE2C0ECC6AB9E9A39DB2; tfstk=fI9-G-YUmq0obbcHF3GcKoVWLlnmoLKPHU-_KwbuOELvqhIuZ0-CAkL9X6vHA48ppZLFtaThEyHpkT1eZwblJ9KeWm0iIAxy49WSSVDGffrmSOr7dwahc-s3-HIbbAxy4oZ8RcAjIWdsl93dRe15hoshlWaBRwwjDMs3PWwWRniAYZa7d9_CcsslfwTPy2QbVw2pO1UHZmmmNJepHigF83ETpivR2_Q6VLeQdlsRwNt5uVf75W5XY6pUYJBHVC8FfUaSJwJvcLO65qVlPCIpjBLtCJS2NUpf9KmEInXJMKBkF2PwmnQ56tAmg4fheUdN7_GqueKAre9RGz3c-CxDFsLso-LF9B9lhLgjBgPpIdCphPjVH7ixDWPFNimMTVMDWIYhoiQi2vFUTsoVDNmxDWPFgmSAS038TW52U; authorization=hmac%200000013950-1%3AZkVRQ3Jyd0ROemp5bVN1a1RBaW56bnhwR1B1R3dtZnA%3D~0; utoken_CLOUD=ACAg4vzVDjZUhn1S%3BVcwCyRrckxD5IhakuhB3rsQ9qwlLkz89KRdIwC3ygLOEeCbuv1VU9TapAKEt7NQk%231726714201823',
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            'Host': 'linkeapi.thyun.thfund.com.cn'
        }
    };

    try {
        const response = await axios(config);
        return response?.data?.result || []; // 返回列表数据
    } catch (error) {
        console.error('Error fetching list:', error);
        return [];
    }
}

// 根据ID获取发布单详情
async function fetchReleaseDetailsByExternalId(externalId) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linke/webapi/releaseByExternalId/${externalId}`,
        headers: {
            'Cookie': 'undefined__tenant=ThfundPremise; undefined__project=ThfundPremise; isEnableLocale=disabled; LOCALE=zh_CN; acLoginFrom=antcloud_login; nav_original_path=; 0000013950__tenant=ThfundPremise; 0000013950__project=ThfundPremise; tenantName=ThfundPremise; JSESSIONID=A9960EFF9840FE2C0ECC6AB9E9A39DB2; tfstk=fI9-G-YUmq0obbcHF3GcKoVWLlnmoLKPHU-_KwbuOELvqhIuZ0-CAkL9X6vHA48ppZLFtaThEyHpkT1eZwblJ9KeWm0iIAxy49WSSVDGffrmSOr7dwahc-s3-HIbbAxy4oZ8RcAjIWdsl93dRe15hoshlWaBRwwjDMs3PWwWRniAYZa7d9_CcsslfwTPy2QbVw2pO1UHZmmmNJepHigF83ETpivR2_Q6VLeQdlsRwNt5uVf75W5XY6pUYJBHVC8FfUaSJwJvcLO65qVlPCIpjBLtCJS2NUpf9KmEInXJMKBkF2PwmnQ56tAmg4fheUdN7_GqueKAre9RGz3c-CxDFsLso-LF9B9lhLgjBgPpIdCphPjVH7ixDWPFNimMTVMDWIYhoiQi2vFUTsoVDNmxDWPFgmSAS038TW52U; authorization=hmac%200000013950-1%3AZkVRQ3Jyd0ROemp5bVN1a1RBaW56bnhwR1B1R3dtZnA%3D~0; thsso_access_authorization=eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJsb2dpblRpbWUiOjE3MjY3MDY4MTA4NjcsImtleWlkIjoiNUY5OTI1RjVCRTRGNEY2MzkwMEQ4OUI4RENFNDVDREMiLCJ1c2VyaWQiOiJ3Yl96aG91emhlbmciLCJpYXQiOjE3MjY3MDY4MTB9.ygGaj34vZ_QTzMU8EUa6FDyTMRbksaXVwrHS5WxBoMnXD37e7DAKGMFgljezTQouQHWiHKzOmX1f0ct_cq5ZHg; utoken_CLOUD=ACAg4vzVDjZUhn1S%3BVcwCyRrckxD5IhakuhB3rsQ9qwlLkz89KRdIwC3ygLMHPuaekPonKCswdIB4B_9x%231726749291194',
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    console.log('====当前正在请求的ID====', externalId);
    try {
        const response = await axios(config); // 使用ID请求详情接口
        return response?.data?.result; // 返回详情数据
    } catch (error) {
        console.error(`Error fetching details for ID ${externalId}:`, error);
        return null;
    }
}

// http://linkeapi.thyun.thfund.com.cn/linke/webapi/iteration/release/66e145010358b5272cc5da21

// 根据id 获取发布单下的迭代列表
async function fetchiterationById(id) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linke/webapi/iteration/release/${id}`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': 'undefined__tenant=ThfundPremise; undefined__project=ThfundPremise; isEnableLocale=disabled; LOCALE=zh_CN; acLoginFrom=antcloud_login; nav_original_path=; 0000013950__tenant=ThfundPremise; 0000013950__project=ThfundPremise; tenantName=ThfundPremise; JSESSIONID=A9960EFF9840FE2C0ECC6AB9E9A39DB2; tfstk=fI9-G-YUmq0obbcHF3GcKoVWLlnmoLKPHU-_KwbuOELvqhIuZ0-CAkL9X6vHA48ppZLFtaThEyHpkT1eZwblJ9KeWm0iIAxy49WSSVDGffrmSOr7dwahc-s3-HIbbAxy4oZ8RcAjIWdsl93dRe15hoshlWaBRwwjDMs3PWwWRniAYZa7d9_CcsslfwTPy2QbVw2pO1UHZmmmNJepHigF83ETpivR2_Q6VLeQdlsRwNt5uVf75W5XY6pUYJBHVC8FfUaSJwJvcLO65qVlPCIpjBLtCJS2NUpf9KmEInXJMKBkF2PwmnQ56tAmg4fheUdN7_GqueKAre9RGz3c-CxDFsLso-LF9B9lhLgjBgPpIdCphPjVH7ixDWPFNimMTVMDWIYhoiQi2vFUTsoVDNmxDWPFgmSAS038TW52U; authorization=hmac%200000013950-1%3AZkVRQ3Jyd0ROemp5bVN1a1RBaW56bnhwR1B1R3dtZnA%3D~0; thsso_access_authorization=eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJsb2dpblRpbWUiOjE3MjY3MDY4MTA4NjcsImtleWlkIjoiNUY5OTI1RjVCRTRGNEY2MzkwMEQ4OUI4RENFNDVDREMiLCJ1c2VyaWQiOiJ3Yl96aG91emhlbmciLCJpYXQiOjE3MjY3MDY4MTB9.ygGaj34vZ_QTzMU8EUa6FDyTMRbksaXVwrHS5WxBoMnXD37e7DAKGMFgljezTQouQHWiHKzOmX1f0ct_cq5ZHg; utoken_CLOUD=ACAg4vzVDjZUhn1S%3BVcwCyRrckxD5IhakuhB3rsQ9qwlLkz89KRdIwC3ygLMHPuaekPonKCswdIB4B_9x%231726749291194',
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    console.log('====当前正在请求的发布单ID====', id);
    try {
        const response = await axios(config);
        return response?.data?.result;
    } catch (error) {
        console.error(`Error fetching details for ID ${id}:`, error);
        return null;
    }
}

// http://linkeapi.thyun.thfund.com.cn/linke/webapi/iteration/getWorkItems?iterationExternalId=ECI10026689
// 根据 迭代ExternalId 迭代下的需求列表
async function fetchDemandByExternalId(ExternalId) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linke/webapi/iteration/getWorkItems?iterationExternalId=${ExternalId}`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': 'undefined__tenant=ThfundPremise; undefined__project=ThfundPremise; isEnableLocale=disabled; LOCALE=zh_CN; acLoginFrom=antcloud_login; nav_original_path=; 0000013950__tenant=ThfundPremise; 0000013950__project=ThfundPremise; tenantName=ThfundPremise; JSESSIONID=A9960EFF9840FE2C0ECC6AB9E9A39DB2; tfstk=fI9-G-YUmq0obbcHF3GcKoVWLlnmoLKPHU-_KwbuOELvqhIuZ0-CAkL9X6vHA48ppZLFtaThEyHpkT1eZwblJ9KeWm0iIAxy49WSSVDGffrmSOr7dwahc-s3-HIbbAxy4oZ8RcAjIWdsl93dRe15hoshlWaBRwwjDMs3PWwWRniAYZa7d9_CcsslfwTPy2QbVw2pO1UHZmmmNJepHigF83ETpivR2_Q6VLeQdlsRwNt5uVf75W5XY6pUYJBHVC8FfUaSJwJvcLO65qVlPCIpjBLtCJS2NUpf9KmEInXJMKBkF2PwmnQ56tAmg4fheUdN7_GqueKAre9RGz3c-CxDFsLso-LF9B9lhLgjBgPpIdCphPjVH7ixDWPFNimMTVMDWIYhoiQi2vFUTsoVDNmxDWPFgmSAS038TW52U; authorization=hmac%200000013950-1%3AZkVRQ3Jyd0ROemp5bVN1a1RBaW56bnhwR1B1R3dtZnA%3D~0; thsso_access_authorization=eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJsb2dpblRpbWUiOjE3MjY3MDY4MTA4NjcsImtleWlkIjoiNUY5OTI1RjVCRTRGNEY2MzkwMEQ4OUI4RENFNDVDREMiLCJ1c2VyaWQiOiJ3Yl96aG91emhlbmciLCJpYXQiOjE3MjY3MDY4MTB9.ygGaj34vZ_QTzMU8EUa6FDyTMRbksaXVwrHS5WxBoMnXD37e7DAKGMFgljezTQouQHWiHKzOmX1f0ct_cq5ZHg; utoken_CLOUD=ACAg4vzVDjZUhn1S%3BVcwCyRrckxD5IhakuhB3rsQ9qwlLkz89KRdIwC3ygLMHPuaekPonKCswdIB4B_9x%231726749291194',
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    console.log('====当前正在请求的迭代ExternalId====', ExternalId);
    try {
        const response = await axios(config);
        return response?.data?.result;
    } catch (error) {
        console.error(`Error fetching details for ID ${ExternalId}:`, error);
        return null;
    }
}

// http://linkeapi.thyun.thfund.com.cn/linke/webapi/tasks/approval?iterationId=66ebd3ae0358b5272cc6013e
// 查询迭代下的审批列表
async function fetchApprovalById(id) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linke/webapi/tasks/approval?iterationId=${id}`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': 'undefined__tenant=ThfundPremise; undefined__project=ThfundPremise; isEnableLocale=disabled; LOCALE=zh_CN; acLoginFrom=antcloud_login; nav_original_path=; 0000013950__tenant=ThfundPremise; 0000013950__project=ThfundPremise; tenantName=ThfundPremise; JSESSIONID=A9960EFF9840FE2C0ECC6AB9E9A39DB2; tfstk=fI9-G-YUmq0obbcHF3GcKoVWLlnmoLKPHU-_KwbuOELvqhIuZ0-CAkL9X6vHA48ppZLFtaThEyHpkT1eZwblJ9KeWm0iIAxy49WSSVDGffrmSOr7dwahc-s3-HIbbAxy4oZ8RcAjIWdsl93dRe15hoshlWaBRwwjDMs3PWwWRniAYZa7d9_CcsslfwTPy2QbVw2pO1UHZmmmNJepHigF83ETpivR2_Q6VLeQdlsRwNt5uVf75W5XY6pUYJBHVC8FfUaSJwJvcLO65qVlPCIpjBLtCJS2NUpf9KmEInXJMKBkF2PwmnQ56tAmg4fheUdN7_GqueKAre9RGz3c-CxDFsLso-LF9B9lhLgjBgPpIdCphPjVH7ixDWPFNimMTVMDWIYhoiQi2vFUTsoVDNmxDWPFgmSAS038TW52U; authorization=hmac%200000013950-1%3AZkVRQ3Jyd0ROemp5bVN1a1RBaW56bnhwR1B1R3dtZnA%3D~0; thsso_access_authorization=eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJsb2dpblRpbWUiOjE3MjY3MDY4MTA4NjcsImtleWlkIjoiNUY5OTI1RjVCRTRGNEY2MzkwMEQ4OUI4RENFNDVDREMiLCJ1c2VyaWQiOiJ3Yl96aG91emhlbmciLCJpYXQiOjE3MjY3MDY4MTB9.ygGaj34vZ_QTzMU8EUa6FDyTMRbksaXVwrHS5WxBoMnXD37e7DAKGMFgljezTQouQHWiHKzOmX1f0ct_cq5ZHg; utoken_CLOUD=ACAg4vzVDjZUhn1S%3BVcwCyRrckxD5IhakuhB3rsQ9qwlLkz89KRdIwC3ygLMHPuaekPonKCswdIB4B_9x%231726749291194',
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    console.log('====当前正在请求的迭代ID====', id);
    try {
        const response = await axios(config);
        return response?.data?.result;
    } catch (error) {
        console.error(`Error fetching details for ID ${id}:`, error);
        return null;
    }
}

// http://linkeapi.thyun.thfund.com.cn/linkflow/webapi/process/log/ab90edfa-765e-11ef-a6a6-9228587ecc0d
// 查询审批下的发布审批信息
async function fetchRealseApprovalById(id) {
    var config = {
        method: 'get',
        url: `http://linkeapi.thyun.thfund.com.cn/linkflow/webapi/process/log/${id}`,
        headers: {
            'Referer': ' http://linkconsole.thyun.thfund.com.cn/', // 从哪个页面跳转过来的
            'Cookie': 'undefined__tenant=ThfundPremise; undefined__project=ThfundPremise; isEnableLocale=disabled; LOCALE=zh_CN; acLoginFrom=antcloud_login; nav_original_path=; 0000013950__tenant=ThfundPremise; 0000013950__project=ThfundPremise; tenantName=ThfundPremise; JSESSIONID=A9960EFF9840FE2C0ECC6AB9E9A39DB2; tfstk=fI9-G-YUmq0obbcHF3GcKoVWLlnmoLKPHU-_KwbuOELvqhIuZ0-CAkL9X6vHA48ppZLFtaThEyHpkT1eZwblJ9KeWm0iIAxy49WSSVDGffrmSOr7dwahc-s3-HIbbAxy4oZ8RcAjIWdsl93dRe15hoshlWaBRwwjDMs3PWwWRniAYZa7d9_CcsslfwTPy2QbVw2pO1UHZmmmNJepHigF83ETpivR2_Q6VLeQdlsRwNt5uVf75W5XY6pUYJBHVC8FfUaSJwJvcLO65qVlPCIpjBLtCJS2NUpf9KmEInXJMKBkF2PwmnQ56tAmg4fheUdN7_GqueKAre9RGz3c-CxDFsLso-LF9B9lhLgjBgPpIdCphPjVH7ixDWPFNimMTVMDWIYhoiQi2vFUTsoVDNmxDWPFgmSAS038TW52U; authorization=hmac%200000013950-1%3AZkVRQ3Jyd0ROemp5bVN1a1RBaW56bnhwR1B1R3dtZnA%3D~0; thsso_access_authorization=eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJsb2dpblRpbWUiOjE3MjY3MDY4MTA4NjcsImtleWlkIjoiNUY5OTI1RjVCRTRGNEY2MzkwMEQ4OUI4RENFNDVDREMiLCJ1c2VyaWQiOiJ3Yl96aG91emhlbmciLCJpYXQiOjE3MjY3MDY4MTB9.ygGaj34vZ_QTzMU8EUa6FDyTMRbksaXVwrHS5WxBoMnXD37e7DAKGMFgljezTQouQHWiHKzOmX1f0ct_cq5ZHg; utoken_CLOUD=ACAg4vzVDjZUhn1S%3BVcwCyRrckxD5IhakuhB3rsQ9qwlLkz89KRdIwC3ygLMHPuaekPonKCswdIB4B_9x%231726749291194',
            'Accept': '*/*',
            'Host': 'linkeapi.thyun.thfund.com.cn',
            'Connection': 'keep-alive'
        }
    };
    console.log('====当前正在请求的审批ID====', id);
    try {
        const response = await axios(config);
        return response?.data?.data;
    } catch (error) {
        console.error(`Error fetching details for ID ${id}:`, error);
        return null;
    }
}


module.exports = {
    fetchReleaseList,
    fetchReleaseDetailsByExternalId,
    fetchiterationById,
    fetchDemandByExternalId,
    fetchApprovalById,
    fetchRealseApprovalById
}