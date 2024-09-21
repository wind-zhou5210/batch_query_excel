
# linkge 发布单接口迁移脚本

作用： 生成两个excel

- 发布单-迭代-需求
- 发布单-迭代--应用审批

## 对应脚本

- 发布单-迭代-需求：release_demand_excel.js
- 发布单-迭代--应用审批: release_app_approval_excel.js

## 使用步骤

## 安装node

版本 > 16.20

### 安装依赖

```shell
    npm install
```

### 执行脚本

```shell
 node release_demand_excel.js 
```

```shell
node release_app_approval_excel.js 
```

## 生成文件

- demand_output.xlsx  【发布单-迭代-需求 excel】
- approval_output.xlsx【发布单-迭代--应用审批 excel】
