// ==UserScript==
// @name        Modulo
// @namespace   Modulo
// @description http://www.qlcoder.com/task/760b
// @version     1
// @grant       none
// ==/UserScript==
/*
猎取相关数据
创建坐标碎片
碎片属性 坐标 value 基础value
拖动后 更新属性
*/
var url = 'http://www.qlcoder.com/train/automodu';
if (location.href != url) return;
document.body.onselectstart = "return false";
//console.info(123);



var modulo = {
    //    初始化
    init: function () {
        createStyle('http://localhost/frame/qlcoder/qlcoder.css');
        top.topModulo = modulo;

        //        常量、数据初始化
        this.$dom.$body = $('body');
        var str = this.$dom.$body.text();
        str = str.slice(str.indexOf('{"'), str.indexOf(']}') + 2);
        this.info.data = $.parseJSON(str);
        this.info.level = this.info.data.level;
        this.info.modu = this.info.data.modu;
        //        基础dom初始化
        //    创建容器
        this.$dom.$body.append('<div class="zty-desk"><div class="zty-map zty-table"></div></div>');
        this.$dom.$body.append('<div id="zty-toogle"></div>');
        this.$dom.$body.append('<div id="zty-userSuccess"></div>');
        this.$dom.$desk = $('.zty-desk');
        this.$dom.$map = this.$dom.$desk.find('.zty-map');
        this.$dom.$desk.append('<div class="zty-tmp-map"></div>');
        var length = this.info.data.map.length * this.const.cellWidth;



        //    创建静态原始地图

        $.each(modulo.info.data.map, function (index, value) {
            var $row = modulo.$dom.$map.append('<div class="zty-row"></div>').find('.zty-row:last');
            var str = this;
            for (var i = 0; i < str.length; i++) {
                //            console.info(str.charAt(i));
                var $cell = $row.append('<div class="zty-cell"></div>').find('.zty-cell:last');
                if (str.charAt(i) != '0') $cell.text(str.charAt(i)).addClass('zty-cell1');
                $cell.attr({
                    coordinate: 'x' + i + 'y' + index,
                    baseValue: str.charAt(i),
                    value: str.charAt(i)
                });
                //            console.info(modulo.map['x' + i + 'y' + index]);
            }

        });


        //    创建碎片
        $.each(modulo.info.data.pieces, function (index, value) {
            //        创建每一块
            var rootIndex = index;
            var $piece = modulo.$dom.$desk.append('<div class="zty-piece zty-table"></div>').find('.zty-piece:last');
            var str = this;
            var arr = str.split(',');
            //        列宽
            var max = 0;
            //        console.info(arr);
            $.each(arr, function (index, value) {
                //            console.info(arr);
                //                            console.info(this.length);
                if (this.length > max) max = this.length;
            });
            //        console.info(max + '----');
            var positon = $piece.position();

            $.each(arr, function (index, value) {
                //        创建每一行
                var $row = $piece.append('<div class="zty-row"></div>').find('.zty-row:last');
                //            创建每一个
                var str = this;
                for (var i = 0; i < max; i++) {
                    var $cell = $row.append('<div class="zty-cell"></div>').find('.zty-cell:last');
                    var x = ($cell.offset().left - modulo.const.position) / modulo.const.cellWidth;
                    var y = ($cell.offset().top - modulo.const.position) / modulo.const.cellWidth;
                    var value = 0;
                    if (str.charAt(i) == 'X') {
                        $cell.addClass('zty-cell1').text('1');
                        value = 1;
                        $cell.text(value);
                    }
                    console.info(x,y);
                    $cell.attr({
                        coordinate: 'x' + x + 'y' + y,
                        baseValue: value,
                        value: value,
                    });
                }
            });
            setTimeout(function () {

                //                console.info(modulo.pieces);
                //                console.info($piece.width());
                if (positon.left < modulo.pieces.width) {
                    $piece.css({
                        left: modulo.pieces.width + $piece.width() + modulo.const.cellWidth
                    });
                }
                modulo.pieces.width += $piece.width() + modulo.const.cellWidth + 40;
            }, 100);
        });

        $('.zty-tmp-map').css({
            height: length,
            width: length,
            marginLeft: 3 * length,
            marginTop: 2 * length
        });
        $('#zty-toogle').on({
            click: function () {
                if ($desk.is(':visible')) $desk.hide();
                else $desk.show();
            }
        });
        $('#zty-userSuccess').on({
            click: function () {
                this.userSuccess();
            }
        });

        modulo.functions.drag();

    },
    //    常量
    const: {
        timer: '',
        time: 2000,
        //地图原点坐标相对屏幕原点偏移
        position: 20,
        answer: '',
        zIndex: 11,
        cellWidth: 20,
        dragging: false,
    },
    //    jquery对象
    $dom: {
        $body: {},
        $desk: {},
        $map: {},
    },
    info: {
        data: '',
        level: '',
        modu: '',
    },
    pieces: {
        //碎片区块初始间隔
        width: 20,
        //碎片区块初始y坐标
        height: 100,
    },
    tmp: {
        $piece: {},
    },
    functions: {
        drag: function () {
            //        拖动
            var oX = 0,
                oY = 0;
            $(document).on({
                mouseup: function () {
                    if (modulo.const.dragging) modulo.functions.dragOver();
                },
                mousemove: function (e) {
                    if (modulo.const.dragging) {
                        modulo.tmp.$piece.css({
                            top: e.clientY - oY + modulo.const.position,
                            left: e.clientX - oX + modulo.const.position
                        });
                    }
                }
            });
            $('.zty-piece').each(function () {
                var $this = $(this);
                $this.on({
                    mousedown: function (e) {
                        modulo.tmp.$piece = $this;
                        modulo.const.dragging = true;
                        oX = e.clientX - modulo.tmp.$piece.position().left + modulo.const.position;
                        oY = e.clientY - modulo.tmp.$piece.position().top + modulo.const.position;
                        modulo.const.zIndex += 1;
                        $this.css({
                            zIndex: modulo.const.zIndex
                        });
                    }
                });
            });
        },
        dragOver: function () {
            modulo.const.dragging = false;
            var offset = modulo.tmp.$piece.offset();
            //        console.info(offset.left);
            modulo.tmp.$piece.css({
                top: Math.floor((offset.top - modulo.const.position) / modulo.const.cellWidth) * modulo.const.cellWidth,
                left: Math.floor((offset.left - modulo.const.position) / modulo.const.cellWidth) * modulo.const.cellWidth
            });
            //        更新用户地图
            modulo.tmp.$piece.find('.zty-cell1').each(function (index, element) {
                var $this = $(this);
                //            猎取新坐标
                //            老坐标处所有碎片数据更新 value text class
                //            新坐标处所有碎片数据更新 value text class
                //            更新新坐标
                var x = ($this.offset().left - modulo.const.position) / modulo.const.cellWidth;
                var y = ($this.offset().top - modulo.const.position) / modulo.const.cellWidth;
                var value = $this.attr('value');
                var oldCoordinate = $this.attr('coordinate');
                var oldValue = value == $this.attr('baseValue') ? value : $this.attr('value') - $this.attr('baseValue');
                var oldText = oldValue % modulo.info.modu;
                var newCoordinate = 'x' + x + 'y' + y;
//                console.info(oldCoordinate, newCoordinate);
                if (oldCoordinate == newCoordinate) return;
                var newValue = $('.zty-cell1[coordinate="' + newCoordinate + '"]').not($this).eq(0).attr('value') || 0;
                console.info(newCoordinate);
                console.info($('.zty-cell1[coordinate=' + newCoordinate + ']'));
                newValue = +newValue + (+$this.attr('baseValue'));
                //            console.info($('.zty-cell1[coordinate=' + newCoordinate + ']').not($this).eq(0).attr('value') || 0);
                //            console.info((+$this.attr('baseValue')));
                //            console.info('----------');
                //            console.info($('.zty-cell1[coordinate=' + newCoordinate + ']').not($this).eq(0).attr('value') || 0+'--------');
                //            console.info(newValue);
//                console.info(oldCoordinate, newCoordinate);
                var newText = newValue % modulo.info.modu;
                $('.zty-cell1[coordinate="' + oldCoordinate + '"]').each(function () {
                    var $this = $(this);
                    $this.text(oldText).attr({
                        value: oldValue
                    });
                    if (oldText % modulo.info.modu == 0) $this.addClass('zty-cell1fff');
                    else $this.removeClass('zty-cell1fff');
                });
                $this.attr({
                    coordinate: newCoordinate
                });

                $('.zty-cell1[coordinate=' + newCoordinate + ']').each(function () {
                    var $this = $(this);
                    $(this).text(newText).attr({
                        value: newValue
                    });
                    if (newText % modulo.info.modu == 0) $this.addClass('zty-cell1fff');
                    else $this.removeClass('zty-cell1fff');
                });
                //-----------------------------------

            });
            //        判断是否成功
            clearTimeout(modulo.const.timer);
            modulo.const.timer = setTimeout(function () {
                //                isSuccess();
            }, modulo.const.time);
        }
    }
};



$(document).ready(function () {
    modulo.init();
    //    //    清除原有样式
    //        $('link').remove();
    //    createStyle('http://localhost/frame/qlcoder/qlcoder.css');
    //    setTimeout(function () {
    //        xilang();
    //    }, 1000);
});

function createScript(_url, _callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = _url;
    document.body.appendChild(script);
    script.onload = function () {
        _callback()
    }
}

function createStyle(_url) {
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';

    style.href = _url;
    document.body.appendChild(style);
}