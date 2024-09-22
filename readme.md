
# linke 发布单接口迁移脚本

作用： 生成两个excel

- 发布单-迭代-需求
- 发布单-迭代--应用审批

## 对应脚本

- 发布单-迭代-需求：A_release_demand_excel.js
- 发布单-迭代--应用审批: A_release_approval_excel.js

## 使用步骤

## 安装node

版本 > 16.20

### 安装依赖

```shell
    npm install
```

### 执行脚本

```shell
  node A_release_demand_excel.js
```

```shell
  node A_release_approval_excel.js
```

## 日志信息目录

### 需求单相关：/logs/demand/*

- demand_execution_log.txt  总日志目录
- demand_fail_release_list.txt  查询详情失败的发布单 (重试5次后仍然失败)
- demand_empty_release_list.txt  查询的发布单详情为空的数据
- demand_.*.json 为拼接数据过程中的中间日志文件

### 审批单相关 /logs/approval/*

- approval_execution_log.txt  总日志目录
- approval_fail_release_list.txt  查询详情失败的发布单 (重试5次后仍然失败)
- approval_empty_release_list.txt  查询的发布单详情为空的数据
- approval_.*.json 为拼接数据过程中的中间日志文件

### 重试相关目录
- retry_approval_fail_release_list.txt  查询详情失败的发布单 (重试5次后仍然失败)
- retry_approval_empty_release_list.txt  查询的发布单详情为空的数据

- retry_demand_fail_release_list.txt  查询详情失败的发布单 (重试5次后仍然失败)
- retry_demand_empty_release_list.txt  查询的发布单详情为空的数据
## 生成文件

- demand_output.xlsx  【发布单-迭代-需求 excel】
- approval_output.xlsx【发布单-迭代--应用审批 excel】

## 注意

每次执行脚本时，要确保当前的Cookie为最新

每次执行脚本时，要确保当前的Cookie为最新

每次执行脚本时，要确保当前的Cookie为最新

否则会请求失败

重要的事情说三遍。。。
