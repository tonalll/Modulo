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


var $url = 'http://apps.bdimg.com/libs/jquery/1.11.3/jquery.min.js';
createScript($url, $callback);
createStyle('http://localhost/frame/qlcoder/qlcoder.css');

top.topModulo = {};
modulo = top.topModulo;
//   创建相关对象
modulo.$body;
modulo.data;
modulo.level;
modulo.modu;
modulo.timer;
modulo.time = 2000;
//地图原点坐标相对屏幕原点偏移
modulo.position = 20;
modulo.answer = '';
//碎片区块初始间隔
modulo.pieces = {};
modulo.pieces.width = 20;
//碎片区块初始y坐标
modulo.pieces.height = 100;
modulo.maxWidth;
modulo.maxHeight;
//z轴索引
modulo.zIndex = 11;
//碎片大小
modulo.cellWidth = 20;

modulo.userSuccess = function () {
    var success = false;
    modulo.answer = '';
    //    if ($('.cell1:contains(0)').length == $('.cell1').length) success = true;
    success = true;
    if (success) {
        $('.piece').each(function () {
            var $this = $(this);
            var offset = $this.offset();
            modulo.answer += (offset.top - modulo.position) / modulo.cellWidth + '' + (offset.left - modulo.position) / modulo.cellWidth;
        });
        console.info(modulo.answer);
        $('#solution').val(modulo.answer);
        //            把答案写入本地
        localStorage['level' + modulo.level] = modulo.answer;
    }
}

//----------------$callback
function $callback() {
    //    console.info('jquery is ready!');

    /*
猎取相关数据
创建坐标碎片
碎片属性 坐标 value 基础value
拖动后 更新属性
    */

    modulo.$body = $('body');

    var str = modulo.$body.text();
    str = str.slice(str.indexOf('{'), str.indexOf('}') + 1);
    modulo.data = $.parseJSON(str);
    modulo.level = modulo.data.level;
    modulo.modu = modulo.data.modu;
    //    创建容器
    modulo.$body.append('<div class="desk"><div class="map table"></div></div>');
    modulo.$body.append('<div id="toogle"></div>');
    modulo.$body.append('<div id="userSuccess"></div>');


    var $desk = $('.desk');
    var $map = $desk.find('.map');
    $desk.append('<div class="tmp-map"></div>');
    var length = modulo.data.map.length * modulo.cellWidth;
    $('.tmp-map').css({
        height: length,
        width: length,
        marginLeft: 3 * length,
        marginTop: 2 * length
    });
    $('#toogle').on({
        click: function () {
            if ($desk.is(':visible')) $desk.hide();
            else $desk.show();
        }
    });
    $('#userSuccess').on({
        click: function () {
            modulo.userSuccess()
        }
    });
    //    console.info(modulo.data.map);
    //    创建静态原始地图

    $.each(modulo.data.map, function (index, value) {
        var $row = $map.append('<div class="row"></div>').find('.row:last');
        var str = this;
        for (var i = 0; i < str.length; i++) {
            //            console.info(str.charAt(i));
            var $cell = $row.append('<div class="cell"></div>').find('.cell:last');
            if (str.charAt(i) != '0') $cell.text(str.charAt(i)).addClass('cell1');
            $cell.attr({
                coordinate: 'x' + i + 'y' + index,
                baseValue: str.charAt(i),
                value: str.charAt(i)
            });
            //            console.info(modulo.map['x' + i + 'y' + index]);
        }

    });
    //    创建碎片
    $.each(modulo.data.pieces, function (index, value) {
        //        创建每一块
        var rootIndex = index;
        var $piece = $desk.append('<div class="piece table"></div>').find('.piece:last');
        var str = this;
        var arr = str.split(',');
        //        列宽
        var max = 0;
        //        console.info(arr);
        $.each(arr, function (index, value) {
            //            console.info(arr);
            //            console.info(this.length);
            if (this.length > max) max = this.length;
        });
        //        console.info(max + '----');
        var positon = $piece.position();
        //        console.info(positon);
        //        console.info(modulo.pieces.width);
        //        console.info(modulo.pieces.width, $piece.width());
        //        console.info(modulo.pieces.width, $piece.width(), modulo.cellWidth);
        if (positon.left < modulo.pieces.width) {
            $piece.css({
                left: modulo.pieces.width + $piece.width() + modulo.cellWidth
            });
        }
        $.each(arr, function (index, value) {
            //        创建每一行
            var $row = $piece.append('<div class="row"></div>').find('.row:last');
            //            创建每一个
            var str = this;
            for (var i = 0; i < max; i++) {
                var $cell = $row.append('<div class="cell"></div>').find('.cell:last');
                var x = ($cell.offset().left - modulo.position) / modulo.cellWidth;
                var y = ($cell.offset().top - modulo.position) / modulo.cellWidth;
                var value = 0;
                if (str.charAt(i) == 'X') {
                    $cell.addClass('cell1').text('1');
                    value = 1;
                    $cell.text(value);
                }
                $cell.attr({
                    coordinate: 'x' + x + 'y' + y,
                    baseValue: value,
                    value: value,
                });
            }
        });
        modulo.pieces.width += $piece.width() + modulo.cellWidth;
    });
    //            拖动
    var $piece,
        dragging = false,
        oX = 0,
        oY = 0;
    $(document).on({
        mouseup: function () {
            if (dragging) dragOver();
        },
        mousemove: function (e) {
            if (dragging) {
                $piece.css({
                    top: e.clientY - oY + modulo.position,
                    left: e.clientX - oX + modulo.position
                });
            }
        }
    });
    $('.piece').each(function () {
        var $this = $(this);
        $this.on({
            mousedown: function (e) {
                $piece = $this;
                dragging = true;
                oX = e.clientX - $piece.position().left + modulo.position;
                oY = e.clientY - $piece.position().top + modulo.position;
                modulo.zIndex += 1;
                $this.css({
                    zIndex: modulo.zIndex
                });
            }
        });
    });

    function dragOver() {
        dragging = false;
        var offset = $piece.offset();
        //        console.info(offset.left);
        $piece.css({
            top: Math.floor((offset.top - modulo.position) / modulo.cellWidth) * modulo.cellWidth,
            left: Math.floor((offset.left - modulo.position) / modulo.cellWidth) * modulo.cellWidth
        });
        //        更新用户地图
        $piece.find('.cell1').each(function (index, element) {
            var $this = $(this);
            //            猎取新坐标
            //            老坐标处所有碎片数据更新 value text class
            //            新坐标处所有碎片数据更新 value text class
            //            更新新坐标
            var x = ($this.offset().left - modulo.position) / modulo.cellWidth;
            var y = ($this.offset().top - modulo.position) / modulo.cellWidth;
            var value = $this.attr('value');
            var oldCoordinate = $this.attr('coordinate');
            var oldValue = value == $this.attr('baseValue') ? value : $this.attr('value') - $this.attr('baseValue');
            var oldText = oldValue % modulo.modu;
            var newCoordinate = 'x' + x + 'y' + y;
            var newValue = $('.cell1[coordinate=' + newCoordinate + ']').not($this).eq(0).attr('value') || 0;
            newValue = +newValue + (+$this.attr('baseValue'));
            //            console.info($('.cell1[coordinate=' + newCoordinate + ']').not($this).eq(0).attr('value') || 0);
            //            console.info((+$this.attr('baseValue')));
            //            console.info('----------');
            //            console.info($('.cell1[coordinate=' + newCoordinate + ']').not($this).eq(0).attr('value') || 0+'--------');
            //            console.info(newValue);
            var newText = newValue % modulo.modu;
            $('.cell1[coordinate=' + oldCoordinate + ']').each(function () {
                var $this = $(this);
                $this.text(oldText).attr({
                    value: oldValue
                });
                if (oldText % modulo.modu == 0) $this.addClass('cell1fff');
                else $this.removeClass('cell1fff');
            });
            $this.attr({
                coordinate: newCoordinate
            });

            $('.cell1[coordinate=' + newCoordinate + ']').each(function () {
                var $this = $(this);
                $(this).text(newText).attr({
                    value: newValue
                });
                if (newText % modulo.modu == 0) $this.addClass('cell1fff');
                else $this.removeClass('cell1fff');
            });
            //-----------------------------------

        });
        //        判断是否成功
        clearTimeout(modulo.timer);
        modulo.timer = setTimeout(function () {
            isSuccess();
        }, modulo.time);
    }

    function isSuccess() {
        var success = false;
        modulo.answer = '';
        if ($('.cell1:contains(0)').length == $('.cell1').length) success = true;
        if (success) {
            $('.piece').each(function () {
                var $this = $(this);
                var offset = $this.offset();
                modulo.answer += (offset.top - modulo.position) / modulo.cellWidth + '' + (offset.left - modulo.position) / modulo.cellWidth;
            });
            console.info(modulo.answer);
            $('#solution').val(modulo.answer);
            //            把答案写入本地
            localStorage['level' + modulo.level] = modulo.answer;
        }
    }

}
//----------------$callback


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