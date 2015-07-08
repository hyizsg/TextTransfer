var http = require('http');//内置的http模块了HTTP服务器和客户端功能
var fs = require('fs');
var url = require("url");            //解析GET请求
var query = require("querystring");    //解析POST请求
var path = require('path');//内置的path模块提供了与文件系统路径相关的功能
var mime = require('./bower_components/mime/mime.js');//附加的mime模块有根据文件扩展名得出MIME类型的能力


var responsecache = [];

/*
* 请求文件不存在时发送404错误
*/
function send404(response) {
	response.writeHead(404, {'Content-Type':'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}
function send200(response) {
	response.writeHead(200, {'Content-Type':'text/plain'});
	response.write('{"msg":"success"}');
	response.end();
}
/*
* 文件数据服务
* 先写出正确的HTTP头，然后发磅文件内容
*/
function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
}

function sendAjax(response, request) {
    var params = {};
	if(request.method == "GET"){
        params = url.parse(request.url,true).query;
    }else{
        var postdata = "";
        request.addListener("data",function(postchunk){
            postdata += postchunk;
        })

        //POST结束输出结果
        request.addListener("end",function(){
            params = query.parse(postdata);
        })
    }

	response.writeHead(200, {'Content-Type':'text/plain'});
    response.write(JSON.stringify(params));
    response.end();
}

/*
* 文件数据服务
*/
function serveStatic(response, absPath) {
	fs.exists(absPath, function(exists){
		if (exists) {
			fs.readFile(absPath, function(err, data) {
				if (err) {
					send404(response);
				} else {
					sendFile(response, absPath, data);
				}
			});
		} else {
			send404(response);
		}
	});
}
/*
* 创建HTTP服务的模块
*/

var server = http.createServer(function(request, response) {
	var filePath = false;
	console.log(request.url);
	if (request.url == '/') {
		filePath = '/index.html';
	}else if(request.url.indexOf('/connect.socket') >= 0) {
		responsecache.push(response);
		return;
	}else if(request.url.indexOf('/ajax') >= 0) {
		for (var i in responsecache) {
			sendAjax(responsecache[i], request);
		};
		delete responsecache;
		responsecache = [];
		send200(response);
		return;
	}else {	
		filePath = request.url;
	}

	var absPath = './' + filePath;
	serveStatic(response, absPath);
});

server.listen(8080, function() {
	console.log("Server listening on port 8080.");
});