var axios = require('axios');

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

axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
        console.log(error);
    });

    