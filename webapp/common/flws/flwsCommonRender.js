/**
 * Created by christ on 2017/3/9.
 */

//文书页面公共渲染方法
/**
 * 呈请报告  内容信息接口请求数据复用
 */
function cqbgNrXxfy() {
    var textareaVal = $("#cqbg_main_con form textarea").val();//textarea默认值
    var cqbgxxTmpObj = {};
    if (textareaVal) {
        var cqbgDataArr = textareaVal.match(/\((.*?)\]/g);
        if (cqbgDataArr) {
            var cqbgxxTmpArray = [];
            //构建呈请报告数据
            for (var i = 0; i < cqbgDataArr.length; i++) {
                var a = cqbgDataArr[i];
                var dataTmp = {
                    funName: a.substring(a.indexOf('(') + 1, a.indexOf(')')),//方法名称
                    paramName: a.substring(a.indexOf('[') + 1, a.indexOf(']'))//参数名称
                };
                cqbgxxTmpArray.push(dataTmp.paramName);
                cqbgxxTmpObj[dataTmp.funName] = cqbgxxTmpArray;
            }

            // console.log(cqbgxxTmpObj);
            //数据填写
            for (var k1 in DATA.publicJkXx) {
                for (var k2 in cqbgxxTmpObj) {
                    if (k1 == k2) {
                        for (var j = 0; j < cqbgxxTmpObj[k2].length; j++) {
                            var key = cqbgxxTmpObj[k2][j];//参数名称
                            var val = DATA.publicJkXx[k1][key];//参数对应的值
                            var strVal = '(' + k2 + ')[' + key + ']';//textarea中对应的字符串

                            if (val == undefined || val == null || val == '') {//返回数据为空
                                textareaVal = textareaVal.replace(strVal, '');
                                console.log(key + '为空');
                            } else {//textarea中对应的字符串替换赋值
                                textareaVal = textareaVal.replace(strVal, val);
                            }
                        }
                    } else {
                        // var strVal = '(' + k1 + ')[' + key + ']';//textarea中对应的字符串
                    }
                    $("#cqbg_main_con form textarea").val(textareaVal);
                }
            }
        }
    }
}

/**
 * 呈请报告、法律文书 其他公共接口信息接口请求数据复用
 */
function cqbgFlwsOtherXxfy() {
    for (var k1 in DATA.publicJkXx) {
        for (var k2 in DATA.URLATTR) {
            for (var i = 0; i < DATA.URLATTR[k2].length; i++) {
                var key = DATA.URLATTR[k2][i];//参数名称
                var val = DATA.publicJkXx[k1][key];//参数值

                if (k1 == k2) {
                    if (k2 == 'BAR02') {//办案人字典处理
                        val = DATA.publicJkXx[k2][0].text;
                    }

                    if (val == undefined || val == '' || val == null) {//返回数据为空
                        console.log(key + '为空');
                    } else {
                        var $node = $(".flws-main-con-r form input." + key);
                        if ($node.hasClass('easyuitextbox')) {
                            $node.textbox({value: val})
                        } else if ($node.hasClass('easyuicombobox')) {
                            $node.combobox({value: val})
                        } else if ($node.hasClass('easyuicombotree')) {
                            $node.combotree({value: val})
                        } else if ($node.hasClass('easyuivalidatebox') || $node.hasClass('Wdate')) {
                            $node.val(val);
                        }
                    }
                }
            }
        }
    }
}

/**
 * 呈请报告查询接口返回数据的渲染
 */
function cqbgDataXxfy() {
    //呈请报告数据
    var data = DATA.CQBG.cqbgRow;

    //信息复用
    for (var key in data) {
        var $node = $("#cqbg_main_con form ." + key);//节点
        if ($node) {
            var val = data[key];
            if (key == 'CQNR') {//呈请内容单独处理
                $('#cqbg_main_con form textarea').val(val);
                $node.textbox({
                    value: val
                })
            } else if (key == 'CQRQ') {//呈请日期
                $('#cqbg_main_con form input.' + key).val(data[key + '_MASTER']);
                wdateValidate('#cqbg_main_con form input.Wdate');
            } else {
                if ($node.hasClass('easyuitextbox')) {
                    $node.textbox({value: val})
                } else if ($node.hasClass('easyuicombobox')) {
                    if (key == 'BAMJXM') {
                        $node.combobox({value: data.BAMJID})
                    } else {
                        $node.combobox({value: val})
                    }
                } else if ($node.hasClass('easyuicombotree')) {
                    $node.combotree({value: val})
                }
            }
        }
    }
}

/**
 * 呈请报告查询接口返回数据 嫌疑人对象列表的渲染
 */
function cqbgXyrDataXxfy() {
    var xyrids = DATA.CQBG.cqbgRow.XYRID;
    var xyridArry = [];

    if (xyrids) {//嫌疑人id可能为多个
        if (xyrids.indexOf(',') == -1) {
            xyridArry.push(xyrids);
        } else {
            xyridArry = xyrids.split(',');
        }
    }

    var currentXyDxDiv;//当前嫌疑对象div
    for (var i = 0; i < xyridArry.length; i++) {
        $('#cqbg_xyr_con ul.xyrList').find("input[xxzjbh=" + xyridArry[i] + "]").click();
        currentXyDxDiv = $('#cqbg_xyr_con ul.xyrList').find("input[xxzjbh=" + xyridArry[i] + "]").parent().parent().parent().parent()[0];
    }

    if (xyridArry.length > 0 && currentXyDxDiv) {
        $(currentXyDxDiv).siblings().hide();
    }
}

/**
 * 嫌疑对象字符串模板函数
 * @param title title属性，提示内容
 * @param disabled disabled属性
 * @param xxzjbh 嫌疑对象的主键
 * @param xytype 嫌疑对象类型
 * @param xyzhxx 嫌疑对象组合信息
 * @param xydxmc 嫌疑对象名称
 * @returns {string}  返回为拼接好的字符串
 */
function xydxStrTmpFun(title, disabled, xxzjbh, xytype, xyzhxx, xydxmc) {
    var xydxStrTmp = '';
    xydxStrTmp = '<li><label  ' + title + ' ' + disabled + ' class="easyui-tooltip"><input xxzjbh="' + xxzjbh + '" ' + disabled + ' type="checkbox" />' +
        '<span xyrtype="' + xytype + '"  xyrzhxx="' + xyzhxx + '">' + xydxmc + '</span></label></li>';
    return xydxStrTmp;
}

/**
 * 嫌疑对象隐藏，无嫌疑人对象页面的处理
 */
function xydxHide() {
    $('#cqbg_xyr_con,.flws-main-con-l').hide();
    $('#cqbg_main_con,.flws-main-con-r').css({width: '100%'});
    $('.flws_cl_area').css({height: '100%', width: '100%'}).tabs();
}

/**
 * 嫌疑对象信息复用（呈请报告中）：(FZXYR01)[FZXYR_XM]
 * @param textareaVal textarea的值
 * @param $this input框本身
 */
function xydxXxfyCqbg(textareaVal, $this) {
    var cqbgDataArry = textareaVal.match(/\((.*?)\]/g);
    var cqbgxxTmpObj = {};
    if (cqbgDataArry) {
        var cqbgxxTmpArray = [];
        for (var n = 0; n < cqbgDataArry.length; n++) {
            var a = cqbgDataArry[n];
            var dataTmp = {
                funName: a.substring(a.indexOf('(') + 1, a.indexOf(')')),//方法名称
                paramName: a.substring(a.indexOf('[') + 1, a.indexOf(']'))//参数名称
            };
            cqbgxxTmpArray.push(dataTmp.paramName);
            cqbgxxTmpObj[dataTmp.funName] = cqbgxxTmpArray;
        }
    }

    var xydxDataArry;//嫌疑人对象数据
    var xyrType = $this.next().attr('xyrtype');//嫌疑人类型
    var xyrXxzjbh = $this.attr('xxzjbh');//嫌疑人信息主键编号
    for (var k in xyrObj) {
        if (xyrType == xyrObj[k].id) {
            xydxDataArry = DATA.DX.xydxData[k];//嫌疑对象数据
        }
    }
    // console.log(xydxDataArry);
    // console.log(cqbgxxTmpObj);
    for (var l = 0; l < xydxDataArry.length; l++) {
        if (xyrXxzjbh == xydxDataArry[l].xxzjbh) {
            for (var k2 in cqbgxxTmpObj) {
                for (var j = 0; j < cqbgxxTmpObj[k2].length; j++) {
                    var key = cqbgxxTmpObj[k2][j];//参数名称
                    var val = xydxDataArry[l][key.toLowerCase()];//参数对应的值
                    var strVal = '(' + k2 + ')[' + key + ']';//textarea中对应的字符串

                    if (val == undefined || val == null || val == '') {//返回数据为空
                        textareaVal = textareaVal.replace(strVal, '');
                        console.log(key + '为空');
                    } else {//textarea中对应的字符串替换赋值
                        textareaVal = textareaVal.replace(strVal, val);
                    }
                }
                $("#cqbg_main_con form textarea").val(textareaVal);
            }
        }
    }
}

/**
 * 呈请报告嫌疑对象组合信息复用（行政案件）
 * @param $this  input框本身
 * @param textareaVal  textarea的值
 */
function cqbgXydxZhxxFyForXzaj($this, textareaVal) {
    var zhxxObj = {};
    var parentUl = $this.parent().parent().parent();//父级ul
    var xxzjbh = $this.attr("xxzjbh");//当前嫌疑对象信息主键编号
    var xydxLb = parentUl.attr("ids");//嫌疑对象类别
    var cqbgData = DATA.CQBG.cqbgData;

    for (var k in xyrObj) {
        if (xydxLb == xyrObj[k].id) {//嫌疑对象类别
            var xydxArryTmp = DATA.DX.xydxData[k];
            if (xydxArryTmp.length > 0) {
                for (var i = 0; i < xydxArryTmp.length; i++) {
                    if (xydxArryTmp[i].xxzjbh == xxzjbh) {
                        zhxxObj = xydxArryTmp[i];
                    }
                }
            }

            var zhxx = {};
            var xydxpzArr = cqbgData[xyrObj[k].xydxpz].split(",");
            for (var j = 0; j < xydxpzArr.length; j++) {
                var field = xydxpzArr[j];
                var val = zhxxObj[field];
                if (val) {
                    zhxx[field] = val;
                }
            }
            $("#cqbg_main_con form textarea").val('\t' + filedToParagraph(zhxx, cqbgData.prefixpz, cqbgData.splitpz) + '\n' + textareaVal);
        }
    }
}

/**
 * 法律文书嫌疑对象组合信息复用（行政案件）
 * @param bm  法律文书编码
 * @param $this  input框本身
 */
function flwsXydxZhxxFyForXzaj(bm, $this) {
    var zhxxObj = {};
    var parentUl = $this.parent().parent().parent();//父级ul
    var xxzjbh = $this.attr("xxzjbh");//当前嫌疑对象信息主键编号
    var xydxLb = parentUl.attr("ids");//嫌疑对象类别
    var flwsData = DATA.FLWS[bm].flwsData;

    for (var k in xyrObj) {
        if (xydxLb == xyrObj[k].id) {//嫌疑对象类别
            var xydxArryTmp = DATA.DX.xydxData[k];
            if (xydxArryTmp.length > 0) {
                for (var i = 0; i < xydxArryTmp.length; i++) {
                    if (xydxArryTmp[i].xxzjbh == xxzjbh) {
                        zhxxObj = xydxArryTmp[i];
                    }
                }
            }

            var zhxx = {};
            var xydxpzObj = eval('(' + flwsData[xyrObj[k].xydxpz] + ')');

            for (var fieldName in xydxpzObj) {
                var xyrpzArr = xydxpzObj[fieldName].split(",");
                for (var j = 0; j < xyrpzArr.length; j++) {
                    var field = xyrpzArr[j];
                    var val = zhxxObj[field];
                    if (val) {
                        zhxx[field] = val;
                    }
                }
                fzxyDxXxfy(fieldName, filedToParagraph(zhxx, DATA.FLWS[bm].prefixpz, DATA.FLWS[bm].splitpz), bm);
            }
        }
    }
}

/************************common***************************/

/**
 * 法律文书右侧页面拼接
 * @param flwsData  法律文书数据
 */
function flwsRightPagePj(flwsData) {
    var bm = flwsData.bianMa;
    //右侧页面DOM数清空
    $('#flws_main_con_r_' + bm).html('');

    //排序处理
    var iframecon = '', emputArry = [], flwscon = '';
    var childs = flwsData.childMap;
    for (var b in childs) {
        emputArry.push(childs[b]);
    }
    var childIframe = emputArry.sort(compare('index'));

    //for循环取数据
    for (var i = 0; i < childIframe.length; i++) {
        flwscon = getHtmlByAjax(childIframe[i].url);
        iframecon += '<div title="' + childIframe[i].name + '" tabindex="' + childIframe[i].index + '">' + flwscon + '</div>';
    }

    var str = '<div class="save-btn-area">' +
        '<a class="save-btn saveFlwsZfgk" id="saveFlwsZfgk_' + bm + '">执法公开编辑</a>' +
        '<a class="save-btn saveFlwsAdd" id="saveFlwsAdd_' + bm + '" style="display: block;"></a>' +
        '</div>' +
        '<div class="flws-mode-right">' +
        '<div class="flws_cl_area" id="flws_cl_area_' + bm + '">' + iframecon + '</div>' +
        '</div>';

    $('#flws_main_con_r_' + bm).append(str);
    setPage();//设置页面高度

    $('#flws_cl_area_' + bm).css({height: '100%', width: '100%'}).tabs({
        plain: true, pill: true, border: false
    });

    //绑定保存法律文书事件
    $('#saveFlwsAdd_' + bm).off('click').on('click', function () {
        saveFlws(bm);
    });

    //生成法律文书按钮 绑定事件（没有呈请报告）
    if (DATA.FLWS.flwsData.customer) {
        var str = '<a class="scflws" id="scflws_' + bm + '">生成法律文书</a>';
        $('.save-btn-area').append(str);

        $('#scflws_' + bm).show().off('click').on('click', function () {
            scflwsrwForNoCqbg(bm);
        });
    }
}

/**
 * *****************新增渲染***************
 * 法律文书右侧页面渲染
 * @param flwsData 法律文书数据
 */
function flwsRightPageRenderForAdd(flwsData) {
    var bm = flwsData.bianMa;//法律文书编码
    //法律文书页面拼接
    flwsRightPagePj(flwsData);

    //新增页面保存按钮修改
    $('#saveFlwsAdd_' + bm).text('法律文书新增保存');

    //法律文书页面的初始化 (新增渲染)
    var flwsIpts = $('#flws_main_con_r_' + bm + ' form input');
    easyuiReset(flwsIpts, true, bm);

    if (typeof (DATA.FLWS[bm]) == 'undefined') {
        DATA.FLWS[bm] = {};
    }
    if (typeof (DATA.FLWS[bm]['status']) == 'undefined') {
        DATA.FLWS[bm]['status'] = {};
    }

    DATA.FLWS[bm]['status']['isAdd'] = true;

    //获取呈请报告、法律文书公共参数接口
    getCqbgFlwsAllXxData(cqbgFlwsOtherXxfy);
}

/**
 * *****************编辑渲染***************
 * 法律文书右侧页面渲染
 * @param flwsData 法律文书数据
 */
function flwsRightPageRenderForEdit(flwsData) {
    //法律文书数据
    var bm = flwsData.bianMa;//法律文书编码
    //法律文书页面拼接
    flwsRightPagePj(flwsData);

    //编辑页面保存按钮修改
    $('#saveFlwsAdd_' + bm).text('法律文书编辑保存');

    /****行政案件 行政处罚报告书  执法公开编辑按钮单独处理****/
    if (bm == 'X020003') {
        $('#saveFlwsZfgk_' + bm).show().text('执法公开编辑');
    }

    //法律文书页面的初始化 （编辑渲染）
    var flwsIpts = $('#flws_main_con_r_' + bm + ' form input');
    easyuiReset(flwsIpts, false, bm);

    if (typeof (DATA.FLWS[bm]) == 'undefined') {
        DATA.FLWS[bm] = {};
    }
    if (typeof (DATA.FLWS[bm]['status']) == 'undefined') {
        DATA.FLWS[bm]['status'] = {};
    }

    DATA.FLWS[bm]['status']['isAdd'] = false;
}


/**
 * 1、多个嫌疑对象列表同一时间只能操作一种嫌疑对象
 * 2、法律文书 未处理嫌疑对象 勾选
 * @param bm 法律文书编码
 * @param $this input勾选框
 * @param event
 */
function flwsWclXyDxCheck(bm, $this, event) {
    var parentDiv = $this.parent().parent().parent().parent();//父级div
    var parentLi = $this.parent().parent();//父级li

    //法律文书数据
    var flwsData = DATA.FLWS[bm].flwsData;

    //勾选嫌疑人
    if (parentDiv.find('input:checked').length > 0) {//选中
        //新增页面标识
        DATA.FLWS[bm]['status']['isAdd'] = true;
        //选中状态
        DATA.FLWS[bm]["status"]["selected"] = true;

        //法律文书新增页面渲染
        flwsRightPageRenderForAdd(flwsData);

        //法律文书中类呈请报告呈请内容的信息复用
        flwsLsCqbgNrXxfy();

        //已处理|未处理嫌疑对象选中的互斥
        var yclXyrLen = $('#flws_xyr_area_ycl_' + bm + ' .xyrList li');
        if (yclXyrLen.length > 0) {
            $('#flws_xyr_area_ycl_' + bm + ' .xyrList').find('input:checked').attr('checked', false);
        }

        //多个嫌疑对象列表同一时间只能操作一个
        parentDiv.show();
        parentDiv.siblings().hide();

        /**
         * 判断是否可以多选
         * 1、可多选
         * 2、不可多选
         */
        if (flwsData.dx) {//1
            //TODO 多选的情况暂时未遇到

        } else {//2
            // 单选的互斥处理
            parentLi.siblings().find('input:checked').attr('checked', false);

            //嫌疑人信息的复用
            var xyrXxzjbh = $this.attr('xxzjbh');//嫌疑人信息主键编号
            var xyrtype = $this.next().attr('xyrtype');//嫌疑人类别

            DATA.FLWS[bm].xyrXxzjbh = xyrXxzjbh;

            //遍历嫌疑人处理对象类别筛选出当前嫌疑对象对应的的表名
            for (var k in xyrObj) {
                if (xyrtype == xyrObj[k].id) {
                    DATA.FLWS[bm].xyrCldxlb = xyrObj[k].cldxlb;
                    if (!DATA.FLWS[bm].xyrBm) {
                        DATA.FLWS[bm].xyrBm = k;
                    }
                    break;
                }
            }

            //嫌疑人数组中获取当前选中的嫌疑人数据
            var xyrArry = DATA.DX.xydxData[DATA.FLWS[bm].xyrBm];
            for (var i = 0; i < xyrArry.length; i++) {
                if (xyrArry[i]["xxzjbh"] == xyrXxzjbh) {
                    var xyrCurrent = xyrArry[i];

                    //自定义页面的处理(传递当前选中的嫌疑对象数据)
                    if (flwsData.customized) {
                        eval("render" + bm + "CustomizedDx('" + JSON.stringify(xyrCurrent) + "')");
                    }

                    //犯罪嫌疑人信息复用
                    fzxyrXxfy(xyrCurrent, bm);
                    break;
                }
            }

            /*******行政案件组合信息拼接*******/
            if (flwsData.xyrpz || flwsData.xydwpz || flwsData.xgrpz) {//行政案件组合信息复用
                flwsXydxZhxxFyForXzaj(bm, $this);
            }
        }
    } else {//未选中
        if (flwsData.bx) {//是否必选的校验
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

        //不勾选嫌疑人信息置空
        DATA.FLWS[bm].xyrXxzjbh = '';
        DATA.FLWS[bm].xyrBm = '';
        DATA.FLWS[bm].xyrCldxlb = '';

        //其他嫌疑对象的显示
        parentDiv.show();
        parentDiv.siblings().show();

        //不勾选信息清空
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

/**
 * 法律文书 已处理嫌疑对象 勾选
 * @param bm 法律文书编码
 * @param $this input勾选框
 */
function flwsYclXyDxCheck(bm, $this) {
    var parentDiv = $this.parent().parent().parent().parent();//父级div
    var parentLi = $this.parent().parent();//父级li

    //法律文书数据
    var flwsData = DATA.FLWS[bm].flwsData;

    //勾选嫌疑人
    if (parentDiv.find('input:checked').length > 0) {//选中
        //编辑渲染
        flwsRightPageRenderForEdit(flwsData);

        //法律文书中类呈请报告呈请内容的信息复用
        flwsLsCqbgNrXxfy();

        //编辑页面标识
        DATA.FLWS[bm]['status']['isAdd'] = false;
        DATA.FLWS[bm]['status']['selected'] = true;

        //已处理|未处理嫌疑对象选中的互斥
        var wclXyrLen = $('#flws_xyr_area_wcl_' + bm + ' .xyrList li');
        if (wclXyrLen.length > 0) {
            $('#flws_xyr_area_wcl_' + bm + ' .xyrList').find('input:checked').attr('checked', false);
        }

        /**
         * 判断是否可以多选
         * 1、可多选
         * 2、不可多选
         */
        if (flwsData.dx) {//1
            //TODO 多选的处理


        } else {//2
            // 单选的互斥处理
            parentLi.siblings().find('input:checked').attr('checked', false);

            //当前嫌疑人的法律文书主键
            var flwsZj = $this.attr('flwszj');
            DATA.FLWS[bm].flwsZj = flwsZj;//法律文书主键
            DATA.FLWS[bm].params = {
                ZJ: flwsZj
            };

            //法律文书信息复用
            flwsDataXxfy(bm, flwsZj);

            //绑定执法公开点击事件(行政案件)
            $('#saveFlwsZfgk_' + bm).off('click').on('click', function () {
                zfgkEdit(bm, flwsZj);
            });
        }
    } else {//未选中
        DATA.FLWS[bm]['status']['selected'] = false;
        //新增渲染
        flwsRightPageRenderForAdd(flwsData);
    }
}

/**
 * 法律文书中类呈请报告  内容信息接口请求数据复用
 */
function flwsLsCqbgNrXxfy() {
    var textareaVal = $(".flws_cl_area form textarea").val();//textarea默认值
    var cqbgxxTmpObj = {};
    if (textareaVal) {
        var cqbgDataArr = textareaVal.match(/\((.*?)\]/g);
        if (cqbgDataArr) {
            //构建呈请报告数据
            for (var i = 0; i < cqbgDataArr.length; i++) {
                var a = cqbgDataArr[i];
                var dataTmp = {
                    funName: a.substring(a.indexOf('(') + 1, a.indexOf(')')),//方法名称
                    paramName: a.substring(a.indexOf('[') + 1, a.indexOf(']'))//参数名称
                };
                cqbgxxTmpObj[dataTmp.funName] = dataTmp.paramName;
            }
            //数据填写
            for (var k1 in DATA.publicJkXx) {
                for (var k2 in cqbgxxTmpObj) {
                    var key = cqbgxxTmpObj[k2];//参数名称
                    var val = DATA.publicJkXx[k1][key];//参数对应的值
                    var strVal = '(' + k2 + ')[' + key + ']';//textarea中对应的字符串

                    if (k1 == k2) {
                        if (val == undefined || val == null || val == '') {//返回数据为空
                            textareaVal = textareaVal.replace(strVal, '');
                            console.log(key + '为空');
                        } else {//textarea中对应的字符串替换赋值
                            textareaVal = textareaVal.replace(strVal, val);
                        }
                    } else {
                        textareaVal = textareaVal.replace(strVal, '');
                    }

                    $(".flws_cl_area form textarea").val(textareaVal);
                }
            }
        }
    }
}

/**
 * 法律文书  犯罪嫌疑人接口信息接口请求数据复用
 * @param currentXyr 当前嫌疑对象数据
 * @param bm 法律文书编码
 */
function fzxyrXxfy(currentXyr, bm) {
    //loading('open','正在复用嫌疑人信息，请稍等....');
    for (var k in DATA.URLATTR) {
        var data;
        if (k == xyrApiName) {
            data = currentXyr;
            for (var j = 0; j < DATA.URLATTR[k].length; j++) {
                var key = DATA.URLATTR[k][j];//法律文书中对应的组件名字
                if (key) {
                    var val = data[key.toLowerCase()];//嫌疑人数据参数对应的值
                    var $node = $("#flws_cl_area_" + bm + " form input." + key);
                    if (val == undefined || val == '' || val == null) {//返回数据为空
                        console.log(key + '为空');
                        if ($node.hasClass('easyuitextbox')) {
                            $node.textbox({value: ''})
                        } else if ($node.hasClass('easyuicombobox')) {
                            $node.combobox({value: ''});
                        } else if ($node.hasClass('easyuicombotree')) {
                            $node.combotree({value: ''})
                        } else if ($node.hasClass('easyuivalidatebox') || $node.hasClass('Wdate')) {
                            $node.val('');
                        }
                    } else {
                        if ($node.hasClass('easyuitextbox')) {
                            $node.textbox({value: val})
                        } else if ($node.hasClass('easyuicombobox')) {
                            $node.combobox({value: val});
                        } else if ($node.hasClass('easyuicombotree')) {
                            $node.combotree({value: val})
                        } else if ($node.hasClass('easyuivalidatebox') || $node.hasClass('Wdate')) {
                            $node.val(val);
                        }
                    }
                }
            }
            //loading('close');
        }
    }
    editSwitch(false, 'clear-border', 'iptreadonly');//清除easyui样式
}

/**
 * 法律文书 查询接口返回数据的渲染
 * @param bm 法律文书编码
 * @param zj 法律文书主键
 */
function flwsDataXxfy(bm, zj) {
    var data = DATA.FLWS[bm].flwsRow;//返回的法律文书数据
    //查询嫌疑人结果信息复用
    for (var i = 0; i < data.length; i++) {
        if (zj == data[i].ZJ) {
            //自定义页面处理
            if (DATA.FLWS[bm].flwsData.customized) {
                eval("render" + bm + "CustomizedPage('" + JSON.stringify(data[i]) + "')");
            }
            //多版本处理（行政案件）
            data[i].VERSION = parseInt(data[i].VERSION);
            if (DATA.FLWS[bm].flwsData.switchVersion) {
                var tabs = $('#flws_cl_area_' + bm).tabs("tabs");
                if (tabs.length > data[i].VERSION) {
                    for (var index = data[i].VERSION; index < tabs.length; index++) {
                        $('#flws_cl_area_' + bm).tabs("close", index);
                    }
                }
                for (var index = data[i].VERSION - 2; index >= 0; index--) {
                    $('#flws_cl_area_' + bm).tabs("close", index);
                }
            }
            for (var key in data[i]) {
                var $node = $("#flws_cl_area_" + bm + " form a ." + key);//节点
                var val = data[i][key];
                //版本切换赋值的处理
                var $a = $node.parent();
                if ($a.attr('annotation') == '/REPLACE/') {
                    $a.parent().next().val(val);
                } else {
                    if ($node.hasClass('easyuitextbox')) {
                        $node.textbox({value: val});
                    } else if ($node.hasClass('easyuicombobox')) {
                        $node.combobox({value: val})
                    } else if ($node.hasClass('easyuicombotree')) {
                        $node.combotree({value: val})
                    } else if ($node.hasClass('easyuivalidatebox') || $node.hasClass('Wdate')) {
                        $node.val(data[i][key + '_MASTER']);
                        wdateValidate("#flws_cl_area_" + bm + " form input." + key);
                    } else if ($node.hasClass('TEXTBOX')) {//多选 TEXTBOX 的处理
                        $node.val(val);
                    }
                }
            }
            break;
        }
    }
    editSwitch(false, 'clear-border', 'iptreadonly');//清除easyui样式
}

/**
 * 违法嫌疑对象组合信息复用(行政案件)
 * @param currentName
 * @param currentValue
 * @param bm
 */
function fzxyDxXxfy(currentName, currentValue, bm) {
    //loading('open','正在复用嫌疑人信息，请稍等....');
    var $node = $("#flws_cl_area_" + bm + " form input[textboxname='" + currentName + "']");
    if ($node.hasClass('easyuitextbox')) {
        $node.textbox({value: currentValue})
    } else if ($node.hasClass('easyuicombobox')) {
        $node.combobox({value: currentValue});
    } else if ($node.hasClass('easyuicombotree')) {
        $node.combotree({value: currentValue})
    } else if ($node.hasClass('easyuivalidatebox') || $node.hasClass('Wdate')) {
        $node.val(currentValue);
    }
}

/**
 * 嫌疑人组合信息  字段组合成文字段信息
 * @param xyrinfo 嫌疑人数据
 * @param prefixpz 是否需要前缀
 * @param splitpz 组合信息的分隔符号
 * @returns {string} 返回为string的数据
 */
function filedToParagraph(xyrinfo, prefixpz, splitpz) {
    var xyrinfoStr = '';
    if (!splitpz) {
        splitpz = ',';//如果为空，默认为逗号
    }

    for (var key in xyrinfo) {
        var value = xyrinfo[key];
        var caseValue = null;

        if (value) {
            //配置姓名字段展示
            if (key == 'fzxyr_xm' || key == 'xm') {
                caseValue = 'xm';
            }
            //配置性别字段展示
            else if (key == 'xbdm' || key == 'fzxyr_xbdm') {
                caseValue = 'xbdm';
            }
            else {
                caseValue = key;
            }
            if (prefixpz) {
                switch (caseValue) {
                    case 'xm':
                        xyrinfoStr = "姓名:" + value + splitpz + xyrinfoStr;
                        break;
                    case 'xbdm':
                        xyrinfoStr += "性别:" + getDictName(pathConfig.mainPath + '/common/dict/GB_D_XBDM.js', value) + splitpz;
                        break;
                    case 'cyzj_cyzjdm':
                        xyrinfoStr += "证件类型:" + getDictName(pathConfig.mainPath + '/common/dict/KX_D_CYZJDM.js', value) + splitpz;
                        break;
                    case 'fzxyr_csrq':
                        xyrinfoStr += parseTimeToCN(value) + "出生" + splitpz;
                        break;
                    case 'fzxyr_zzmmdm': //政治面貌
                        xyrinfoStr += getDictName(pathConfig.mainPath + '/common/dict/GB_D_ZZMMDM.js', value) + splitpz;
                        break;
                    case 'fzxyr_jyzkdm':
                        xyrinfoStr += getDictName(pathConfig.mainPath + '/common/dict/GB_D_HYZKDM.js', value) + splitpz;
                        break;
                    case 'fzxyr_jgdm':
                        xyrinfoStr += "籍贯为:" + getDictName(pathConfig.mainPath + '/common/dict/GB_D_XZQHDM.js', value) + splitpz;
                        break;
                    case 'fzxyr_sg':
                        xyrinfoStr += "身高:" + value + "厘米" + splitpz;
                        break;
                        break;
                    case 'fzxyr_tmtzms':
                        xyrinfoStr += value + splitpz;
                        break;
                    case 'fzxyr_gzdw':
                        xyrinfoStr += "在" + value + "工作" + splitpz;
                        break;
                    case 'fzxyr_zylbdm':
                        xyrinfoStr += "职务为" + getDictName(pathConfig.mainPath + '/common/dict/KX_D_ZYLBDM.js', value) + splitpz;
                        break;
                    case 'hjdz_dzmc':
                        xyrinfoStr += "户籍地:" + value + splitpz;
                        break;
                    case 'xzz_dzmc':
                        xyrinfoStr += "现住址:" + value + splitpz;
                        break;
                    case 'dwmc':
                        xyrinfoStr += "单位名称:" + value + splitpz;
                        break;
                    case 'dwbgdz_dzmc':
                        xyrinfoStr += "办公地址:" + value + splitpz;
                        break;
                    case 'fddbr_xm':
                        xyrinfoStr += "法定待辨认姓名:" + value + splitpz;
                        break;
                }
            } else {
                switch (caseValue) {
                    case 'xm':
                        xyrinfoStr = value + splitpz + xyrinfoStr;
                        break;
                    case 'xbdm':
                        xyrinfoStr += getDictName(pathConfig.mainPath + '/common/dict/GB_D_XBDM.js', value) + splitpz;
                        break;
                    case 'cyzj_cyzjdm':
                        xyrinfoStr += getDictName(pathConfig.mainPath + '/common/dict/KX_D_CYZJDM.js', value) + splitpz;
                        break;
                    case 'fzxyr_csrq':
                        xyrinfoStr += parseTimeToCN(value) + splitpz;
                        break;
                    case 'fzxyr_zzmmdm': //政治面貌
                        xyrinfoStr += getDictName(pathConfig.mainPath + '/common/dict/GB_D_ZZMMDM.js', value) + splitpz;
                        break;
                    case 'fzxyr_jyzkdm':
                        xyrinfoStr += getDictName(pathConfig.mainPath + '/common/dict/GB_D_HYZKDM.js', value) + splitpz;
                        break;
                    case 'fzxyr_jgdm':
                        xyrinfoStr += getDictName(pathConfig.mainPath + '/common/dict/GB_D_XZQHDM.js', value) + splitpz;
                        break;
                    case 'fzxyr_sg':
                        xyrinfoStr += value + splitpz;
                        break;
                        break;
                    case 'fzxyr_tmtzms':
                        xyrinfoStr += value + splitpz;
                        break;
                    case 'fzxyr_gzdw':
                        xyrinfoStr += value + splitpz;
                        break;
                    case 'fzxyr_zylbdm':
                        xyrinfoStr += getDictName(pathConfig.mainPath + '/common/dict/KX_D_ZYLBDM.js', value) + splitpz;
                        break;
                    case 'hjdz_dzmc':
                        xyrinfoStr += value + splitpz;
                        break;
                    case 'xzz_dzmc':
                        xyrinfoStr += value + splitpz;
                        break;
                    case 'dwmc':
                        xyrinfoStr += value + splitpz;
                        break;
                    case 'dwbgdz_dzmc':
                        xyrinfoStr += value + splitpz;
                        break;
                    case 'fddbr_xm':
                        xyrinfoStr += value + splitpz;
                        break;
                }
            }

        }
    }
    return xyrinfoStr;
}