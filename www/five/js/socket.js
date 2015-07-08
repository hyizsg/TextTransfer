
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

    send: function(msg) {
        var _self = this;
        miniserver.handle(msg);
        $.ajax({
            url: 'ajax',
            type: 'get',
            data: msg,
            dataType: 'json',
            success: function(re) {
                // console.log(re);
            },
            error: function(er) {
                // console.log(er);
            },
        });
    },


    startlisten: function() {
        var _self = this;
        $.ajax({
            url: 'connect.socket',
            type: 'post',
            data: '',
            dataType: 'json',
            success: function(re) {
                _self.response(re);
                _self.startlisten();
            },
            error: function() {
                _self.startlisten();
            },
        });
    },

    response: function(msg) {
        var _self = this;
        for (var i in _self.linsenlist) {
            var target = _self.linsenlist[i].target;
            var callback = _self.linsenlist[i].callback;
            target[callback](msg);
        };
    },

    init: function() {
        var _self = this;

    },
};

var game = {

    user:{
        uid: -1,
        token: '',
        nickname: '游客',
    },

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
        var turn = parseInt(pos.turn);
        var posX = parseInt(pos.X);
        var posY = parseInt(pos.Y);
        var i = 0, count1 = 0, count2 = 0;
        for (i = 0; i < 5 && posX + i * dx < 15 && posX + i * dx >= 0 && posY + i * dy < 15; i++) {
           if (game.boardData[posX + i * dx][posY + i * dy] == turn) {
                count1++;
           } else {
                break;
           }
        }
        for (i = 1; i < 5 && posX - i * dx >= 0 && posX - i * dx < 15 && posY - i * dy >=0; i++) {
           if (game.boardData[posX - i * dx][posY - i * dy] == turn) {
                count2++;
           } else {
                break;
           }
        }

        console.log('turn:' + turn + ' count: '+ count1 + ", " + count2);
        if (count1 + count2 >= 5) {
            return turn;
        }
        return -1;
    },

    checkBoard: function(pos) {
        var _self = this;
        var winner = -1;
        if (winner == -1) winner = _self.validate(pos, 1, 0); //   --
        if (winner == -1) winner = _self.validate(pos, 1, 1); //   /
        if (winner == -1) winner = _self.validate(pos, 0, 1); //   |
        if (winner == -1) winner = _self.validate(pos, -1, 1); //  \
        return winner;
    },

    handle: function(msg) {
        _self = this;
        switch(parseInt(msg.action)) {
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
        switch(parseInt(msg.action)) {
            case 301: 
                {
                    game.user = JSON.parse(msg.user);
                    console.log(game.user);
                }
                break;
            case 2001:
                {
                    game.boardData[msg.X][msg.Y] = parseInt(msg.turn);
                    game.turn = parseInt(msg.turn) == 0 ? 1 : 0;
                    game.winner = parseInt(msg.winner);
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
            game.user.uid = cookie.getCookie('uid');
            game.user.nickname = cookie.getCookie('nickname');
        }

        socket.send({
            'action': 301,
            'user': JSON.stringify(game.user),
        });
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
            if(arr[0] == name) return arr[1]; 
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
