
var socket = {
    linsenlist: [],
    addlisten: function(target, callback) {
        var _self = this;
        var arr = _self.linsenlist;
        var hasadd = false;
        for (var i in arr) {
            if (target == arr[i].target && callback == arr[i].callback) {
                hasadd = true;
                break;
            };
        };

        if (!hasadd) {
            _self.linsenlist.push({'target': target, 'callback': callback});
            if ( _self.linsenlist.length == 1) {
                _self.startlisten();
            };
        }
    },

    removelisten: function(target, callback) {
        var _self = this;
        var arr = _self.linsenlist;
        for (var i = arr.length - 1; i >= 0; i--) {
            if (target == arr[i].target && (callback == null || callback == arr[i].callback)) {
                arr.remove(i);
                if (callback != null) {
                    break;
                };
            };
        };
    },

    startlisten: function() {
        var _self = this;
        $.ajax({
            url: 'connect.socket',
            type: 'post',
            data: '',
            async: true, 
            dataType: 'json',
            success: function(re) {
                _self.startlisten();
                setTimeout(function(){
                    _self.response(re);
                }, 100);
            },
            error: function() {
                _self.startlisten();
            },
        });
    },

    send: function(msg) {
        var _self = this;
        miniserver.handle(msg);
        console.log("socket send: ");
        console.log(msg);
        msg = _self.encode(msg);
        $.ajax({
            url: 'ajax',
            type: 'get',
            data: msg,
            async: true, 
            dataType: 'json',
            success: function(re) {
                // console.log(re);
            },
            error: function(er) {
                // console.log(er);
            },
        });
    },


    response: function(msg) {
        var _self = this;
        msg = _self.decode(msg);
        console.log("socket reveive: ");
        console.log(msg);
        for (var i in _self.linsenlist) {
            var target = _self.linsenlist[i].target;
            var callback = _self.linsenlist[i].callback;
            target[callback](msg);
        };
    },

    encode: function(msg) {
        msg = {'data': JSON.stringify(msg)};
        return msg;
    },

    decode: function(msg) {
        msg = JSON.parse(msg.data);
        return msg;
    },

    init: function() {
        var _self = this;

    },
};

var game = {

    user:{
        uid: 1001,
        token: '',
        nickname: '游客',
    },

    players: {

    },

    playerlist:[

    ],

    turn: 0,
    winner: -1,
    boardData: [
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],

            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],

            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1, -1,-1,-1,-1,-1, -1,-1,-1,-1,-1],
        ],
};

var miniserver = {
    
    validate: function(pos, dx, dy) {
        var _self = this;
        var turn = pos.turn;
        var posX = pos.X;
        var posY = pos.Y;
        var i = 0, count1 = 0, count2 = 0;
        var array = [];
        for (i = 0; i < 5 && posX + i * dx < 15 && posX + i * dx >= 0 && posY + i * dy < 15; i++) {
           if (game.boardData[posX + i * dx][posY + i * dy] == turn) {
                array.push([posX + i * dx, posY + i * dy]);
                count1++;
           } else {
                break;
           }
        }
        for (i = 1; i < 5 && posX - i * dx >= 0 && posX - i * dx < 15 && posY - i * dy >= 0; i++) {
           if (game.boardData[posX - i * dx][posY - i * dy] == turn) {
                array.push([posX - i * dx, posY - i * dy]);
                count2++;
           } else {
                break;
           }
        }

        console.log('turn:' + turn + ' count: '+ count1 + "+" + count2);
        if (count1 + count2 >= 5) {
            return [turn, array];
        }
        return [-1, array];
    },

    checkBoard: function(pos) {
        var _self = this;
        var winner = [-1, []];
        if (winner[0] == -1) winner = _self.validate(pos, 1, 0); //   --
        if (winner[0] == -1) winner = _self.validate(pos, 1, 1); //   /
        if (winner[0] == -1) winner = _self.validate(pos, 0, 1); //   |
        if (winner[0] == -1) winner = _self.validate(pos, -1, 1); //  \
        return winner;
    },

    handle: function(msg) {
        _self = this;
        switch(msg.action) {
            case 2001:
                {
                    game.boardData[msg.X][msg.Y] = msg.turn;
                    game.winner =  _self.checkBoard(msg);
                    msg['winner'] = game.winner;
                }
                break;
            default:
                break;
        }

        return true;
    },

    init: function() {
        var _self = this;
    }
};

var miniclient = {

    onReceive: function(msg) {
        _self = this;
        switch(msg.action) {
            case 301: 
                {
                    // 是自己，修改信息
                    if (msg.user.token == game.user.token) {
                        game.user = msg.user;
                    }

                    // 存储自己或别人的信息
                    if (!(msg.user.token in game.players)) {
                        game.players[msg.user.token] = msg.user;
                        game.playerlist.push(msg.user);
                    };
                    
                    // 不是自己的时候，302广播自己的信息
                    if (msg.user.token != game.user.token) {
                        socket.send({
                            'action': 302,
                            'user': game.user,
                        }); 
                    }
                }
                break;
            case 302:
                {
                    // 存储别人的信息
                    if (!(msg.user.token in game.players)) {
                        game.players[msg.user.token] = msg.user;
                        game.playerlist.push(msg.user);
                    };
                }
                break;
            case 2001:
                {
                    game.boardData[msg.X][msg.Y] = msg.turn;
                    game.turn = msg.turn == 0 ? 1 : 0;
                    game.winner = msg.winner;
                }
                break;
            default:
                break;
        }
    },

    init: function() {
        _self = this;
        socket.addlisten(_self, 'onReceive');
        
        game.user.token = cookie.getCookie('token');
        if (game.user.token == '') {
            game.user.token = uuid.create(16, 16); // 16位16进制字符
            cookie.addCookie('token', game.user.token, 72);
            cookie.addCookie('uid', game.user.uid, 72);
            cookie.addCookie('nickname', game.user.nickname, 72);
        }
        else {
            game.user.uid = parseInt(cookie.getCookie('uid'));
            game.user.nickname = cookie.getCookie('nickname');
            console.log("get nickname: " + game.user.nickname);
        }

        socket.send({
            'action': 301,
            'user': game.user,
        });

        // window.onbeforeunload = function() {
        //     socket.send({
        //         'action': 303,
        //         'user': game.user,
        //     });
        // };
    }
};

var cookie = {
    addCookie: function (name,value,expiresHours){ 
        var cookieString = name + "=" + escape(value); 
        //判断是否设置过期时间 
        if(expiresHours > 0){  
            var date = new Date(); 
            date.setTime(date.getTime+expiresHours*3600*1000); 
            cookieString = cookieString + "; expires=" + date.toGMTString(); 
        } 
        document.cookie = cookieString; 
    },
    getCookie : function (name){ 
        var strCookie = document.cookie; 
        var arrCookie = strCookie.split("; "); 
        for(var i = 0; i < arrCookie.length; i++){ 
            var arr = arrCookie[i].split("="); 
            if(arr[0] == name) return unescape(arr[1]); 
        } 
        return ""; 
    },
    deleteCookie: function deleteCookie(name){ 
        var date = new Date(); 
        date.setTime(date.getTime()-10000); 
        document.cookie = name + "=v; expires=" + date.toGMTString(); 
    }      
};

var uuid = {
    create: function(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        radix = radix || chars.length;

        if (len) {
          // Compact form
          for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
        } else {
          // rfc4122, version 4 form
          var r;

          // rfc4122 requires these characters
          uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
          uuid[14] = '4';

          // Fill in random data.  At i==19 set the high bits of clock sequence as
          // per rfc4122, sec. 4.1.5
          for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
              r = 0 | Math.random()*16;
              uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
          }
        }

        return uuid.join('');
    },
};

var clone = function(obj){
    var o;
    switch(typeof obj){
    case 'undefined': break;
    case 'string'   : o = obj + '';break;
    case 'number'   : o = obj - 0;break;
    case 'boolean'  : o = obj;break;
    case 'object'   :
        if(obj === null){
            o = null;
        }else{
            if(obj instanceof Array){
                o = [];
                for(var i = 0, len = obj.length; i < len; i++){
                    o.push(clone(obj[i]));
                }
            }else{
                o = {};
                for(var k in obj){
                    o[k] = clone(obj[k]);
                }
            }
        }
        break;
    default:        
        o = obj;break;
    }
    return o;   
}
