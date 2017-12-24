# 数据 PR 说明

## 应用案例 PR 说明

### 如何填加

在`cases.json`中添加案例时，请先准备以下几个字段：

* `name`: 小程序可被搜索到的名称
* `email`: 能够联系到小程序作者的邮箱
* `link`: 小程序对应的官网链接
* `opensource`: 是否开源。如果是，请填写开源github地址。如果不是，请留空
* `qrcode`: 小程序的二维码地址，推荐使用github issue上传图片，图片使用320*320的透明背景png
* `company`: 该小程序所在的公司

点击[这里](https://github.com/Tencent/wepy/edit/master/docs/data/cases.json)添加案例。

### 排序规则计算

填写的案例信息越完整，展示顺序越靠前。排序计算权重，权重越大，排序越靠前。

1. 属于 BAT 等大厂小程序优先展示，权重 +1000
2. 开源的小程序优化展示，即`opensource`字段不会空的权重 +100
3. 有QRcode的小程序优先展示，即`qrcode`字段不会空的权重 +30
4. 有官网链接的小程序优先展示，即`link`字段不会空的权重 +20
4. 填写了`company`字段的，权重 +20
5. 填写了email字段的，权重 +10

剩下权重计算 `name` 字段，encode 后取前8位，并转化成10进制作为权重的小数部分。


## 捐赠 PR 说明

感谢您对WePY的支持，点击[这里](https://github.com/Tencent/wepy/edit/master/docs/data/donate.json)添加捐赠记录。
