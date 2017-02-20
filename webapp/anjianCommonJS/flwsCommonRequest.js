/**
 * Created by christ on 2016/11/4.
 */
//嫌疑人配置
var xyrObj = {
    'TB_ST_RY_WFXYRY': {
        text: '违法嫌疑人',   //表头
        id: 'wfxyr',        //标识
        param: 'xm',        //显示字段
        xxzjbh: 'xxzjbh',   //信息主键编号,数据ZJ
        cldxlb: 1           //处理对象类别
    },
    'TB_ST_DW_WFXYDW': {
        text: '违法嫌疑单位',
        id: 'wfxyrdw',
        param: 'dwmc',
        xxzjbh: 'xxzjbh',
        cldxlb: 2
    },
    'TB_ST_RY_AJXGRY': {
        text: '案事件相关人员',
        id: 'asjxgry',
        param: 'xm',
        xxzjbh: 'xxzjbh',
        cldxlb: 3
    }
};

/*************呈请报告(法律文书)接口********************/

/**
 * 获取呈请报告、法律文书 公共数据 新增使用(需要修改)
 */
function getCqbgFlwsAllXxData(render) {
    if (!DATA.publicJkXx) {
        DATA.ajax.count++;
        $.ajax({
            url: pathConfig.basePath + '/api/ajxx/cqbg_all_in_one/' + DATA.asjbh,
            type: 'get',
            async: true,
            success: function (data) {
                if (data) {
                    DATA.publicJkXx = data;//公共接口信息
                } else {
                    $.messager.show({
                        title: '提示',
                        msg: '获取信息为空',
                        icon: 'warning'
                    })
                }
                DATA.ajax.count--;
                render();
            },
            error: function () {
                console.log('获取呈请报告公共信息失败')
            }
        })
    } else {
        render();
    }
}


/**
 * 所有接口请求回调函数  全部ajax成功之后渲染数据
 */
function callbackForAllAjaxQuerySuccess() {
    if (DATA.ajax.count == 0) {
        if (DATA.CQBG.cqbgZj == undefined) {
            cqbgNrXxfy();//呈请报告内容接口请求信息复用
            cqbgFlwsOtherXxfy();//呈请报告、法律文书其他公共接口数据复用
            $('#loadingMskFlws').hide();
        }
    }
}

/**
 * 呈请报告、法律文书 前后置关系请求接口
 */
function flwsQhzgxRequest() {
    DATA.ajax.count++;
    $.ajax({
        url: pathConfig.basePath + '/wenshu/source/RULE',
        dataType: 'json',
        type: 'get',
        success: function (data) {
            DATA.ajax.count--;
            DATA.RULE = data;
        }
    })
}

/**
 * 获取登录者信息
 */
function getLoginInfo() {
    DATA.ajax.count++;
    //获取登录者信息
    $.ajax({
        url: pathConfig.basePath + '/base/autotable/getUserInfo',
        dataType: 'json',
        type: 'post',
        success: function (data) {
            DATA.ajax.count--;
            DATA.OWN = data;
        }
    });
}