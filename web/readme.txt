JDI中出现的命名规范
一、层叠样式表
1.id的命名：驼峰命名法、下划线命名法
示例：
    驼峰：loginForm、imgForm、submitModal、publishModal
    下划线：常用于程序动态生成的模块、组件中
        property_id、property_name、property_value（基于配置文件动态生成的属性命名）
        dataSource_static_modal、dataSource_db_modal、events_modal（配置模态框命名）

2.class的命名：横杠命名法，常用于独立性比较强的插件中
示例：
    eg、eg-dialog、eg-content、eg-page、eg-sidebar（表达式生成器命名、eg为expression generator的缩写）
    property、property-group、property-header、property-title、property-body、property-footer（属性栏命名）

二、javascript
1.客户端目录结构
services        =》      数据服务层目录
controllers     =》      业务逻辑层目录
utils           =》      工具类目录
helpers         =》      帮助类目录
modals          =》      模态框目录