/*
 * 棋盘对象
 */
var chessCanvas = {
    canvas: '#canvas',  //画布
    tempPiece: '',         //新绘制的棋子
    /*
     * 创建棋子
    */
    createPiece: function(color) {
        var _self = this;
        _self.tempPiece = $('<div class="piece '+color+'"></div>');
    },
    /*
     * 落子
    */
    drawPiece: function(piece) {
        var _self = this;

        //计算落子坐标
        var offsetX = piece.X * app.cellWidth + app.lefOffset - (app.pieceWidth / 2);
        var offsetY = piece.Y * app.cellHeight + app.topOffset - (app.pieceHeight / 2);
        var color = piece.turn == 0 ? 'black' : 'white';
        _self.createPiece(color);
        _self.tempPiece.css('left', offsetX + 'px').css('top', offsetY+'px');
        _self.canvas.append(_self.tempPiece);
    },
    init: function() {
        var _self = this;
        _self.canvas = $(_self.canvas);
    }
};
/*
 * 
 */
var app = {
    chessboard: '#chessboard',
    cellWidth: 21,
    cellHeight: 22,
    pieceWidth: 21,
    pieceHeight: 22,
    topOffset: 7,
    lefOffset: 7,
    width: 309,
    height:327,
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

    onReceive: function(msg) {
        var _self = this;
        switch(msg.action) {
            case 301:
            case 302:
                {
                    for (var i in game.playerlist) {
                        $('#userName' + i).val(game.playerlist[i].nickname + game.playerlist[i].token);
                    };
                }
                break;
            case 2001: 
                {
                    chessCanvas.drawPiece(msg);

                    _self.boardData[msg.X][msg.Y] = _self.turn;
                    _self.turn = msg.turn == 0 ? 1 : 0;
                    _self.winner = msg.winner;

                    if ( _self.winner[0] != -1) {
                        setTimeout(function(){
                            alert('winner: ' + _self.winner);
                        }, 200)
                    };
                }
                break;
            default:
                break;
        }
    },

    bindClick: function() {
        var _self = this;
        chessCanvas.canvas.bind('click', function(e) {
            var X = Math.round((e.offsetX - _self.lefOffset) / _self.cellWidth);
            var Y = Math.round((e.offsetY - _self.topOffset) / _self.cellHeight);
            if (_self.boardData[X][Y] == -1) {
                var piece = {"action": 2001, "turn":_self.turn, "X": X, "Y": Y};
                socket.send(piece);
            };
        });
    },

    init: function() {
        var _self = this;
        _self.bindClick();
        socket.addlisten(_self, 'onReceive');
    }
};