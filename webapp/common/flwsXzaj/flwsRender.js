/**
 * Created by christ on 2016/12/7.
 * description：法律文书新增、编辑页面渲染js文件
 */

/*********************************呈请报告**************************************/
/**
 * 呈请报告、法律文书页面  初始化渲染
 */
function getCqbgFlwsHtmlPage() {
    /***呈请报告***/
    var cqbgstr = '';
    var cqbgData = DATA.CQBG.cqbgData;//呈请报告数据
    if (!jQuery.isEmptyObject(cqbgData)) {
        //呈请报告字符串
        var cqbgcon = getHtmlByAjax(cqbgData.url);
        cqbgstr = '<div class="flws-tabs-title" id="flws_cqbg" title="' + cqbgData.name + '">' +
            '<div class="flws-main-con">' +
            '<div class="flws-main-con-l" id="cqbg_xyr_con"></div>' +
            '<div class="flws-main-con-r" id="cqbg_main_con">' + cqbgcon +
            '<div class="save-btn-bottom">' +
            '<a href="javascript:;" id="save_cqbg" style="width: 625px;" class="easyui-linkbutton c6">呈请报告保存</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    $("#flwsTabs").append(cqbgstr);

    $("#flwsTabs .save-btn-bottom a").linkbutton();

    /***法律文书***/
    var flwsstr = '';
    var flwsData = DATA.FLWS.flwsData;//法律文书数据
    if (!jQuery.isEmptyObject(flwsData)) {
        var flwsTmpArray = [];//法律文书临时数组
        for (var k in flwsData) {
            flwsTmpArray.push(flwsData[k]);
        }
        var sortedFlwsData = flwsTmpArray.sort(compare('bianMa'));
        //法律文书字符串
        for (var a = 0; a < sortedFlwsData.length; a++) {
            flwsstr = '<div class="flws-tabs-title" title="' + sortedFlwsData[a].name + '">' +
                '<div class="flws-main-con">' +
                '<div class="flws-main-con-l flws_xyr_area flws_xyr_area_add" id="flws_xyr_area_' + sortedFlwsData[a].bianMa + '">' +
                '</div>' +
                '<div class="flws-main-con-r" style="position: relative;"  id="flws_main_con_r_' + sortedFlwsData[a].bianMa + '">' +
                '</div>' +
                '</div>' +
                '</div>';
            $("#flwsTabs").append(flwsstr);
            flwsRightPageRenderForAdd(sortedFlwsData[a]);
        }
    }

    setPage();//设置页面高度
    $('#flwsTabs').css({height: '100%', width: '100%'}).tabs({
        plain: true, pill: true, border: false
    });

}

/*********************************(呈请报告)*************************************/
/**
 * 呈请报告页面  easyui组件、公共接口数据回填 渲染
 */
function cqbgPageRender() {
    //呈请报告input组件 easyui初始化组件
    var cqbgIpts = $('#cqbg_main_con form input');

    //受案登记表的特殊处理
    if (DATA.CQBG.cqbgData.tableName != 'TB_ST_ASJ_CQBG') {
        loading('open', '正在获取数据...');
        $.ajax({
            url: pathConfig.basePath + '/wenshu/source/CQBG/INFO',
            data: {
                xxzjbh: DATA.CQBG.cqbgRow.CQBG_ZJ
            },
            success: function (data) {
                loading('close');
                var json = eval('(' + data + ')');
                //呈请报告只能做一份儿，并且已呈请的判断(//受案登记表的特殊处理)
                if (json.cqzt && json.cqzt != '0' && DATA.CQBG.cqbgData.one) {
                    $.messager.alert({
                        title: '提示',
                        msg: DATA.CQBG.cqbgData.name + '：已经呈请，无需再呈请',
                        icon: 'warning',
                        fn: function () {
                            crossCloseTab();
                        }
                    });
                }
            }
        })
    } else {
        //呈请报告只能做一份儿，并且已呈请的判断
        if (DATA.CQBG.cqbgRow.CQZT && DATA.CQBG.cqbgRow.CQZT != '0' && DATA.CQBG.cqbgData.one) {
            $.messager.alert({
                title: '提示',
                msg: DATA.CQBG.cqbgData.name + '：已经呈请，无需再呈请',
                icon: 'warning',
                fn: function () {
                    crossCloseTab();
                }
            });
        }
    }

    //判断是否为自定义页面
    if (DATA.CQBG.cqbgData.customized) {
        //自定义页面的渲染，由各自的js文件单独单独处理，这里只负责传值
        eval("render" + DATA.CQBG.cqbgData.bianMa + "CustomizedPage('" + JSON.stringify(DATA.CQBG.cqbgRow) + "')");
    } else {
        if (!DATA.CQBG.cqbgZj) {//新增渲染
            easyuiReset(cqbgIpts, true, '');
            cqbgFlwsOtherXxfy();//呈请报告、法律文书其他公共接口数据复用
        } else {//编辑渲染
            easyuiReset(cqbgIpts, false, '');
            cqbgDataXxfy();//呈请报告数据信息复用

            //呈请报告嫌疑对象的勾选
            if (DATA.CQBG.cqbgRow.XYRID) {
                var interval = setInterval(function () {
                    if (DATA.DX && DATA.DX.hasData) {//必须保证嫌疑人列表已经渲染
                        cqbgXyrDataXxfy(DATA.CQBG.cqbgRow.XYRID);//呈请报告嫌疑人信息复用
                        clearInterval(interval);
                    }
                }, 10);
            }
        }
    }

    loading('close');
    //绑定呈请报告保存事件
    $('#save_cqbg').off('click').on('click', function () {
        saveCqbg();
    });
}

/**
 * 嫌疑对象列表渲染（呈请报告）
 */
function xydxRenderCqbg() {
    var xydxDatas = DATA.DX.xydxData;//嫌疑对象数据
    var xyrListStr = '';//嫌疑人list字符串

    if (xydxDatas && DATA.DX.dxbm && typeof DATA.CQBG.cqbgData != 'undefined') {
        for (var k in xydxDatas) {
            for (var key in xyrObj) {
                if (k == key) {
                    var xyrStr = '';
                    for (var i = 0; i < xydxDatas[k].length; i++) {
                        if (key == anjianXyDxDic.xyr) {//嫌疑人的显示组合信息
                            var xyrzhxx = filedToParagraph(xydxDatas[k][i], DATA.CQBG.cqbgData.prefixpz, DATA.CQBG.cqbgData.splitpz);
                            xyrStr += xydxStrTmpFun(xydxDatas[k][i].title, xydxDatas[k][i].disabled, xydxDatas[k][i][xyrObj[key].xxzjbh], xyrObj[key].id, xyrzhxx, xydxDatas[k][i][xyrObj[key].param], false);
                            // } else if (key == anjianXyDxDic.xydw || key == anjianXyDxDic.ajxgr) {//嫌疑单位或者案件相关人
                        } else {//嫌疑单位或者案件相关人
                            xyrStr += xydxStrTmpFun('', '', xydxDatas[k][i][xyrObj[key].xxzjbh], xyrObj[key].id, '', xydxDatas[k][i][xyrObj[key].param], false);
                        }
                    }
                    xyrListStr += '<div><p><i class="fa fa-bars"></i>' + xyrObj[key].text + '</p>' +
                        '<ul class="xyrList ' + xyrObj[key].id + '" ids=' + xyrObj[key].id + '>' + xyrStr + '</ul></div>'
                }
            }
        }

        //呈请报告嫌疑人列表展示
        $('#cqbg_xyr_con').append(xyrListStr);

        //已呈请样式(呈请报告的前后置关系)
        $('#cqbg_xyr_con ul.xyrList').find("label[disabled='disabled']").tooltip({position: 'right'});

        //嫌疑对象的勾选
        $('#cqbg_xyr_con ul.xyrList input:checkbox').off('click').on('click', function () {
            xyrCheckedXxfy($(this));//呈请报告 嫌疑人勾选呈请报告信息复用
        });
    }
}

/**
 * 呈请报告 犯罪嫌疑人勾选组合信息的复用
 */
function xyrCheckedXxfy($this) {
    var parentDiv = $this.parent().parent().parent().parent();//父级div
    var parentLi = $this.parent().parent();//父级li

    if (DATA.ajax.count > 0) {
        console.log('信息复用中');
        return;
    }

    var xyrxmData = '';
    var xyridData = '';
    var xyrxmArry = [];//嫌疑人姓名
    var xyridArry = [];//嫌疑人ID
    var checkXyr = [];

    var xydxZhxx = $this.next().attr('xyrzhxx');//嫌疑对象组合信息

    var isCheck = $this.prop('checked');//当前checkbox框是否勾选
    //勾选嫌疑人
    if (isCheck) {//选中
        var textareaVal = $("#cqbg_main_con form textarea").val();

        /***********end************/
        checkXyr = $this.parent().parent().parent().find('input:checked');

        //同一时间只能操作一个嫌疑对象类别
        parentDiv.show();
        parentDiv.siblings().hide();

        //单选的处理 DX：true
        if (!DATA.CQBG.cqbgData.dx) {
            parentLi.siblings().find('input:checked').attr('checked', false);//单选
            checkXyr = $this.parent().parent().parent().find('input:checked');
        }

        //必须勾选的校验
        DATA.CQBG["status"]["selected"] = true;

        //已勾选的嫌疑人姓名和id的处理
        for (var i = 0; i < checkXyr.length; i++) {
            xyrxmData = $(checkXyr[i]).next().text();
            xyridData = $(checkXyr[i]).attr('xxzjbh');
            xyrxmArry.push(xyrxmData);
            xyridArry.push(xyridData);
        }
        DATA.CQBG.xyrxms = xyrxmArry;
        DATA.CQBG.xyrids = xyridArry;

        //自定义页面的处理(传递当前选中的嫌疑对象数据)  【会见犯罪嫌疑人申请表】
        if (DATA.CQBG.cqbgData.customized) {
            //获取当前选中的嫌疑对象的数据
            var xydxData, xydxCheckData;
            var xyrType = $this.next().attr('xyrtype');//嫌疑人类型
            var xyrXxzjbh = $this.attr('xxzjbh');//嫌疑人信息主键编号
            for (var k in xyrObj) {
                if (xyrType == xyrObj[k].id) {
                    xydxData = DATA.DX.xydxData[k];//嫌疑对象数据
                    DATA.CQBG.xyrlb = xyrObj[k].cldxlb;
                }
            }

            for (var l = 0; l < xydxData.length; l++) {
                if (xyrXxzjbh == xydxData[l].xxzjbh) {
                    xydxCheckData = xydxData[l];
                    break;
                }
            }

            eval("render" + DATA.CQBG.cqbgData.bianMa + "CustomizedDx('" + JSON.stringify(xydxCheckData) + "')");
            return;
        }

        if (!DATA.CQBG.cqbgZj) {
            /*******行政案件组合信息拼接*******/
            if (DATA.CQBG.cqbgData.xyrpz || DATA.CQBG.cqbgData.xydwpz || DATA.CQBG.cqbgData.xgrpz) {//行政案件组合信息复用
                cqbgXydxZhxxFyForXzaj($this, textareaVal);
                /***嫌疑对象接口信息的复用***/
                var textareaValNew = $("#cqbg_main_con form textarea").val();
                xydxXxfyCqbg(textareaValNew, $this);
            } else {
                /*****刑事案件组合信息复用*****/
                var xyrZhxxData = '\t' + xydxZhxx + '\n';
                $("#cqbg_main_con form textarea").val(xyrZhxxData + textareaVal);
                /***嫌疑对象接口信息的复用***/
                xydxXxfyCqbg(xyrZhxxData + textareaVal, $this);
            }
        } else {
            var xydxXxzjbh = $this.attr('xxzjbh');//当前嫌疑对象信息主键编号
            var xyrids = DATA.CQBG.cqbgRow.XYRID;//已经勾选的嫌疑对象id
            var xyridArray = [];

            if (xyrids) {//嫌疑人id可能为多个
                if (xyrids.indexOf(',') == -1) {
                    xyridArray.push(xyrids);
                } else {
                    xyridArray = xyrids.split(',');
                }
            }

            //其他嫌疑对象的勾选
            if (jQuery.inArray(xydxXxzjbh, xyridArray) == -1) {
                /*******行政案件组合信息拼接*******/
                if (DATA.CQBG.cqbgData.xyrpz || DATA.CQBG.cqbgData.xydwpz || DATA.CQBG.cqbgData.xgrpz) {//行政案件组合信息复用
                    cqbgXydxZhxxFyForXzaj($this, textareaVal);
                } else {
                    /*****刑事案件组合信息复用*****/
                    var xyrZhxxData = '\t' + xydxZhxx + '\n';
                    $("#cqbg_main_con form textarea").val(xyrZhxxData + textareaVal);
                    /***嫌疑对象接口信息的复用***/
                    xydxXxfyCqbg(xyrZhxxData + textareaVal, $this);
                }
            }

            //已经勾选的嫌疑对象的勾选
            // if(jQuery.inArray(xydxXxzjbh,xyridArray) > -1){
            //     for(var j=0;j<xyridArray.length;j++){
            //         var isChecked = $('#cqbg_xyr_con ul.xyrList').find("input[xxzjbh=" + xyridArry[j] + "]").prop('checked');
            //         if(!isChecked){
            //             /*******行政案件组合信息拼接*******/
            //             if(DATA.CQBG.cqbgData.xyrpz || DATA.CQBG.cqbgData.xydwpz || DATA.CQBG.cqbgData.xgrpz){//行政案件组合信息复用
            //                 cqbgXydxZhxxFyForXzaj($this,textareaVal);
            //             }else {
            //                 /*****刑事案件组合信息复用*****/
            //                 var xyrZhxxData = '\t' + xydxZhxx +'\n';
            //                 $("#cqbg_main_con form textarea").val(xyrZhxxData + textareaVal);
            //             }
            //         }
            //     }
            // }
        }

    } else {//未选中
        checkXyr = $this.parent().parent().parent().find('input:checked');

        //已勾选的嫌疑人姓名和id的处理
        for (var i = 0; i < checkXyr.length; i++) {
            xyrxmData = $(checkXyr[i]).next().text();
            xyridData = $(checkXyr[i]).attr('xxzjbh');
            xyrxmArry.push(xyrxmData);
            xyridArry.push(xyridData);
        }

        DATA.CQBG.xyrxms = xyrxmArry;
        DATA.CQBG.xyrids = xyridArry;

        if (parentDiv.find('input:checked').length == 0) {
            DATA.CQBG["status"]["selected"] = false;
            //同一时间只能操作一个
            parentDiv.show();
            parentDiv.siblings().show();
        } else if (parentDiv.find('input:checked').length > 0) {
            DATA.CQBG["status"]["selected"] = true;
        }
        //呈请报告嫌疑对象内容去掉
        var textareaVal = $("#cqbg_main_con form textarea").val();
        if (DATA.CQBG.xydxZhxx && typeof DATA.CQBG.xydxZhxx != 'undefined') {//行政案件处理
            textareaVal = textareaVal.replace('\t' + DATA.CQBG.xydxZhxx + '\n', '');
        } else {
            textareaVal = textareaVal.replace('\t' + xydxZhxx + '\n', '');
        }
        $("#cqbg_main_con form textarea").val(textareaVal);
    }
}


/********************************end******************************/

/*******************************法律文书************************************/

/**
 * 法律文书tab的切换
 */
function tabSwitch() {
    $("#flwsTabs").tabs({
        onSelect: function (title, index) {
            if (DATA.CQBG.cqbgData.bianMa != '000000' || typeof (DATA.CQBG.cqbgData) != 'undefined') {//有呈请报告
                if (index > 0) {//操作法律文书
                    if (!DATA.CQBG.cqbgZj) {//呈请报告主键还未生成
                        $.messager.alert({
                            title: '提示',
                            msg: '请先保存呈请报告，再操作法律文书',
                            fn: function () {
                                $(this).removeClass('tabs-selected');
                                $("#flwsTabs").tabs('select', 0)
                            }
                        })
                    } else {//已经有呈请报告主键
                        DATA.FLWS.title = title;
                        queryFlwsData(title, flwsPageRender);
                    }
                }
            } else {//无呈请报告
                DATA.FLWS.title = title;
                queryFlwsData(title, flwsPageRender);
            }
        }
    })
}

/**
 * 特殊类型
 * 无呈请报告，只有一个法律文书的的渲染
 */
function onlyFlwsRender() {
    var title = DATA.FLWS.flwsData.customer.name;
    DATA.FLWS.title = title;
    queryFlwsData(title, flwsPageRender);
}

/**
 * 法律文书 嫌疑人对象列表、页面的渲染
 * @param bm 法律文书的编码
 */
function flwsPageRender(bm) {
    //当前法律文书的数据对象
    var flwsData = DATA.FLWS[bm].flwsData;

    /*****************法律文书的各种组合类型********************/

    if (flwsData.wdx) {
        if (flwsData.only) {
            checkBtflwsRuleSelected(bm);
            /**类型A**/
                //法律文书无嫌疑对象，法律文书只能做一份儿（ wdx：true && only：true）
            flwsDxListRenderA(bm);
            flwsPageRenderA(bm);
        } else if (!flwsData.only) {//(无呈请报告，无对象，法律文书可以做多份儿)
            //法律文书无嫌疑对象，法律文书可以做多份儿（ wdx：true && only：false）
            flwsDxListRenderA(bm);
            flwsPageRenderA(bm);
        }
    } else if (!flwsData.wdx && flwsData.only && !flwsData.dx) {
        /**类型B**/
            //法律文书有嫌疑对象，不能多选,法律文书只能做一份儿（ wdx：false && only：true && dx:false）
        flwsDxListRenderB(bm);
        flwsPageRenderA(bm);
    } else if (!flwsData.wdx && flwsData.dx && flwsData.only) {
        /**类型C**/
            //法律文书有嫌疑对象，可以多选,法律文书只能做一份儿（ wdx：false && only：true && dx:true）
        flwsDxListRenderC(bm);
        flwsPageRenderA(bm);
    } else {
        /**其他类型**/
            //法律文书有嫌疑对象，法律文书可以做多份儿（ wdx：false && only：false）
        flwsDxListRenderOther(bm);
    }

    cqbgFlwsOtherXxfy();//呈请报告、法律文书其他公共接口数据复用
}

/**********************类型A************************/
/**
 * 法律文书对象列表的渲染方法A
 * @param bm 法律文书编码
 */
function flwsDxListRenderA(bm) {
    $('#flws_xyr_area_' + bm).hide();
    $('#flws_main_con_r_' + bm).css({width: '100%'});
    $('#flws_cl_area_' + bm).css({height: '100%', width: '100%'}).tabs();
    $('#flws_cl_area_' + bm + ' .tabs-panels .panel').css('width', '1168px');
    $('#flws_cl_area_' + bm + ' .tabs-panels .panel .panel-body').css('width', '1168px');
}

/**
 * 法律文书页面的渲染方法A
 * @param bm 法律文书编码
 */
function flwsPageRenderA(bm) {
    //是否有法律文书的数据
    var flwsRow = DATA.FLWS[bm].flwsRow;

    if (flwsRow.length == 0 || typeof flwsRow == 'undefined') {//无数据
        //新增标识
        DATA.FLWS[bm]['status']['isAdd'] = true;

        //新增渲染
        flwsRightPageRenderForAdd(DATA.FLWS[bm].flwsData);
        cqbgFlwsOtherXxfy();//呈请报告、法律文书其他公共接口数据复用
    } else if (flwsRow.length > 0) {//有数据
        //编辑标识
        DATA.FLWS[bm]['status']['isAdd'] = false;

        //法律文书主键
        var flwsZj = flwsRow[0].ZJ;
        DATA.FLWS[bm].flwsZj = flwsZj;
        DATA.FLWS[bm].params = {
            ZJ: flwsZj
        };

        //编辑渲染
        flwsRightPageRenderForEdit(DATA.FLWS[bm].flwsData);

        //法律文书数据信息复用
        flwsDataXxfy(bm, flwsZj);
    }
}
/**********************END ************************/

/**
 * 判斷必填法律文書是否填寫
 * @param bm  法律文書編碼
 */
function checkBtflwsRuleSelected(bm) {
    //法律文書必選及規則【法律文書關聯規則】可參考法律文書取保候審
    if (typeof DATA.CQBG.btflwsRuleSelected != 'undefined' && DATA.CQBG.btflwsRuleSelected) {
        var flwsMainBm = DATA.CQBG.btflwsRuleSelected.BM.split(",")[0];
        if (bm != flwsMainBm) {
            for (var key in DATA.FLWS.flwsData) {
                if (DATA.FLWS.flwsData[key].bianMa == flwsMainBm) {
                    var param = {
                        CQBG_ZJ: DATA.CQBG.cqbgZj,
                        XT_ZXBZ: '0'
                    };
                    param[DATA.CQBG.btflwsRuleSelected.FIELD] = DATA.CQBG.btflwsRuleSelected.VALUE;
                    $.ajax({
                        url: DATA.FLWS.flwsData[key].queryUrl,
                        data: param,
                        dataType: 'json',
                        async: false,
                        success: function (json) {
                            if (json.state == 'success') {
                                var flwsRow = json.rows;
                                if (flwsRow.length == 0) {
                                    $.messager.alert({
                                        title: '提示',
                                        msg: "请先填写" + DATA.FLWS.flwsData[key].name,
                                        icon: 'warning',
                                        fn: function () {
                                            $("#flwsTabs").tabs('select', DATA.FLWS.flwsData[key].name)
                                        }
                                    });
                                }
                            }
                        }
                    });
                    break;
                }
            }
        } else {
            for (var index = 0; index < DATA.CQBG.btflwsRule.length; index++) {
                var flwsOther = DATA.CQBG.btflwsRule[index];
                var flwsOtherMainBm = flwsOther.BM.split(",")[0];
                if (flwsOtherMainBm != flwsMainBm) {
                    for (var key in DATA.FLWS.flwsData) {
                        if (DATA.FLWS.flwsData[key].bianMa == flwsOtherMainBm) {
                            var param = {
                                CQBG_ZJ: DATA.CQBG.cqbgZj,
                                XT_ZXBZ: '0'
                            };
                            param[flwsOther.FIELD] = flwsOther.VALUE;
                            $.ajax({
                                url: DATA.FLWS.flwsData[key].queryUrl,
                                data: param,
                                dataType: 'json',
                                async: false,
                                success: function (json) {
                                    if (json.state == 'success') {
                                        var flwsRow = json.rows;
                                        for(var xylx in xydxDatas){
                                            for (var i=0;i<xydxDatas[xylx].length;i++) {
                                                var xyrdx = xydxDatas[xylx][i];
                                                var has = false;
                                                for (var k in flwsRow) {
                                                    if (flwsRow[k].CLDX_XXZJBH == xyrdx.xxzjbh) {
                                                        has = true;
                                                    }
                                                }
                                                if (has) {
                                                    xyrdx.disabled = 'disabled="disabled"';
                                                    xyrdx.title = "title='此人已做" + DATA.FLWS.flwsData[key].name + "，不能做该法律文书'";
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                            break;
                        }
                    }
                }
            }
        }
    }
}

/********************其他类型************************/
/**
 * 法律文书对象列表的渲染方法 Other
 * @param bm
 */
function flwsDxListRenderOther(bm) {
    //法律文书右侧页面DOM树清空
    $('#flws_xyr_area_' + bm).html('');

    //后台查询回来的法律文书数据
    var flwsRow = DATA.FLWS[bm].flwsRow;
    for(var xylx in DATA.DX.xydxData){
        var xydxDatas=DATA.DX.xydxData[xylx];
        for(var i=0;i<xydxDatas.length;i++){
            xydxDatas[i].fyFlwsData=undefined;
        }
    }
    //嫌疑对象数据
    var xydxDatas = jQuery.extend(true, {}, DATA.DX.xydxData);
    // if (DATA.FLWS[bm].flwsData.wdx) {
    //     $('#flws_xyr_area_' + bm).hide();
    //     $('#flws_main_con_r_' + bm).css({width: '100%'});
    //     $('#flws_cl_area_' + bm).css({height: '100%', width: '100%'}).tabs();
    //     return;
    // }

    //法律文書必選及規則【法律文書關聯規則】可參考法律文書取保候審
    if (typeof DATA.CQBG.btflwsRuleSelected != 'undefined' && DATA.CQBG.btflwsRuleSelected) {
        var flwsMainBm = DATA.CQBG.btflwsRuleSelected.BM.split(",")[0];
        if (bm != flwsMainBm) {
            for (var key in DATA.FLWS.flwsData) {
                if (DATA.FLWS.flwsData[key].bianMa == flwsMainBm) {
                    var param = {
                        CQBG_ZJ: DATA.CQBG.cqbgZj,
                        XT_ZXBZ: '0'
                    };
                    param[DATA.CQBG.btflwsRuleSelected.FIELD] = DATA.CQBG.btflwsRuleSelected.VALUE;
                    $.ajax({
                        url: DATA.FLWS.flwsData[key].queryUrl,
                        data: param,
                        dataType: 'json',
                        async: false,
                        success: function (json) {
                            if (json.state == 'success') {
                                var flwsRow = json.rows;

                                for(var xylx in xydxDatas){
                                    for (var i =0;i<xydxDatas[xylx].length;i++) {
                                        var xyrdx = xydxDatas[xylx][i];
                                        var has = false;
                                        for (var k=0;k<flwsRow.length;k++) {
                                            if (flwsRow[k].CLDX_XXZJBH == xyrdx.xxzjbh) {
                                                has = true;
                                                DATA.DX.xydxData[xylx][i].fyFlwsData = flwsRow[k];
                                            }
                                        }
                                        if (!has) {
                                            xyrdx.disabled = 'disabled="disabled"';
                                            xyrdx.title = "title='此人未做" + DATA.FLWS.flwsData[key].name + "，不能做该法律文书'";
                                        }
                                    }
                                }
                            }
                        }
                    });
                    break;
                }
            }
        } else {
            for (var index = 0; index < DATA.CQBG.btflwsRule.length; index++) {
                var flwsOther = DATA.CQBG.btflwsRule[index];
                var flwsOtherMainBm = flwsOther.BM.split(",")[0];
                if (flwsOtherMainBm != flwsMainBm) {
                    for (var key in DATA.FLWS.flwsData) {
                        if (DATA.FLWS.flwsData[key].bianMa == flwsOtherMainBm) {
                            var param = {
                                CQBG_ZJ: DATA.CQBG.cqbgZj,
                                XT_ZXBZ: '0'
                            };
                            param[flwsOther.FIELD] = flwsOther.VALUE;
                            $.ajax({
                                url: DATA.FLWS.flwsData[key].queryUrl,
                                data: param,
                                dataType: 'json',
                                async: false,
                                success: function (json) {
                                    if (json.state == 'success') {
                                        var flwsRow = json.rows;
                                        for(var xylx in xydxDatas){
                                            for (var i in xydxDatas[xylx]) {
                                                var xyrdx = xydxDatas[xylx][i];
                                                var has = false;
                                                for (var k in flwsRow) {
                                                    if (flwsRow[k].CLDX_XXZJBH == xyrdx.xxzjbh) {
                                                        has = true;
                                                    }
                                                }
                                                if (has) {
                                                    xyrdx.disabled = 'disabled="disabled"';
                                                    xyrdx.title = "title='此人已做" + DATA.FLWS.flwsData[key].name + "，不能做该法律文书'";
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                            break;
                        }
                    }
                }
            }
        }
    }

    //申明未处理嫌疑对象，已处理嫌疑对象
    var wclXyrStr = '', yclXyrStr = '';

    if (xydxDatas) {
        /**
         * 1、如果当前法律文书有数据，根据当前文书地类型，渲染未处理嫌疑人对象列表类型
         * 2、如果当前法律文书没有数据，则多个列表全部显示出来
         */
        if (flwsRow.length > 0) {//1  编辑渲染
            //勾选过嫌疑对象
            if (flwsRow[0].CLDXLB) {
                /***已处理嫌疑对象列表渲染***/
                var xyrObjTemp;
                var xyrStr = '';
                var dxLb = '';
                for (var key in xyrObj) {
                    if (flwsRow[0].CLDXLB == xyrObj[key].cldxlb) {
                        //同一时间勾选法律文书嫌疑人，只能操作一种，所以取第一条数据判断类别就可以
                        DATA.FLWS[bm].xyrBm = key;
                        DATA.FLWS[bm].xyrData = (xydxDatas[key]);
                        xyrObjTemp = xyrObj[key];
                        dxLb = key;
                    }
                }

                for (var i = 0; i < flwsRow.length; i++) {

                    if (DATA.FLWS[bm].status.currentFlwsId != undefined && DATA.FLWS[bm].status.currentFlwsId == flwsRow[i].ZJ) {
                        DATA.FLWS[bm].status.currentDxId = flwsRow[i].CLDX_XXZJBH;
                    }
                    var disabled = "";
                    var title = "";
                    var isShowDelete = true;//[是否显示删除按钮]
                    if ((flwsRow[i].CQBG_ZJ == undefined && Number(flwsRow[i].CQZT) > 0) || (typeof DATA.CQBG.cqbgZj != 'undefined' && flwsRow[i].CQBG_ZJ != DATA.CQBG.cqbgZj) || (flwsRow[i].CQBG_ZJ != DATA.CQBG.cqbgzj)) {
                        if (DATA.FLWS.cqFlwsZj) {//【呈请法律文书修改】
                            disabled = "";
                            title = "";
                            isShowDelete = false;
                        } else {
                            disabled = "disabled='disabled'";
                            title = "title='已呈请法律文书，不能修改'";
                        }
                    }
                    //console.log('已处理对象违法嫌疑人参数',flwsRow[i],xyrObjTemp);//[(xyrObjTemp.param).toUpperCase()]
                    //嫌疑对象名称拼接
                    var xydxArrayTmp = DATA.DX.xydxData[dxLb];
                    var xydxMc = '';
                    var isSkip = false;//是否跳過該已處理對象
                    for (var q = 0; q < xydxArrayTmp.length; q++) {
                        if (xydxArrayTmp[q].xxzjbh == flwsRow[i].CLDX_XXZJBH) {
                            if (DATA.CQBG.btflwsRuleSelected != undefined) {
                                //法律文書必選及規則
                                var flwsMainBm = DATA.CQBG.btflwsRuleSelected.BM.split(",")[0];
                                if (flwsMainBm == bm && $("." + DATA.CQBG.btflwsRuleSelected.FIELD).length == 0 && flwsRow[i][DATA.CQBG.btflwsRuleSelected.FIELD] != DATA.CQBG.btflwsRuleSelected.VALUE) {
                                    isSkip = true;
                                    break;
                                }
                            }
                            if (dxLb == anjianXyDxDic.xyr) {
                                xydxMc = xydxArrayTmp[q][xyrObj[anjianXyDxDic.xyr].param]
                            } else if (dxLb == anjianXyDxDic.xydw) {
                                xydxMc = xydxArrayTmp[q][xyrObj[anjianXyDxDic.xydw].param]
                            } else if (dxLb == anjianXyDxDic.ajxgr) {
                                xydxMc = xydxArrayTmp[q][xyrObj[anjianXyDxDic.ajxgr].param]
                            }
                            break;
                        }
                    }
                    if (isSkip) {
                        break;
                    }
                    xyrStr += '<li><label ' + title + ' class="easyui-tooltip"><input xxzjbh="' + flwsRow[i].CLDX_XXZJBH + '" flwszj="' + flwsRow[i].ZJ + '" ' + disabled + ' type="checkbox"/>' +
                        '<span xyrtype="' + xyrObjTemp.id + '">' + xydxMc + '</span></label>';

                    if (isShowDelete) {
                        xyrStr += '<a class="val easyui-linkbuttom c5 delXydxBtn"  title="删除"><i class="fa fa-times"></i></a>';
                    }
                    xyrStr += '</li>';
                }

                yclXyrStr = '<div><p><i class="fa fa-bars"></i>' + xyrObjTemp.text + '</p>' +
                    '<ul class="xyrList ' + xyrObjTemp.id + '" ids=' + xyrObjTemp.id + '>' + xyrStr + '</ul></div>';

                /***未处理嫌疑对象列表渲染***/
                //$('.flws_xyr_area_wcq').html('');
                //总的嫌疑人数据，删除已经做过的数据
                var wcqXyrArry = getDiffer(DATA.FLWS[bm].xyrData, flwsRow, 'xxzjbh', 'CLDX_XXZJBH');
                //console.log(wcqXyrArry);

                var wcqXyrStr = '';
                for (var h = 0; h < wcqXyrArry.length; h++) {
                    if (dxLb == anjianXyDxDic.xyr) {
                        wcqXyrStr += '<li><label ' + wcqXyrArry[h].title + ' ' + wcqXyrArry[h].disabled + '><input xxzjbh="' + wcqXyrArry[h].xxzjbh + '" type="checkbox" ' + wcqXyrArry[h].disabled + '/>' +
                            '<span xyrtype="' + xyrObj[DATA.FLWS[bm].xyrBm].id + '">' + wcqXyrArry[h][xyrObj[DATA.FLWS[bm].xyrBm].param] + '</span></label></li>';
                    } else {
                        wcqXyrStr += '<li><label ><input xxzjbh="' + wcqXyrArry[h].xxzjbh + '" type="checkbox"/>' +
                            '<span xyrtype="' + xyrObj[DATA.FLWS[bm].xyrBm].id + '">' + wcqXyrArry[h][xyrObj[DATA.FLWS[bm].xyrBm].param] + '</span></label></li>';

                    }
                }

                wclXyrStr = '<div><p><i class="fa fa-bars"></i>' + xyrObj[DATA.FLWS[bm].xyrBm].text + '</p>' +
                    '<ul class="xyrList ' + xyrObj[DATA.FLWS[bm].xyrBm].id + '" ids=' + xyrObj[DATA.FLWS[bm].xyrBm].id + '>' + wcqXyrStr + '</ul></div>';
            } else {
                //未勾选过嫌疑对象
                for (var k in xydxDatas) {
                    for (var key in xyrObj) {
                        if (k == key) {
                            var xyrStr = '';
                            for (var i = 0; i < xydxDatas[k].length; i++) {
                                if (key == anjianXyDxDic.xyr) {//嫌疑人的显示组合信息
                                    var xyrzhxx = filedToParagraph(xydxDatas[k][i], DATA.FLWS[bm].prefixpz, DATA.FLWS[bm].splitpz);
                                    xyrStr += xydxStrTmpFun(xydxDatas[k][i].title, xydxDatas[k][i].disabled, xydxDatas[k][i][xyrObj[key].xxzjbh], xyrObj[key].id, xyrzhxx, xydxDatas[k][i][xyrObj[key].param], true);
                                } else {
                                    xyrStr += xydxStrTmpFun('', '', xydxDatas[k][i][xyrObj[key].xxzjbh], xyrObj[key].id, '', xydxDatas[k][i][xyrObj[key].param], true);
                                }
                            }

                            wclXyrStr += '<div><p><i class="fa fa-bars"></i>' + xyrObj[key].text + '</p>' +
                                '<ul class="xyrList ' + xyrObj[key].id + '" ids=' + xyrObj[key].id + '>' + xyrStr + '</ul></div>'
                        }
                    }
                }
            }
        } else if (flwsRow.length == 0) {//2  新增渲染
            for (var k in xydxDatas) {
                for (var key in xyrObj) {
                    if (k == key) {
                        var xyrStr = '';
                        for (var i = 0; i < xydxDatas[k].length; i++) {
                            if (key == anjianXyDxDic.xyr) {//嫌疑人的显示组合信息
                                var xyrzhxx = filedToParagraph(xydxDatas[k][i], DATA.FLWS[bm].prefixpz, DATA.FLWS[bm].splitpz);
                                xyrStr += '<li><label  ' + xydxDatas[k][i].title + ' ' + xydxDatas[k][i].disabled + ' class="easyui-tooltip"><input xxzjbh="' + xydxDatas[k][i][xyrObj[key].xxzjbh] + '" ' + xydxDatas[k][i].disabled + ' type="checkbox" />' +
                                    '<span xyrtype="' + xyrObj[key].id + '"  xyrzhxx="' + xyrzhxx + '">' + xydxDatas[k][i][xyrObj[key].param] + '</span></label>' +
                                    '</li>';
                            } else {
                                xyrStr += '<li><label class="easyui-tooltip"><input xxzjbh="' + xydxDatas[k][i][xyrObj[key].xxzjbh] + '" type="checkbox" />' +
                                    '<span xyrtype="' + xyrObj[key].id + '" >' + xydxDatas[k][i][xyrObj[key].param] + '</span></label>' +
                                    '</li>';
                            }
                        }

                        wclXyrStr += '<div><p><i class="fa fa-bars"></i>' + xyrObj[key].text + '</p>' +
                            '<ul class="xyrList ' + xyrObj[key].id + '" ids=' + xyrObj[key].id + '>' + xyrStr + '</ul></div>'
                    }
                }
            }
        }
    }

    var xyrTmpStr = '<div class="flws_xyr_area_wcl" id="flws_xyr_area_wcl_' + bm + '">' +
        '<div class="title">未处理嫌疑对象</div>' +
        '<div class="xyr_box">' + wclXyrStr + '</div>' +
        '</div>' +
        '<div class="flws_xyr_area_ycl" id="flws_xyr_area_ycl_' + bm + '">' +
        '<div class="title">已处理嫌疑对象</div>' +
        '<div class="xyr_box">' + yclXyrStr + '</div>' +
        '</div>';

    //append嫌疑人列表
    $('#flws_xyr_area_' + bm).append(xyrTmpStr);
    setPage();//设置页面样式
    flwsLsCqbgNrXxfy(bm);//法律文书中类呈请报告呈请内容的信息复用

    //不能做嫌疑对象的处理
    $('#flws_xyr_area_wcl_' + bm + ' ul.xyrList').find("label[disabled='disabled']").tooltip({position: 'right'});

    //未处理嫌疑对象绑定事件
    $('#flws_xyr_area_wcl_' + bm + ' ul.xyrList input:checkbox').off('click').on('click', function (event) {
        flwsWclXyDxCheck(bm, $(this), event);
    });

    //已处理嫌疑对象绑定事件
    $('#flws_xyr_area_ycl_' + bm + ' ul.xyrList input:checkbox').off('click').on('click', function () {
        flwsYclXyDxCheck(bm, $(this));
    });

    //已处理的嫌疑对象绑定删除事件
    $('#flws_xyr_area_ycl_' + bm + ' ul.xyrList a').off('click').on('click', function () {
        flwsYclXydxDelete(bm, $(this));
    });

    //保存数据成功后获取法律文书主键，再次点击为编辑
    if (typeof (DATA.FLWS[bm].status.currentDxId) != 'undefined') {
        $('#flws_xyr_area_' + bm).find("input[xxzjbh='" + DATA.FLWS[bm].status.currentDxId + "']").click();
    }

    //【呈请法律文书修改】默认选中
    if (DATA.FLWS.cqFlwsZj && typeof DATA.FLWS.cqFlwsZj != 'undefined') {
        $('#flws_xyr_area_' + bm).find("input[flwszj='" + DATA.FLWS.cqFlwsZj + "']").click();
    }
}

/**********************END ************************/

/********************类型B************************/
/**
 * 法律文书对象列表的渲染方法B
 * @param bm
 */
function flwsDxListRenderB(bm) {
    //法律文书嫌疑对象DOM树清空
    $('#flws_xyr_area_' + bm).html('');

    var xydxDatas = DATA.DX.xydxData;//嫌疑对象数据
    var xyrListStr = '';//嫌疑人list字符串

    if (xydxDatas) {
        for (var k in xydxDatas) {
            for (var key in xyrObj) {
                if (k == key) {
                    var xyrStr = '';
                    for (var i = 0; i < xydxDatas[k].length; i++) {
                        if (key == anjianXyDxDic.xyr) {//嫌疑人的显示组合信息
                            var xyrzhxx = filedToParagraph(xydxDatas[k][i], DATA.FLWS[bm].prefixpz, DATA.FLWS[bm].splitpz);
                            xyrStr += xydxStrTmpFun(xydxDatas[k][i].title, xydxDatas[k][i].disabled, xydxDatas[k][i][xyrObj[key].xxzjbh], xyrObj[key].id, xyrzhxx, xydxDatas[k][i][xyrObj[key].param], false);
                        } else {
                            xyrStr += xydxStrTmpFun('', '', xydxDatas[k][i][xyrObj[key].xxzjbh], xyrObj[key].id, '', xydxDatas[k][i][xyrObj[key].param], false);
                        }
                    }

                    xyrListStr += '<div><p><i class="fa fa-bars"></i>' + xyrObj[key].text + '</p>' +
                        '<ul class="xyrList ' + xyrObj[key].id + '" ids=' + xyrObj[key].id + '>' + xyrStr + '</ul></div>'
                }
            }
        }

        //法律文书嫌疑人列表展示
        $('#flws_xyr_area_' + bm).append(xyrListStr).css('background', '#f5f5f5');

        //不能做嫌疑对象的处理
        $('#flws_xyr_area_' + bm + ' ul.xyrList').find("label[disabled='disabled']").tooltip({position: 'right'});


        //选中已经保存的法律文书
        if (DATA.FLWS[bm].flwsRow.length > 0) {
            $('#flws_xyr_area_' + bm).find("input[xxzjbh='" + (DATA.FLWS[bm].flwsRow)[0].CLDX_XXZJBH + "']").click();
        }

        //嫌疑对象的勾选
        $('#flws_xyr_area_' + bm + ' ul.xyrList input:checkbox').off('click').on('click', function () {
            flwsClXyDxCheckB(bm, $(this));
        });
    }
}

/**
 * 法律文书处理嫌疑对象选择
 * @param bm 法律文书编码
 * @param $this input勾选框
 * @returns {boolean}
 */
function flwsClXyDxCheckB(bm, $this) {
    var parentDiv = $this.parent().parent().parent().parent();//父级div
    var parentLi = $this.parent().parent();//父级li

    var flwsData = DATA.FLWS[bm].flwsData;//法律文书数据

    //勾选嫌疑人
    if (parentDiv.find('input:checked').length > 0) {//选中
        //单选处理
        parentLi.siblings().find('input:checked').attr('checked', false);

        //多个嫌疑对象列表同一时间只能操作一个
        parentDiv.show();
        parentDiv.siblings().hide();

        //选中状态
        DATA.FLWS[bm]["status"]["selected"] = true;

        /*嫌疑人信息的复用*/
        var xyrXxzjbh = $this.attr('xxzjbh');//嫌疑人信息主键编号
        var xyrtype = $this.next().attr('xyrtype');//嫌疑人类别

        DATA.FLWS[bm].xyrXxzjbh = xyrXxzjbh;

        //嫌疑人勾选其他接口请求信息复用（秀平）
        ajax_request(bm, xyrXxzjbh);

        //法律文书蒙层隐藏
        $('#flws_main_con_r_mask_' + bm).hide();

        //嫌疑人处理对象类别
        for (var k in xyrObj) {
            if (xyrtype == xyrObj[k].id) {
                DATA.FLWS[bm].xyrCldxlb = xyrObj[k].cldxlb;
                if (!DATA.FLWS[bm].xyrBm) {
                    DATA.FLWS[bm].xyrBm = k;
                }
            }
        }

        //嫌疑人数组中获取当前选中的嫌疑人数据
        var xyrArry = DATA.DX.xydxData[DATA.FLWS[bm].xyrBm];
        for (var i = 0; i < xyrArry.length; i++) {
            if (xyrArry[i]["xxzjbh"] == xyrXxzjbh) {
                var xyrCurrent = xyrArry[i];
                if (DATA.URLATTR[xyrApiName]) {
                    for (var j = 0; j < DATA.URLATTR[xyrApiName].length; j++) {
                        var key = DATA.URLATTR[xyrApiName][j];
                        if (xyrCurrent[key.toLowerCase()] != undefined) {
                            DATA.FLWS[bm].params[key] = xyrCurrent[key.toLowerCase()];
                        }
                    }
                    //案事件相关人员、犯罪嫌疑人人员id
                    if (xyrCurrent.asjxgrybh) {
                        DATA.FLWS[bm].asjxgry = xyrCurrent.asjxgrybh;
                    }
                    if (xyrCurrent.ryid) {
                        DATA.FLWS[bm].fzxyrRyid = xyrCurrent.ryid;
                    }

                    //if (DATA.FLWS[bm].xyrXxzjbh) {
                    //    DATA.FLWS[bm].params.CLDX_XXZJBH = DATA.FLWS[bm].xyrXxzjbh;//嫌疑人主键id
                    //}
                    //if (DATA.FLWS[bm].xyrCldxlb) {
                    //    DATA.FLWS[bm].params.CLDXLB = DATA.FLWS[bm].xyrCldxlb;//嫌疑人处理对象类别
                    //}

                    //自定义页面的处理(传递当前选中的嫌疑对象数据)
                    if (flwsData.customized) {
                        eval("render" + bm + "CustomizedDx('" + JSON.stringify(xyrCurrent) + "')");
                    }

                    //犯罪嫌疑人信息复用
                    fzxyrXxfy(xyrCurrent, bm);
                }
            }
        }

    } else {//未选中
        if (flwsData.bx) {
            event.stopPropagation();
            $.messager.alert({
                title: '提示',
                msg: '必须选择一项',
                fn: function () {
                    $this.prop('checked', true);
                }
            });
            return false;
        }

        //选中状态
        DATA.FLWS[bm]["status"]["selected"] = false;

        //其他嫌疑对象显示
        parentDiv.show();
        parentDiv.siblings().show();

        //置空
        for (var j = 0; j < DATA.URLATTR[xyrApiName].length; j++) {
            var key = DATA.URLATTR[xyrApiName][j];
            DATA.FLWS[bm].params[key] = "";
        }
        DATA.FLWS[bm].params.CLDX_XXZJBH = "";//嫌疑人主键id
        DATA.FLWS[bm].params.CLDXLB = "";//嫌疑人处理对象类别

        if (!flwsData.customized) {
            var xyrDom = DATA.URLATTR[xyrApiName];
            for (var j = 0; j < xyrDom.length; j++) {
                var $node = $("#flws_cl_area_" + bm + " .panel form a>input." + xyrDom[j]);

                if ($node.hasClass('easyuitextbox')) {
                    $node.textbox({value: ''})
                } else if ($node.hasClass('easyuicombobox')) {
                    $node.combobox({value: ''});
                } else if ($node.hasClass('easyuicombotree')) {
                    $node.combotree({value: ''})
                } else if ($node.hasClass('easyuivalidatebox') || $node.hasClass('Wdate')) {
                    $node.val('');
                    wdateValidate($node[0]);
                }
            }

            editSwitch(false, 'clear-border', 'iptreadonly');//清除easyui样式
        }
    }
}

/**********************END ************************/

/********************类型C************************/
/**
 * 法律文书对象列表的渲染方法C
 * @param bm
 */
function flwsDxListRenderC(bm) {
    //法律文书嫌疑对象DOM树清空
    $('#flws_xyr_area_' + bm).html('');

    var xydxDatas = DATA.DX.xydxData;//嫌疑对象数据
    var xyrListStr = '';//嫌疑人list字符串

    if (xydxDatas) {
        for (var k in xydxDatas) {
            for (var key in xyrObj) {
                if (k == key) {
                    var xyrStr = '';
                    for (var i = 0; i < xydxDatas[k].length; i++) {
                        if (key == anjianXyDxDic.xyr) {//嫌疑人的显示组合信息
                            var xyrzhxx = filedToParagraph(xydxDatas[k][i], DATA.FLWS[bm].prefixpz, DATA.FLWS[bm].splitpz);
                            xyrStr += xydxDxStrTmpFun(xydxDatas[k][i].title, xydxDatas[k][i].disabled, xydxDatas[k][i][xyrObj[key].xxzjbh], xydxDatas[k][i][xyrObj[key].ryid], xydxDatas[k][i][xyrObj[key].asjxgrybh], xyrObj[key].id, xyrzhxx, xydxDatas[k][i][xyrObj[key].param], false);
                        } else {
                            xyrStr += xydxDxStrTmpFun('', '', xydxDatas[k][i][xyrObj[key].xxzjbh], xydxDatas[k][i][xyrObj[key].ryid], xydxDatas[k][i][xyrObj[key].asjxgrybh], xyrObj[key].id, '', xydxDatas[k][i][xyrObj[key].param], false);
                        }
                    }

                    xyrListStr += '<div><p><i class="fa fa-bars"></i>' + xyrObj[key].text + '</p>' +
                        '<ul class="xyrList ' + xyrObj[key].id + '" ids=' + xyrObj[key].id + '>' + xyrStr + '</ul></div>'
                }
            }
        }

        //法律文书嫌疑人列表展示
        $('#flws_xyr_area_' + bm).append(xyrListStr).css('background', '#f5f5f5');

        //disabled样式
        $('#flws_xyr_area_' + bm + ' ul.xyrList').find("label[disabled='disabled']").tooltip({position: 'right'});


        //嫌疑对象的勾选
        $('#flws_xyr_area_' + bm + ' ul.xyrList input:checkbox').off('click').on('click', function () {
            flwsClXyrCheckC(bm, $(this));
        });

        //选中已经保存的法律文书
        if (DATA.FLWS[bm].flwsRow.length > 0) {
            var tmpArray = [];
            var cldxs = (DATA.FLWS[bm].flwsRow)[0].CLDX_XXZJBH;

            if (cldxs.indexOf(',') == -1) {
                tmpArray.push(cldxs);
            } else {
                tmpArray = cldxs.split(',');
            }

            for (var i = 0; i < tmpArray.length; i++) {
                console.log($('#flws_xyr_area_' + bm).find("input[xxzjbh='" + tmpArray[i] + "']"));

                $('#flws_xyr_area_' + bm).find("input[xxzjbh='" + tmpArray[i] + "']").click();
            }
        }
    }
}

/**
 * 法律文书 only：true | dx:true
 * 多个嫌疑对象列表同一时间只能操作一个
 * 法律文书 嫌疑对象 勾选
 */
function flwsClXyrCheckC(bm, $this) {
    var parentDiv = $this.parent().parent().parent().parent();//父级div
    var parentUl = $this.parent().parent().parent();//父级ul
    var parentLi = $this.parent().parent();//父级li

    //针对嫌疑人多选组合信息的初始化
    //var xyrxmData = '';
    var xyridData = '';
    var xyrzhxxData = '';
    var xyrryidData = '';
    var xyrasjxgrybhData = '';
    //var xyrxmArry = [];//嫌疑人姓名
    var xyridArry = [];//嫌疑人ID
    var xyrzhxxArry = [];
    var xyrryidArry = [];
    var xyrasjxgrybhArry = [];
    var checkXyr = [];

    //勾选嫌疑人
    if (parentUl.find('input:checked').length > 0) {//选中

        //多个嫌疑对象列表同一时间只能操作一个
        parentDiv.show();
        parentDiv.siblings().hide();

        //选中状态
        DATA.FLWS[bm]["status"]["selected"] = true;

        //法律文书蒙层隐藏
        $('#flws_main_con_r_mask_' + bm).hide();

        var xyrtype = $this.next().attr('xyrtype');//嫌疑人类别
        for (var k in xyrObj) {
            if (xyrtype == xyrObj[k].id) {
                DATA.FLWS[bm].xyrCldxlb = xyrObj[k].cldxlb;
                if (!DATA.FLWS[bm].xyrBm) {
                    DATA.FLWS[bm].xyrBm = k;
                }
            }
        }

        //textarea框的值
        var textareaVal = $('#flws_cl_area_' + bm + ' form a textarea').val();
        checkXyr = $this.parent().parent().parent().find('input:checked');

        for (var i = 0; i < checkXyr.length; i++) {
            //xyrxmData = $(checkXyr[i]).next().text();
            xyridData = $(checkXyr[i]).attr('xxzjbh');
            xyrzhxxData = $(checkXyr[i]).next().attr('xyrzhxx');
            xyrryidData = $(checkXyr[i]).attr('ryid');
            xyrasjxgrybhData = $(checkXyr[i]).attr('asjxgrybh');
            //xyrxmArry.push(xyrxmData);
            xyridArry.push(xyridData);
            xyrzhxxArry.push(xyrzhxxData);
            xyrryidArry.push(xyrryidData);
            xyrasjxgrybhArry.push(xyrasjxgrybhData);
        }

        var xyrZhxxData = '';
        for (var j = 0; j < xyrzhxxArry.length; j++) {
            xyrZhxxData += '\n' + '\t' + xyrzhxxArry[j];
        }

        $('#flws_cl_area_' + bm + ' form a textarea').val(xyrZhxxData + '\t');

        //DATA.FLWS[bm].xyrxms = xyrxmArry;
        DATA.FLWS[bm].xyrids = xyridArry;
        DATA.FLWS[bm].xyrryids = xyrryidArry;
        DATA.FLWS[bm].xyrasjxgrybhs = xyrasjxgrybhArry;

    } else {//未选中
        if (DATA.FLWS[bm].flwsData.bx) {
            event.stopPropagation();
            $.messager.alert({
                title: '提示',
                msg: '必须选择一项',
                fn: function () {
                    $this.prop('checked', true);
                }
            });
            return false;
        }

        //选中状态
        DATA.FLWS[bm]["status"]["selected"] = false;

        parentDiv.show();
        parentDiv.siblings().show();

        //置空
        for (var j = 0; j < DATA.URLATTR[xyrApiName].length; j++) {
            var key = DATA.URLATTR[xyrApiName][j];
            DATA.FLWS[bm].params[key] = "";
        }
        DATA.FLWS[bm].params.CLDX_XXZJBH = "";//嫌疑人主键id
        DATA.FLWS[bm].params.CLDXLB = "";//嫌疑人处理对象类别

        if (!DATA.FLWS[bm].flwsData.customized) {
            var xyrDom = DATA.URLATTR[xyrApiName];
            for (var j = 0; j < xyrDom.length; j++) {
                var $node = $("#flws_cl_area_" + bm + " .panel form a>input." + xyrDom[j]);

                if ($node.hasClass('easyuitextbox')) {
                    $node.textbox({value: ''})
                } else if ($node.hasClass('easyuicombobox')) {
                    $node.combobox({value: ''});
                } else if ($node.hasClass('easyuicombotree')) {
                    $node.combotree({value: ''})
                } else if ($node.hasClass('easyuivalidatebox') || $node.hasClass('Wdate')) {
                    $node.val('');
                    wdateValidate($node[0]);
                }
            }

            editSwitch(false, 'clear-border', 'iptreadonly');//清除easyui样式
        }
    }
}

/**********************END ************************/
