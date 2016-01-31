// ==UserScript==
// @name        Modulo
// @namespace   Modulo
// @description http://www.qlcoder.com/task/760b
// @version     1
// @grant       none
// ==/UserScript==

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
modulo.map = {};
modulo._map = {};
modulo.pieces = [];
modulo.level;
modulo.modu;
modulo.timer;
modulo.time = 2000;
modulo.position = 20;
modulo.answer = '';
modulo.pieces.width = 20;
modulo.pieces.height = 100;
modulo.maxWidth;
modulo.maxHeight;
modulo.zIndex = 11;
modulo.cellWidth = 20;

modulo.userSuccess = function () {
    modulo.answer = '';
    $.each(modulo.pieces, function (index, value) {
        var $this = this;
        var offset = $this.offset();
        modulo.answer += (offset.top - modulo.position) / modulo.cellWidth + '' + (offset.left - modulo.position) / modulo.cellWidth;
    });
    console.info(modulo.answer);
    $('#solution').val(modulo.answer);
    //            把答案写入本地
    localStorage['level' + modulo.level] = modulo.answer;
}

//----------------$callback
function $callback() {
    console.info('jquery is ready!');

    /*
    猎取基础数据
    创建地图对象
    定义新地图对象
    创建区块对象
    
    创建弹出层
    
    创建画布
    创建区块
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
    //创建地图，把地图放入map
    //    console.info(modulo.data.map);
    $.each(modulo.data.map, function (index, value) {
        var $row = $map.append('<div class="row"></div>').find('.row:last');
        //        console.info($row);
        //        console.info(this);
        //        console.info(index);
        //        console.info(value);
        var str = this;
        for (var i = 0; i < str.length; i++) {
            //            console.info(str.charAt(i));
            var $cell = $row.append('<div class="cell">1</div>').find('.cell:last');
            if (str.charAt(i) == '1') {
                $cell.addClass('cell1');

                modulo.map['x' + i + 'y' + index] = {
                    x: i,
                    y: index,
                    value: 1,
                };
                //                modulo.map[index * str.length + i].push()

            } else {
                modulo.map['x' + i + 'y' + index] = {

                    x: i,
                    y: index,
                    value: 0,
                };
            }
            modulo._map['x' + i + 'y' + index] = {

                x: i,
                y: index,
                value: 0,
                arr: []
            };
            //            console.info(modulo.map['x' + i + 'y' + index]);
        }

    });
    //    创建碎片
    $.each(modulo.data.pieces, function (index, value) {
        //        创建每一块
        var rootIndex = index;
        var $piece = $desk.append('<div class="piece table"></div>').find('.piece:last');
        modulo.pieces.push($piece);
        var str = this;
        var arr = str.split(',');
        var max = 0;
        //        console.info(arr);
        $.each(arr, function (index, value) {
            //            console.info(arr);
            //            console.info(this.length);
            if (this.length > max) max = this.length;
        });
        //        console.info(max + '----');

        var positon = $piece.position();
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
                if (str.charAt(i) == 'X') {
                    $cell.addClass('cell1').attr({
                        dataName: 'x' + x + 'y' + y
                    });
                }


                $cell.attr({
                    dataName: 'x' + x + 'y' + y
                });
                var dataName = $cell.attr('dataName');
                //            var domData = $this.data();

                //            var name = 'x' + x + 'y' + y;
                //            domData.x = x;
                //            domData.y = y;

                modulo._map[dataName] = modulo._map[dataName] || {};
                var _mapUnit = modulo._map[dataName];
                _mapUnit.x = x;
                _mapUnit.y = y;
                _mapUnit.arr = _mapUnit.arr || [];
                _mapUnit.arr.push(1);
                _mapUnit.value = _mapUnit.arr.length % modulo.modu;



            }
        });
        modulo.pieces.width += $piece.width() + modulo.cellWidth;
        //        $piece.find('.cell1').text('1');


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


            //            更新原来坐标
            //            var domData = $this.data();
            //                            console.info(domData);
            var dataName = $this.attr('dataName');
            //            console.info(dataName);

            if (dataName) {
                var _mapUnit = modulo._map[dataName];
                //                原来为1的不变
//                console.info(_mapUnit.arr);
                //                                console.info(_mapUnit.value + '-------');
                if (_mapUnit.arr.length > 0) {

                    _mapUnit.arr.pop();
                    //                console.info(_mapUnit.arr);
                    if (modulo.map[dataName]) _mapUnit.value = (modulo.map[dataName].value + _mapUnit.arr.length) % modulo.modu;
                    else _mapUnit.value = _mapUnit.arr.length % modulo.modu;
                    $('.cell1[dataName=' + dataName + ']').not($this).each(function () {
                        $(this).text(_mapUnit.value);
                        if (_mapUnit.value == 0) $(this).addClass('cell1fff');
                        else $(this).removeClass('cell1fff');
                    });
                }

            }
            //            更新新坐标
            var x = ($this.offset().left - modulo.position) / modulo.cellWidth;
            var y = ($this.offset().top - modulo.position) / modulo.cellWidth;

            $this.attr({
                dataName: 'x' + x + 'y' + y
            });
            var dataName = $this.attr('dataName');

            modulo._map[dataName] = modulo._map[dataName] || {};
            var _mapUnit = modulo._map[dataName];
            _mapUnit.x = x;
            _mapUnit.y = y;
            _mapUnit.arr = _mapUnit.arr || [];
            //            if (_mapUnit.arr.length != 1) _mapUnit.arr.push(1);
            _mapUnit.arr.push(1);
            //            debugger;
            _mapUnit.value = _mapUnit.arr.length % modulo.modu;
            //            判断是否消除
            var text;
            if (modulo.map[dataName]) {
                text = (modulo.map[dataName].value + modulo._map[dataName].value) % modulo.modu;
            } else {
                text = (modulo._map[dataName].value) % modulo.modu;
            }
            if (text == 0) {
                $this.addClass('cell1fff');

            } else {
                $this.removeClass('cell1fff');
                $('.cell1[dataName=' + dataName + ']').each(function () {
                    $(this).text(text);
//                    console.info(text);
                    //                        if (_mapUnit.value == modulo.modu) $(this).addClass('cell1fff');
                    //                        else $(this).removeClass('cell1fff');
                });
            }

            /*if (modulo.map[dataName]) {
                var text = (modulo.map[dataName].value + modulo._map[dataName].value) % modulo.modu;
                if (text == 0) {
                    $this.addClass('cell1fff');

                } else {
                    $this.removeClass('cell1fff');
                    $('.cell1[dataName=' + dataName + ']').each(function () {
                        $(this).text(text);
                        console.info(text);
                        //                        if (_mapUnit.value == modulo.modu) $(this).addClass('cell1fff');
                        //                        else $(this).removeClass('cell1fff');
                    });
                }

            } else {
                var text = (modulo._map[dataName].value) % modulo.modu;

            }*/
            //            var text=modulo.map[dataName].value + modulo._map[dataName].value) % modulo.modu;
            /*if (modulo.map[dataName] && (modulo.map[dataName].value + modulo._map[dataName].value) % modulo.modu == 0) {
                //                console.info(modulo.map[dataName]);
                //                console.info(modulo._map[dataName]);
                $this.addClass('cell1fff');
            } else {
                //                console.info(modulo.map[dataName]);
                //                console.info(modulo._map[dataName]);
                $this.removeClass('cell1fff');
                $('.cell1[dataName=' + dataName + ']').each(function () {
                    $(this).text(_mapUnit.value);
                    console.info(_mapUnit.value);
                    if (_mapUnit.value == modulo.modu) $(this).addClass('cell1fff');
                    else $(this).removeClass('cell1fff');
                });
            }*/
        });
        //        console.info(modulo.map);
        //        console.info(modulo._map);

        //        判断是否成功
        clearTimeout(modulo.timer);
        modulo.timer = setTimeout(function () {
            isSuccess();
        }, modulo.time);
    }

    function isSuccess() {
        var success = true;
        modulo.answer = '';
        $.each(modulo.data.map, function (index, value) {
            var str = this;
            for (var i = 0; i < str.length; i++) {
                var name = 'x' + i + 'y' + index;
                if (modulo._map[name].value != str.charAt(i)) {
                    success = false;
                }
                if (!success) return false;
            }
            if (!success) return false;
        });
        if (success) {
            console.info('---------成功了！');
            $.each(modulo.pieces, function (index, value) {
                var $this = this;
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