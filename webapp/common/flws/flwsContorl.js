/**
 * Created by christ on 2016/12/6.
 * description: 法律文书操作js文件
 */

/**
 * 呈请报告保存 按钮点击
 */
function saveCqbg() {
    if (DATA.CQBG.cqbgData.bx && !DATA.CQBG.status.selected) {
        alertDiv({
            title: '提示',
            msg: DATA.CQBG.cqbgData.name + '下的嫌疑对象列表必须勾选'
        });
        return;
    }

    if (DATA.CQBG.cqbgZj == undefined) {
        getCqbgQtsjAdd();
        if (DATA.CQBG.isValid) {
            cqbgSave(DATA.CQBG.cqbgData.insertUrl, DATA.CQBG.params);//发送请求
        }
    } else {
        if (!DATA.CQBG.cqbgData.customized) {//是否是自定義頁面
            getCqbgQtsjEdit();
            if (DATA.CQBG.isValid) {
                cqbgSave(DATA.CQBG.cqbgData.updateUrl, DATA.CQBG.params);//发送请求
            }
        } else {
            DATA.CQBG.params = {};
            DATA.CQBG.params.ZJ = DATA.CQBG.cqbgZj;
            cqbgSave(DATA.CQBG.cqbgData.updateUrl, DATA.CQBG.params);//发送请求
        }

    }
}


/**
 * 获取呈请报告页面数据 拼装提交后台数据 新增
 */
function getCqbgQtsjAdd() {
    $('#cqbg_main_con form').form('submit', {
        onSubmit: function () {
            var isValid = $(this).form('validate');
            DATA.CQBG.isValid = isValid;
            if (isValid) {
                //loading('open','数据处理中,请稍候...');//验证通过提交后台，开始....转圈！
                var bamjDictUrl = '',//办案民警字典url
                    bamj = '',//办案民警
                    bamjArry = [];//办案民警人员数组

                /**********呈请报告提交后台数据************/
                DATA.CQBG.params = {
                    ASJFLWSMC: DATA.CQBG.asjflwsmc,//案事件法律文书名称
                    FLWS_ASJFLWSDM: DATA.CQBG.asjflwsdm,//案事件法律文书名称
                    ASJBH: DATA.asjbh,//案事件编号
                    AJMC: DATA.publicJkXx.AJ01.AJMC,//案件名称
                    ASJZCXWDM: DATA.asjzcxwdm,//案事件侦查行为代码
                    CQZT: '0',//呈请状态
                    BADW_GAJGJGDM: DATA.publicJkXx.BADW01.BAJG_GAJGJGDM,//办案单位公安机关机关代码
                    BADW_GAJGMC: DATA.publicJkXx.BADW01.BAJG_GAJGMC//办案机关公安机关名称
                };
                /*嫌疑人姓名*/
                if (typeof DATA.CQBG.xyrxms != 'undefined' && DATA.CQBG.xyrxms != null) {
                    DATA.CQBG.params.XYRXM = DATA.CQBG.xyrxms.join(',');//嫌疑人姓名
                }

                /*嫌疑人ID*/
                if (typeof DATA.CQBG.xyrids != 'undefined' && DATA.CQBG.xyrxms != null) {
                    DATA.CQBG.params.XYRID = DATA.CQBG.xyrids.join(',');//嫌疑人ID
                }


                //循环取数据
                var cqbgTjdataArry = $('#cqbg_main_con form input[type="hidden"]');//呈请报告提交后台数据
                //遍历模板数据
                for (var i = 0; i < cqbgTjdataArry.length; i++) {
                    var paramnames = $(cqbgTjdataArry[i]).attr('name');//参数名
                    var paramvals = $(cqbgTjdataArry[i]).val();//值

                    if (paramnames) {
                        if (paramnames == 'BAMJXM') {
                            bamjArry.push(paramvals);
                            bamjDictUrl = $(cqbgTjdataArry[i]).parent().prev().attr('dicturl');
                        }
                        DATA.CQBG.params[paramnames] = paramvals;
                    }
                }

                bamj = bamjArry.join(',');//已选择办案人员
                DATA.CQBG.params.BAMJID = bamj;//办案民警身份证号码
                DATA.CQBG.params.BAMJXM = getDictName(bamjDictUrl, bamj, false);//办案民警名称
                DATA.CQBG.params.CQNR = $('#cqbg_main_con form textarea').val();//呈请内容
                DATA.CQBG.params.CQRQ = $('#cqbg_main_con form input.CQRQ').val();//呈请日期

                //呈请法律文书修改
                if (DATA.FLWS_PARAM && DATA.FLWS_PARAM.CQXG_XQ) {
                    DATA.CQBG.params.CQXG_XQ = JSON.stringify(DATA.FLWS_PARAM.CQXG_XQ);
                }

                //特殊提交数据的处理（针对不同呈请报告）
                especiallyDataFunForCqbg(DATA.CQBG.asjflwsdm);

                return false;
            } else {
                return false;	// 返回false终止表单提交
            }
        }
    })
}

/**
 * 获取呈请报告页面数据 拼装提交后台数据 编辑
 */
function getCqbgQtsjEdit() {
    $('#cqbg_main_con form').form('submit', {
        onSubmit: function () {
            var isValid = $(this).form('validate');
            DATA.CQBG.isValid = isValid;
            if (isValid) {
                var cqnr = '', cqrq = '', bamjids = [], bamjxms = '';
                if (!DATA.CQBG.cqbgData.customized) {
                    var bamjDictUrl = $('#cqbg_main_con form input.BAMJXM').attr('dicturl');//办案民警接口

                    cqnr = $('#cqbg_main_con form textarea').val();//呈请内容
                    cqrq = $('#cqbg_main_con form input.CQRQ').val();//呈请日期
                    bamjids = $('#cqbg_main_con form input.BAMJXM').combobox('getValues');//办案民警ID

                    bamjxms = getDictName(bamjDictUrl, bamjids.join(','), false);//办案民警名称
                }

                DATA.CQBG.params = {
                    BAMJXM: bamjxms,//办案民警姓名
                    BAMJID: bamjids.join(','),//办案民警ID
                    XXZJBH: DATA.CQBG.cqbgZj,//呈请报告主键
                    CQNR: cqnr,//呈请内容
                    CQRQ: cqrq//呈请日期
                };
                /*嫌疑人姓名*/
                if (typeof DATA.CQBG.xyrxms != 'undefined' && DATA.CQBG.xyrxms != null) {
                    DATA.CQBG.params.XYRXM = DATA.CQBG.xyrxms.join(',');//嫌疑人姓名
                }

                /*嫌疑人ID*/
                if (typeof DATA.CQBG.xyrids != 'undefined' && DATA.CQBG.xyrids != null) {
                    DATA.CQBG.params.XYRID = DATA.CQBG.xyrids.join(',');//嫌疑人ID
                }

                //特殊提交数据的处理（针对不同呈请报告）
                especiallyDataFunForCqbg(DATA.CQBG.asjflwsdm);

                return false;
            } else if (DATA.FLWS.cqFlwsZj) {  //呈请修改呈请报告只能能修改以下字段
                var cqnr = $('#cqbg_main_con form textarea').val();//呈请内容
                DATA.CQBG.params = {
                    XXZJBH: DATA.CQBG.cqbgZj,//呈请报告主键
                    CQNR: cqnr,//呈请内容
                };
                /*嫌疑人姓名*/
                if (typeof DATA.CQBG.xyrxms != 'undefined' && DATA.CQBG.xyrxms != null) {
                    DATA.CQBG.params.XYRXM = DATA.CQBG.xyrxms.join(',');//嫌疑人姓名
                }

                /*嫌疑人ID*/
                if (typeof DATA.CQBG.xyrids != 'undefined' && DATA.CQBG.xyrids != null) {
                    DATA.CQBG.params.XYRID = DATA.CQBG.xyrids.join(',');//嫌疑人ID
                }
                DATA.CQBG.isValid = true;
            } else if (DATA.cqgczWsBz) {  //呈请过程中呈请报告只能能修改以下字段
                var cqnr = $('#cqbg_main_con form textarea').val();//呈请内容
                DATA.CQBG.params = {
                    XXZJBH: DATA.CQBG.cqgczCqbgZj,//呈请报告主键
                    CQNR: cqnr,//呈请内容
                };
                /*嫌疑人姓名*/
                if (typeof DATA.CQBG.xyrxms != 'undefined' && DATA.CQBG.xyrxms != null) {
                    DATA.CQBG.params.XYRXM = DATA.CQBG.xyrxms.join(',');//嫌疑人姓名
                }

                /*嫌疑人ID*/
                if (typeof DATA.CQBG.xyrids != 'undefined' && DATA.CQBG.xyrids != null) {
                    DATA.CQBG.params.XYRID = DATA.CQBG.xyrids.join(',');//嫌疑人ID
                }
                DATA.CQBG.isValid = true;
            } else {
                return false;	// 返回false终止表单提交
            }
        }
    })
}

/**
 * 法律文书的保存
 * @param bm
 */
function saveFlws(bm) {
    //法律文书多联必填项的数组初始化
    DATA.FLWS[bm].isValidArry = [];
    if (DATA.FLWS[bm].flwsData.bx && !DATA.FLWS[bm].status.selected) {
        alertDiv({
            title: '提示',
            msg: DATA.FLWS[bm].flwsData.name + '下的嫌疑对象列表必须勾选'
        });
        return;
    }

    if (DATA.FLWS[bm].status.isAdd) {//新增保存
        getFlwsQtsjAdd(bm);
        //多联必填项的校验
        var isValidArry = DATA.FLWS[bm].isValidArry;

        if (isValidArry != undefined && isValidArry.length > 0) {
            var isvalid = false;
            for (var i = 0; i < isValidArry.length; i++) {
                if ($.inArray(false, isValidArry) == -1) {
                    isvalid = true;
                }
            }

            if (isvalid && DATA.FLWS[bm].checkBoxIsChecked) {
                flwsSave(DATA.FLWS[bm].flwsData.insertUrl, DATA.FLWS[bm].params, bm)
            } else {
                if (!isvalid && DATA.FLWS[bm].checkBoxIsChecked) {
                    alertDiv({
                        title: '温馨提示',
                        msg: '请检查法律文书多联中，必填项是否已填写、是否符合填写规范'
                    })
                } else if (isvalid && !DATA.FLWS[bm].checkBoxIsChecked) {
                    alertDiv({
                        title: '提示',
                        msg: '请检查文书中的单选框、复选框是否已勾选'
                    })
                }
            }
        } else {
            flwsSave(DATA.FLWS[bm].flwsData.insertUrl, DATA.FLWS[bm].params, bm)
        }

    } else {//编辑保存
        getFlwsQtsjEdit(bm);

        //多联必填项的校验
        var isValidArry = DATA.FLWS[bm].isValidArry;
        var isvalid = false;
        for (var i = 0; i < isValidArry.length; i++) {
            if ($.inArray(false, isValidArry) == -1) {
                isvalid = true;
            }
        }

        if (isvalid && DATA.FLWS[bm].checkBoxIsChecked) {
            flwsSave(DATA.FLWS[bm].flwsData.updateUrl, DATA.FLWS[bm].params, bm)
        } else {
            if (!isvalid && DATA.FLWS[bm].checkBoxIsChecked) {
                alertDiv({
                    title: '温馨提示',
                    msg: '请检查法律文书多联中，必填项是否已填写、是否符合填写规范'
                })
            } else if (isvalid && !DATA.FLWS[bm].checkBoxIsChecked) {
                alertDiv({
                    title: '提示',
                    msg: '请检查文书中的单选框、复选框是否已勾选'
                })
            }
        }
    }
}
/**
 * 获取法律文书页面数据 拼装提交后台数据 新增
 * @param bm
 */
function getFlwsQtsjAdd(bm) {
    var tabs = $('#flws_cl_area_' + bm).tabs();
    DATA.FLWS[bm].params = {
        ASJFLWSDM: bm,//案事件法律文书代码
        CQZT: '0',//呈请状态
        ASJBH: DATA.asjbh,//案事件编号
        AJMC: DATA.publicJkXx.AJ01.AJMC,//案件名称
        BADW_GAJGJGDM: DATA.publicJkXx.BADW01.BAJG_GAJGJGDM,//办案机关公安机关机关代码
        BADW_GAJGMC: DATA.publicJkXx.BADW01.BAJG_GAJGMC,//办案机关公安机关名称
        BAMJXM: DATA.OWN.userName,//办案民警姓名(没有呈请报告的法律文书向呈请报告写数据)todo
        BAMJID: DATA.OWN.userId//办案民警ID
    };

    //法律文书是否切换版本【目前只针对行政案件中 行政处罚文书 一\二版】
    if (DATA.FLWS[bm].flwsData && DATA.FLWS[bm].flwsData.switchVersion != undefined && DATA.FLWS[bm].flwsData.switchVersion) {
        var tab = $('#flws_cl_area_' + bm).tabs('getSelected');
        var index = $('#flws_cl_area_' + bm).tabs('getTabIndex', tab);
        DATA.FLWS[bm].params.VERSION = index + 1;
        tabs = [tab];
    }

    $(tabs).each(function (index, tab) {
        var num;
        //获取文书某联disabled的编号
        $($(tab).find('ul.tabs li')).each(function(i,o){
            if($(o).hasClass('tabs-disabled')){
                num = i;
            }
        });
        $(tab).find("form").form('submit', {
            onSubmit: function () {
                var currentForm = $(this);
                var isValid = currentForm.form('validate');
                DATA.FLWS[bm].isValidArry.push(isValid);
                DATA.FLWS[bm].checkBoxIsChecked = true;

                if (isValid) {

                    if (DATA.CQBG.cqbgZj != undefined) {
                        DATA.FLWS[bm].params.CQBG_ZJ = DATA.CQBG.cqbgZj;//呈请报告主键
                    }
                    //嫌疑人id
                    if (typeof DATA.FLWS[bm].xyrXxzjbh != 'undefined' && DATA.FLWS[bm].xyrXxzjbh != null) {
                        DATA.FLWS[bm].params.CLDX_XXZJBH = DATA.FLWS[bm].xyrXxzjbh;//嫌疑人主键id
                    }
                    if (typeof DATA.FLWS[bm].xyrCldxlb != 'undefined' && DATA.FLWS[bm].xyrCldxlb != null) {
                        DATA.FLWS[bm].params.CLDXLB = DATA.FLWS[bm].xyrCldxlb;//嫌疑人处理对象类别
                    }
                    if (typeof DATA.FLWS[bm].asjxgry != 'undefined' && DATA.FLWS[bm].asjxgry != null) {
                        DATA.FLWS[bm].params.ASJXGRYBH = DATA.FLWS[bm].asjxgry;//嫌疑人案事件相关人员编号
                    }
                    if (typeof DATA.FLWS[bm].fzxyrRyid != 'undefined' && DATA.FLWS[bm].fzxyrRyid != null) {
                        DATA.FLWS[bm].params.FZXYR_RYID = DATA.FLWS[bm].fzxyrRyid;//嫌疑人人员id
                    }

                    //多选
                    if (typeof DATA.FLWS[bm].xyrxms != 'undefined' && DATA.FLWS[bm].xyrxms != null) {
                        DATA.FLWS[bm].params.FZXYR_XM = DATA.FLWS[bm].xyrxms.join(',');//嫌疑人姓名
                    }
                    if (typeof DATA.FLWS[bm].xyrids != 'undefined' && DATA.FLWS[bm].xyrids != null) {
                        DATA.FLWS[bm].params.CLDX_XXZJBH = DATA.FLWS[bm].xyrids.join(',');//嫌疑人主键id
                    }
                    if (typeof DATA.FLWS[bm].xyrryids != 'undefined' && DATA.FLWS[bm].xyrryids != null) {
                        DATA.FLWS[bm].params.FZXYR_RYID = DATA.FLWS[bm].xyrryids.join(',');//嫌疑人人员id
                    }
                    if (typeof DATA.FLWS[bm].xyrasjxgrybhs != 'undefined' && DATA.FLWS[bm].xyrasjxgrybhs != null) {
                        DATA.FLWS[bm].params.ASJXGRYBH = DATA.FLWS[bm].xyrasjxgrybhs.join(',');//嫌疑人案事件相关人员编号
                    }

                    //textbox框(换行文本)的处理
                    var textboxArry = currentForm.find('a>textarea');
                    if (textboxArry) {
                        for (var r = 0; r < textboxArry.length; r++) {
                            var dataname = $(textboxArry[r]).attr('name');//参数名
                            var val = $(textboxArry[r]).val();//值
                            if (dataname) {
                                DATA.FLWS[bm].params[dataname] = val;
                            }
                        }
                    }

                    //日期插件my97单独处理
                    var dateArry = currentForm.find('a input.Wdate');
                    for (var j = 0; j < dateArry.length; j++) {
                        var dataname = $(dateArry[j]).attr('name');//参数名
                        var val = $(dateArry[j]).val();//值
                        if (dataname) {
                            DATA.FLWS[bm].params[dataname] = val;
                        }
                    }

                    var flwsA = currentForm.find('p>a');
                    for (var a = 0; a < flwsA.length; a++) {
                        var annotation = $(flwsA[a]).attr('annotation');
                        if (annotation) {
                            //除了日期之外的组件
                            var nodeTarget = $(flwsA[a]).children('.val');
                            if (nodeTarget.length > 0) {
                                var paramName = nodeTarget.attr('textboxname');//参数名
                                var nodeVal = '';//值
                                if (nodeTarget.hasClass('easyuitextbox')) {//金额的处理
                                    nodeVal = nodeTarget.textbox('getValue');//值
                                    if (!nodeVal) {
                                        nodeVal = '';
                                    }
                                    if (nodeTarget.hasClass('MONEY')) {
                                        var moneyNum = $(flwsA[a]).attr('money');
                                        DATA.FLWS[bm].params[paramName] = moneyNum;
                                        DATA.FLWS[bm].params[paramName + '_DX'] = nodeVal;
                                    } else if (nodeTarget.hasClass('NUMBERCN')) {//数字转大写的处理
                                        var numberNum = $(flwsA[a]).attr('number');
                                        DATA.FLWS[bm].params[paramName] = numberNum;
                                    } else {
                                        DATA.FLWS[bm].params[paramName] = nodeVal;
                                    }
                                } else if (nodeTarget.hasClass('easyuicombobox')) {
                                    nodeVal = nodeTarget.combobox('getValue');//值
                                    var dicturl = nodeTarget.attr('dicturl');//字典路径
                                    var dictName = annotation.substring(annotation.indexOf('{') + 1, annotation.indexOf('}'));//字典名字
                                    var dictValue = '';//字典翻译的值
                                    if (nodeVal) {
                                        dictValue = getDictName(dicturl, nodeVal, false);
                                    } else {
                                        nodeVal = '';
                                    }
                                    if (dictName == 'BD_D_KSSDM') {//羁押处所特殊处理
                                        DATA.FLWS[bm].params.JYCS_GAJGMC = dictValue;
                                        DATA.FLWS[bm].params.JYCS_GAJGJGDM = nodeVal;
                                    } else {
                                        DATA.FLWS[bm].params[paramName] = nodeVal;
                                        DATA.FLWS[bm].params[paramName + '_DICTMC'] = dictValue;
                                    }
                                } else if (nodeTarget.hasClass('easyuicombotree')) {
                                    nodeVal = nodeTarget.combotree('getValue');//值
                                    var dicturl = nodeTarget.attr('dicturl');//字典路径
                                    var dictName = annotation.substring(annotation.indexOf('{') + 1, annotation.indexOf('}'));//字典名字
                                    var dictValue = '';//字典翻译的值
                                    if (nodeVal) {
                                        dictValue = getDictName(dicturl, nodeVal, false);
                                    } else {
                                        nodeVal = '';
                                    }
                                    DATA.FLWS[bm].params[paramName] = nodeVal;
                                    DATA.FLWS[bm].params[paramName + '_DICTMC'] = dictValue;
                                }
                            }
                        }
                    }

                    //文书中textarea 处理
                    currentForm.find('td>textarea').each(function (i, textarea) {
                        var a = $(textarea).prev().find("a");
                        if (a.attr("annotation") == "/REPLACE/") {
                            var param = DATA.FLWS[bm].params;
                            param[a.attr("name")] = $(textarea).val();
                        }
                    });

                    //文书中checkbox 处理（主要针对行政案件）
                    var checkArr = [];
                    var checkboxIpt = currentForm.find("input[type='checkbox']");
                    for (var n = 0; n < checkboxIpt.length; n++) {
                        var param = DATA.FLWS[bm].params;
                        var _this = $(checkboxIpt[n]);
                        if (_this.prop('checked')) {
                            checkArr.push(_this.val());
                        }
                        param[_this.attr('name')] = checkArr.join(',');
                    }

                    //文书中checkbox验证不能为空【目前只针对行政案件XX选择框】
                    var checkboxs = currentForm.find("input[type='checkbox'][name^='XX']");
                    if (checkboxs.length > 0) {
                        if (currentForm.find('input[type="checkbox"]:checked').length < 1) {
                            DATA.FLWS[bm].checkBoxIsChecked = false;
                        } else {
                            DATA.FLWS[bm].checkBoxIsChecked = true;
                        }
                    }

                    //文书中radio 处理（主要针对行政案件）
                    var checkRadioArr = [];
                    currentForm.find("input[type='radio']").each(function (i, radio) {
                        var param = DATA.FLWS[bm].params;
                        var _this = $(radio);
                        //选中的值
                        if (_this.prop('checked')) {
                            checkRadioArr.push(_this.val());
                        }
                        param[_this.attr('name')] = checkRadioArr.join(',');
                    });

                    //文书中自定义的input[type=hidden]的处理
                    currentForm.find("a>input[type='hidden']").each(function (i, ipt) {
                        var param = DATA.FLWS[bm].params;
                        var _this = $(ipt);
                        var annotation = _this.attr('annotation');
                        if (!annotation) {
                            param[_this.attr('name')] = _this.val();
                        }
                    });
                    //法律文书必填及分组规则
                    if (DATA.CQBG.btflwsRuleSelected != undefined && DATA.FLWS[bm].params[DATA.CQBG.btflwsRuleSelected.FIELD] == undefined) {
                        DATA.FLWS[bm].params[DATA.CQBG.btflwsRuleSelected.FIELD] = DATA.CQBG.btflwsRuleSelected.VALUE;
                    }

                    //特殊提交数据的处理（针对不同法律文书）
                    especiallyDataFunForFlws(bm);

                    return false;
                } else {
                    return false;// 返回false终止表单提交
                }
            }
        });

        //文书某联disabled，则该页面的form表单不校验
        if(num){
            DATA.FLWS[bm].isValidArry[num] = true;
        }
    });
}


/**
 * 获取法律文书页面数据 拼装提交后台数据 编辑
 * @param bm
 */
function getFlwsQtsjEdit(bm) {
    var tabs = $('#flws_cl_area_' + bm).tabs();
    $(tabs).each(function (index, tab) {
        var num;
        //获取文书某联disabled的编号
        $($(tab).find('ul.tabs li')).each(function(i,o){
            if($(o).hasClass('tabs-disabled')){
                num = i;
            }
        });
        $(tab).find("form").form('submit', {
            onSubmit: function () {
                var isValid = $(this).form('validate');
                DATA.FLWS[bm].isValidArry.push(isValid);
                DATA.FLWS[bm].checkBoxIsChecked = true;
                if (isValid) {
                    //法律文书主键
                    if (!DATA.FLWS[bm].flwsData.one) {
                        if (DATA.FLWS[bm].flwsZj) {
                            DATA.FLWS[bm].params = {
                                ZJ: DATA.FLWS[bm].flwsZj
                            }
                        }
                    }

                    //嫌疑人id
                    if (typeof DATA.FLWS[bm].xyrXxzjbh != 'undefined' && DATA.FLWS[bm].xyrXxzjbh != null) {
                        DATA.FLWS[bm].params.CLDX_XXZJBH = DATA.FLWS[bm].xyrXxzjbh;//嫌疑人主键id
                    }
                    if (typeof DATA.FLWS[bm].xyrCldxlb != 'undefined' && DATA.FLWS[bm].xyrCldxlb != null) {
                        DATA.FLWS[bm].params.CLDXLB = DATA.FLWS[bm].xyrCldxlb;//嫌疑人处理对象类别
                    }
                    if (typeof DATA.FLWS[bm].asjxgry != 'undefined' && DATA.FLWS[bm].asjxgry != null) {
                        DATA.FLWS[bm].params.ASJXGRYBH = DATA.FLWS[bm].asjxgry;//嫌疑人案事件相关人员编号
                    }
                    if (typeof DATA.FLWS[bm].fzxyrRyid != 'undefined' && DATA.FLWS[bm].fzxyrRyid != null) {
                        DATA.FLWS[bm].params.FZXYR_RYID = DATA.FLWS[bm].fzxyrRyid;//嫌疑人人员id
                    }

                    //多选
                    if (typeof DATA.FLWS[bm].xyrxms != 'undefined' && DATA.FLWS[bm].xyrxms != null) {
                        DATA.FLWS[bm].params.FZXYR_XM = DATA.FLWS[bm].xyrxms.join(',');//嫌疑人姓名
                    }
                    if (typeof DATA.FLWS[bm].xyrids != 'undefined' && DATA.FLWS[bm].xyrids != null) {
                        DATA.FLWS[bm].params.CLDX_XXZJBH = DATA.FLWS[bm].xyrids.join(',');//嫌疑人主键id
                    }
                    if (typeof DATA.FLWS[bm].xyrryids != 'undefined' && DATA.FLWS[bm].xyrryids != null) {
                        DATA.FLWS[bm].params.FZXYR_RYID = DATA.FLWS[bm].xyrryids.join(',');//嫌疑人人员id
                    }
                    if (typeof DATA.FLWS[bm].xyrasjxgrybhs != 'undefined' && DATA.FLWS[bm].xyrasjxgrybhs != null) {
                        DATA.FLWS[bm].params.ASJXGRYBH = DATA.FLWS[bm].xyrasjxgrybhs.join(',');//嫌疑人案事件相关人员编号
                    }

                    var flwsA = $('#flws_cl_area_' + bm + ' form p>a');
                    for (var a = 0; a < flwsA.length; a++) {
                        var annotation = $(flwsA[a]).attr('annotation');

                        if (annotation) {
                            var getWsData = function () {
                                //日期插件my97单独处理
                                var dateArry = $(flwsA[a]).find('input.Wdate');
                                for (var j = 0; j < dateArry.length; j++) {
                                    var dataname = $(dateArry[j]).attr('name');//参数名
                                    var val = $(dateArry[j]).val();//值
                                    if (dataname) {
                                        DATA.FLWS[bm].params[dataname] = val;
                                    }
                                }

                                //除了日期之外的组件
                                var nodeTarget = $(flwsA[a]).children('.val');
                                if (nodeTarget.length > 0) {
                                    var paramName = nodeTarget.attr('textboxname');//参数名
                                    var nodeVal = '';//值
                                    if (nodeTarget.hasClass('easyuitextbox')) {//金额的处理
                                        nodeVal = nodeTarget.textbox('getValue');//值
                                        if (!nodeVal) {
                                            nodeVal = '';
                                        }
                                        if (nodeTarget.hasClass('MONEY')) {
                                            var moneyNum = $(flwsA[a]).attr('money');
                                            DATA.FLWS[bm].params[paramName] = moneyNum;
                                            DATA.FLWS[bm].params[paramName + '_DX'] = nodeVal;
                                        } else if (nodeTarget.hasClass('NUMBERCN')) {//数字转大写的处理
                                            var numberNum = $(flwsA[a]).attr('number');
                                            DATA.FLWS[bm].params[paramName] = numberNum;
                                        } else {
                                            DATA.FLWS[bm].params[paramName] = nodeVal;
                                        }
                                    } else if (nodeTarget.hasClass('easyuicombobox')) {
                                        nodeVal = nodeTarget.combobox('getValue');//值
                                        var dicturl = nodeTarget.attr('dicturl');//字典路径
                                        var dictName = annotation.substring(annotation.indexOf('{') + 1, annotation.indexOf('}'));//字典名字
                                        var dictValue = '';//字典翻译的值
                                        if (nodeVal) {
                                            dictValue = getDictName(dicturl, nodeVal, false);
                                        } else {
                                            nodeVal = '';
                                        }
                                        if (dictName == 'BD_D_KSSDM') {//羁押处所特殊处理
                                            DATA.FLWS[bm].params.JYCS_GAJGMC = dictValue;
                                            DATA.FLWS[bm].params.JYCS_GAJGJGDM = nodeVal;
                                        } else {
                                            DATA.FLWS[bm].params[paramName] = nodeVal;
                                            DATA.FLWS[bm].params[paramName + '_DICTMC'] = dictValue;
                                        }
                                    } else if (nodeTarget.hasClass('easyuicombotree')) {
                                        nodeVal = nodeTarget.combotree('getValue');//值
                                        var dicturl = nodeTarget.attr('dicturl');//字典路径
                                        var dictName = annotation.substring(annotation.indexOf('{') + 1, annotation.indexOf('}'));//字典名字
                                        var dictValue = '';//字典翻译的值
                                        if (nodeVal) {
                                            dictValue = getDictName(dicturl, nodeVal, false);
                                        } else {
                                            nodeVal = '';
                                        }
                                        DATA.FLWS[bm].params[paramName] = nodeVal;
                                        DATA.FLWS[bm].params[paramName + '_DICTMC'] = dictValue;
                                    }
                                }

                                //textarea框的处理
                                var areaArry = $(flwsA[a]).find('textarea');
                                for (var l = 0; l < areaArry.length; l++) {
                                    var dataname = $(areaArry[l]).attr('name');//参数名
                                    var val = $(areaArry[l]).val();//值
                                    DATA.FLWS[bm].params[dataname] = val;
                                }
                            };
                            if (!DATA.FLWS[bm].flwsData.bx) {//嫌疑对象不必选，编辑页面嫌疑对象信息复用，数据拼装
                                getWsData();
                            } else {//嫌疑对象必选，只获取可编辑项目的值
                                //只获取可编辑选项的值
                                var isEdit = annotation.substring(annotation.indexOf('/') + 1, annotation.lastIndexOf('/'));//可编辑的
                                if (isEdit.length > 0) {
                                    getWsData();
                                }
                            }
                        } else {
                            //文书中自定义的input[type=hidden]的处理
                            var hiddenIpt = $(flwsA[a] + ">input[type='hidden']");
                            for (var f = 0; f < hiddenIpt.length; f++) {
                                var param = DATA.FLWS[bm].params;
                                var _this = $(hiddenIpt[f]);
                                //选中的值
                                param[_this.attr('name')] = _this.val();
                            }
                        }
                    }
                    var currentForm = $('#flws_cl_area_' + bm + ' form');
                    //文书中textarea 处理
                    currentForm.find('td>textarea').each(function (i, textarea) {
                        var a = $(textarea).prev().find("a");
                        if (a.attr("annotation") == "/REPLACE/") {
                            var param = DATA.FLWS[bm].params;
                            param[a.attr("name")] = $(textarea).val();
                        }
                    });

                    //文书中checkbox 处理（主要针对行政案件）
                    var checkArr = [];
                    var checkboxIpt = currentForm.find("input[type='checkbox']");
                    for (var n = 0; n < checkboxIpt.length; n++) {
                        var param = DATA.FLWS[bm].params;
                        var _this = $(checkboxIpt[n]);
                        if (_this.prop('checked')) {
                            checkArr.push(_this.val());
                        }
                        param[_this.attr('name')] = checkArr.join(',');
                    }

                    //文书中checkbox验证不能为空【目前只针对行政案件XX选择框】
                    var checkboxs = currentForm.find("input[type='checkbox'][name^='XX']");
                    if (checkboxs.length > 0) {
                        if (currentForm.find('input[type="checkbox"]:checked').length < 1) {
                            DATA.FLWS[bm].checkBoxIsChecked = false;
                        } else {
                            DATA.FLWS[bm].checkBoxIsChecked = true;
                        }
                    }

                    //文书中radio 处理（主要针对行政案件）
                    var checkRadioArr = [];
                    var radioIpt = currentForm.find("input[type='radio']");
                    for (var m = 0; m < radioIpt.length; m++) {
                        var param = DATA.FLWS[bm].params;
                        var _this = $(radioIpt[m]);
                        //选中的值
                        if (_this.prop('checked')) {
                            checkRadioArr.push(_this.val());
                        }
                        param[_this.attr('name')] = checkRadioArr.join(',');
                    }

                    //文书中自定义的input[type=hidden]的处理
                    currentForm.find("a>input[type='hidden']").each(function (i, ipt) {
                        var param = DATA.FLWS[bm].params;
                        var _this = $(ipt);
                        var annotation = _this.attr('annotation');
                        if (!annotation) {
                            param[_this.attr('name')] = _this.val();
                        }
                    });

                    //法律文书必填及分组规则
                    if (DATA.CQBG.btflwsRuleSelected != undefined && DATA.FLWS[bm].params[DATA.CQBG.btflwsRuleSelected.FIELD] == undefined) {
                        DATA.FLWS[bm].params[DATA.CQBG.btflwsRuleSelected.FIELD] = DATA.CQBG.btflwsRuleSelected.VALUE;
                    }

                    if (DATA.FLWS.flwsxgsqbZj) {//【呈请法律文书修改】
                        DATA.FLWS[bm].params.SETU_CQXGZJ = DATA.FLWS.flwsxgsqbZj;
                    }

                    //特殊提交数据的处理
                    especiallyDataFunForFlws(bm);

                    //更新DATA.FLWS[bm].flwsRow中的数据;
                    if (bm == 'X030004' || bm == '020005') {
                        var flwsRow = DATA.FLWS[bm].flwsRow;
                        for (var i = 0; i < flwsRow.length; i++) {
                            if (DATA.FLWS[bm].flwsZj == flwsRow[i].ZJ) {
                                jQuery.extend(flwsRow[i], DATA.FLWS[bm].params);
                            }
                        }
                    }

                    return false;
                } else {
                    return false;// 返回false终止表单提交
                }
            }
        });

        //文书某联disabled，则该页面的form表单不校验
        if(num){
            DATA.FLWS[bm].isValidArry[num] = true;
        }
    })
}

/**
 * 送审呈请报告
 */
function shongshen(sessionBean, isScflws) {
    if (DATA.CQBG.cqbgZj == undefined) {//呈请报告的填写
        alertDiv({
            title: '提示',
            msg: '请填写呈请报告'
        });
        return;
    } else if (DATA.FLWS.flwsData) {//有法律文书
        var btflwsStr = DATA.CQBG.cqbgData.btflws;//必填法律文书
        var btflwsArray = [];
        if (btflwsStr) {
            //法律文書必選及規則
            if (DATA.CQBG.btflwsRule != undefined && DATA.CQBG.btflwsRule) {
                var param = {
                    CQBG_ZJ: DATA.CQBG.cqbgZj,
                    CQBG_BM: DATA.CQBG.cqbgData.bianMa
                };
                var skip = false;
                $.ajax({
                    url: pathConfig.basePath + '/wenshu/source/BTFLWS/CHECK',
                    data: param,
                    dataType: 'json',
                    async: false,
                    success: function (json) {
                        var jsonRows = json.rows;
                        if (json.state != 'success') {
                            alertDiv({
                                title: '提示',
                                msg: json.msg
                            });
                            skip = true;
                        } else if (jsonRows.length > 0) {
                            skip = true;
                            //错误列表提示语言
                            var msgs = msgListTab(jsonRows);
                            $.messager.show({
                                title: '提示',
                                msg: msgs,
                                icon: 'warning'
                            });
                        }
                    }
                });
                if (skip) {
                    return;
                }
            } else {
                if (btflwsStr.indexOf(',') == -1) {//只有一条
                    btflwsArray.push(btflwsStr);
                } else {//有多条，逗号分隔
                    btflwsArray = btflwsStr.split(",");
                }

                for (var i = 0; i < btflwsArray.length; i++) {
                    var bm = btflwsArray[i];
                    if (DATA.FLWS[bm] == undefined || !DATA.FLWS[bm] || DATA.FLWS[bm].flwsData == undefined) {
                        alertDiv({
                            title: '提示',
                            msg: "请检查法律文书"
                        });
                        return;
                    } else if (!DATA.FLWS[bm].status.hasDone) {
                        alertDiv({
                            title: '提示',
                            msg: "请填写" + DATA.FLWS[bm].flwsData.name
                        });
                        return;
                    }
                }
            }

        }
    }
    //如果不是呈请报告
    if (DATA.CQBG.cqbgData.tableName != "TB_ST_ASJ_CQBG") {
        if (DATA.CQBG.cqbgRow.CQBG_ZJ == undefined) {
            $.ajax({
                url: DATA.CQBG.cqbgData.queryUrl,
                data: {
                    ZJ: DATA.CQBG.cqbgZj
                },
                jsonType: 'json',
                success: function (data) {
                    var json = eval('(' + data + ')');
                    if (json.state == 'success') {//查询成功
                        if (json.rows.length > 0) {//有数据 编辑
                            DATA.CQBG.cqbgRow = json.rows[0];
                            if (isScflws) {
                                scflwsQuery(DATA.CQBG.cqbgRow.CQBG_ZJ, DATA.CQBG.asjflwsdm)
                            } else {
                                selectName(DATA.CQBG.cqbgRow.CQBG_ZJ, DATA.CQBG.asjflwsdm, sessionBean, DATA.asjbh);
                            }
                        }
                    }
                }
            });
        } else {
            if (isScflws) {
                scflwsQuery(DATA.CQBG.cqbgRow.CQBG_ZJ, DATA.CQBG.asjflwsdm)
            } else {
                selectName(DATA.CQBG.cqbgRow.CQBG_ZJ, DATA.CQBG.asjflwsdm, sessionBean, DATA.asjbh);
            }
        }
    } else {
        if (isScflws) {
            scflwsQuery(DATA.CQBG.cqbgZj, DATA.CQBG.asjflwsdm, sessionBean)
        } else {
            selectName(DATA.CQBG.cqbgZj, DATA.CQBG.asjflwsdm, sessionBean, DATA.asjbh);
        }
    }
}

/**
 * 列表展示
 */
function msgListTab(data) {
    var str = '';
    var xydxData = DATA.DX.xydxData;
    for (var i = 0; i < data.length; i++) {
        var tb = '', param = '', xxzjbh = '', xydx = '';
        for (var k in xyrObj) {
            if (Number(data[i].CLDXLB) == xyrObj[k].cldxlb) {
                tb = k;
                param = xyrObj[k].param;
                xxzjbh = data[i].CLDX_XXZJBH;
                xydx = xyrObj[k].text;
            }
        }
        if (tb && param && xxzjbh) {
            for (var j = 0; j < xydxData[tb].length; j++) {
                if (xxzjbh == xydxData[tb][j].xxzjbh) {
                    var name = xydxData[tb][j][param];
                    str += xydx + '(' + name + ')对应的文书<' + data[i].WENSHU_NAME + '>还未填写，请填写！'
                }
            }
        }
    }
    return str;
}
/**
 * 呈请修改呈请报告
 */
function scflwsrwForCqbg() {
    var params = {
        FLWSYW_ZJ: pathObj.flwsZj,
        FLWSXGSQB_ZJ: pathObj.flwsxgsqbZj
    };
    cqxgWsScflwsRequest(params);
}
/**
 * 没有呈请报告的法律文书，无法走流程，只能发送请求生成法律文书任务，生成pdf
 */
function scflwsrwForNoCqbg(bm) {
    if (DATA.FLWS[bm].status.isAdd) {//新增
        if (DATA.FLWS[bm].status.currentFlwsId || DATA.FLWS[bm].status.currentFlwsId != undefined) {//法律文书已经保存
            //任务表数据 拼接
            var params = {
                asjbh: DATA.asjbh,
                ajmc: DATA.publicJkXx.AJ01.AJMC,
                asjflwsdm: DATA.FLWS[bm].flwsData.bianMa,//法律文书编码
                flwsbm: DATA.FLWS[bm].flwsData.tableName,//法律文书表名
                flwsywZj: DATA.FLWS[bm].status.currentFlwsId,//法律文书业务主键
                cjsj: getCurrentTime(),//出具时间
                flwsmc: DATA.FLWS[bm].flwsData.name//法律文书名称
            };
            scflwsRequest(params);
        } else {
            alertDiv({
                title: '提示',
                msg: "请填写" + DATA.FLWS[bm].flwsData.name
            });
            return;
        }
    } else {//编辑
        if (DATA.FLWS[bm].flwsZj || DATA.FLWS[bm].flwsZj != undefined) {
            if (DATA.FLWS.cqFlwsZj) {//【呈请法律文书修改生成法律文书】
                var params = {
                    ASJFLWSDM: DATA.FLWS.flwsdm,
                    FLWSYW_ZJ: DATA.FLWS.cqFlwsZj,
                    AJMC: DATA.FLWS.ajmc,
                    ASJBH: DATA.asjbh,
                    FLWSXGSQB_ZJ: DATA.FLWS.flwsxgsqbZj
                };
                cqxgWsScflwsRequest(params);
            } else {
                //任务表数据 拼接
                var params = {
                    asjbh: DATA.asjbh,
                    ajmc: DATA.publicJkXx.AJ01.AJMC,
                    asjflwsdm: DATA.FLWS[bm].flwsData.bianMa,//法律文书编码
                    flwsbm: DATA.FLWS[bm].flwsData.tableName,//法律文书表名
                    flwsywZj: DATA.FLWS[bm].flwsZj,//法律文书业务主键
                    cjsj: getCurrentTime(),//出具时间
                    flwsmc: DATA.FLWS[bm].flwsData.name//法律文书名称
                };
                scflwsRequest(params);
            }
        } else {
            alertDiv({
                title: '提示',
                msg: "请填写" + DATA.FLWS[bm].flwsData.name
            });
            return;
        }
    }
}

/**
 * 提交数据的特殊处理  呈请报告
 * @param bm  呈请报告编码
 */
function especiallyDataFunForCqbg(bm) {
    var params = DATA.CQBG.params;
    switch (bm) {
        case '090006'://呈请犯罪嫌疑人申请
            params.BAMJID = DATA.OWN.userId;//当前登录者民警ID
            params.BAMJXM = DATA.OWN.userName;//当前登录者民警姓名
            break;
    }
}


function xzcfgzbl(params) {
    var $GZNRTKDM = $("a[name='GZNRTKDM']").find('.val');
    var GZNRTKDMArr = $GZNRTKDM.combobox('getValues');
    var dicturl = $GZNRTKDM.attr('dicturl');//字典路径
    var GZNRTKDMDICTMCArr = [];
    for (var zi = 0; zi < GZNRTKDMArr.length; zi++) {
        GZNRTKDMDICTMCArr.push(getDictName(dicturl, GZNRTKDMArr[zi], false));
    }
    params.GZNRTKDM_DICTMC = GZNRTKDMDICTMCArr.join('和');
    params.GZNRTKDM = GZNRTKDMArr.join(',');
    if(params.GZNRTKDM_DICTMC){
        params.GZNRTKDM_DICTMC = params.GZNRTKDM_DICTMC + '的规定,对你进行';
    }
    params.CFGZNR = params.GZNR + params.GZNRTKDM_DICTMC  + params.GZNRCFFDDM_DICTMC;
    if (GZNRTKDMArr.length > 1) {
        params.GZNRCFFDDM = '';
        params.GZNRCFFDDM_DICTMC = '';
        params.CFGZNR = params.GZNR + params.GZNRTKDM_DICTMC  + params.GZNRCFFDMS;
    } else {
        params.GZNRCFFDMS = '';
    }
    return params;
}

/**
 * 提交数据的特殊处理  法律文书
 * @param bm  法律文书编码
 */
function especiallyDataFunForFlws(bm) {
    var params = DATA.FLWS[bm].params;
    switch (bm) {
        case '042155'://取保候审人保|财保(刑事案件)
            if (params.BZR_XM && !params.BZJ) {
                params.ASJFLWSDM = '042155';
                params.QBLX = 'R';
            } else if (!params.BZR_XM && params.BZJ) {
                params.ASJFLWSDM = '042104';
                params.QBLX = 'C';
            }
            break;
        case '110006'://告知书(刑事案件)  批准时间(PZSJ)获取当前系统时间
            params.PZSJ = getCurrentTime();
            break;
        case 'X060003'://拘留审查决定书(行政案件)
            if (params.QXXZ == '1') {
                params.ASJFLWSDM = 'X060003';
            } else if (params.QXXZ == '2') {
                params.ASJFLWSDM = 'X060012';
            }
            break;
        case 'X060007'://限制活动范围决定书(行政案件)
            if (params.QXXZ == '1') {
                params.ASJFLWSDM = 'X060007';
            } else if (params.QXXZ == '2') {
                params.ASJFLWSDM = 'X060013';
            }
            break;
        case 'X020001'://行政处罚告知笔录-有听证（行政案件）
            if (params.XX == '1,2') {
                params.ASJFLWSDM = 'X020001';//行政处罚告知笔录
            } else {
                params.ASJFLWSDM = 'X020016';//行政处罚告知笔录（无听证）
            }
            params = xzcfgzbl(params);
            break;
        case 'X020016'://行政处罚告知笔录-无听证（行政案件）
            if (params.XX == '1,2') {
                params.ASJFLWSDM = 'X020001';//行政处罚告知笔录
            } else {
                params.ASJFLWSDM = 'X020016';//行政处罚告知笔录（无听证）
            }
            params = xzcfgzbl(params);
            break;
        case '042162'://行政处罚告知笔录-有听证（刑事案件）
            if (params.XX == '1,2') {
                params.ASJFLWSDM = '042162';//行政处罚告知笔录
            } else {
                params.ASJFLWSDM = '042161';//行政处罚告知笔录（无听证）
            }
            params = xzcfgzbl(params);
            break;
        case '042161'://行政处罚告知笔录-无听证（刑事案件）
            if (params.XX == '1,2') {
                params.ASJFLWSDM = '042162';//行政处罚告知笔录
            } else {
                params.ASJFLWSDM = '042161';//行政处罚告知笔录（无听证）
            }
            params = xzcfgzbl(params);
            break;
        case 'X040002'://传唤证（行政案件）
            if (params.CLDXLB == '1') {//对违法嫌疑人传唤
                params.ASJFLWSDM = 'X040002';
            } else if (params.CLDXLB == '2') {//对违法嫌疑单位传唤
                params.ASJFLWSDM = 'X040023';
            }
            break;
        case 'X040023'://传唤证（行政案件）
            if (params.CLDXLB == '1') {//对违法嫌疑人传唤
                params.ASJFLWSDM = 'X040002';
            } else if (params.CLDXLB == '2') {//对违法嫌疑单位传唤
                params.ASJFLWSDM = 'X040023';
            }
            break;
        case 'X050002'://当场处罚决定书（行政案件）
            if (params.SJWPQD == '1,1' || params.SJWPQD == '2,1' || params.SJWPQD == '3,1') {//对违法嫌疑人传唤
                params.SJWPQD = '1';
            } else {
                params.SJWPQD = '';
            }
            break;
        case 'X040017'://证据保全决定书（行政案件）
            if (params.KYKL == '1') {//扣押扣留
                params.ASJFLWSDM = 'X040024';
            } else if (params.KYKL == '2') {//延长扣押扣留
                params.ASJFLWSDM = 'X040025';
            } else if (params.CF == '1') {//查封
                params.ASJFLWSDM = 'X040026';
            } else if (params.CF == '2') {//延长查封
                params.ASJFLWSDM = 'X040027';
            } else {
                params.ASJFLWSDM = 'X040017';
            }
            break;
        case 'X040024'://证据保全决定书（行政案件）
            if (params.KYKL == '1') {//扣押扣留
                params.ASJFLWSDM = 'X040024';
            } else if (params.KYKL == '2') {//延长扣押扣留
                params.ASJFLWSDM = 'X040025';
            } else if (params.CF == '1') {//查封
                params.ASJFLWSDM = 'X040026';
            } else if (params.CF == '2') {//延长查封
                params.ASJFLWSDM = 'X040027';
            } else {
                params.ASJFLWSDM = 'X040017';
            }
            break;
        case 'X040025'://证据保全决定书（行政案件）
            if (params.KYKL == '1') {//扣押扣留
                params.ASJFLWSDM = 'X040024';
            } else if (params.KYKL == '2') {//延长扣押扣留
                params.ASJFLWSDM = 'X040025';
            } else if (params.CF == '1') {//查封
                params.ASJFLWSDM = 'X040026';
            } else if (params.CF == '2') {//延长查封
                params.ASJFLWSDM = 'X040027';
            } else {
                params.ASJFLWSDM = 'X040017';
            }
            break;
        case 'X040026'://证据保全决定书（行政案件）
            if (params.KYKL == '1') {//扣押扣留
                params.ASJFLWSDM = 'X040024';
            } else if (params.KYKL == '2') {//延长扣押扣留
                params.ASJFLWSDM = 'X040025';
            } else if (params.CF == '1') {//查封
                params.ASJFLWSDM = 'X040026';
            } else if (params.CF == '2') {//延长查封
                params.ASJFLWSDM = 'X040027';
            } else {
                params.ASJFLWSDM = 'X040017';
            }
            break;
        case 'X040027'://证据保全决定书（行政案件）
            if (params.KYKL == '1') {//扣押扣留
                params.ASJFLWSDM = 'X040024';
            } else if (params.KYKL == '2') {//延长扣押扣留
                params.ASJFLWSDM = 'X040025';
            } else if (params.CF == '1') {//查封
                params.ASJFLWSDM = 'X040026';
            } else if (params.CF == '2') {//延长查封
                params.ASJFLWSDM = 'X040027';
            } else {
                params.ASJFLWSDM = 'X040017';
            }
            break;
    }
}