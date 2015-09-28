// 端口号后期需要修改成配置文件的形式
var io = require('socket.io'),
    ioServer = io.listen(3000),
    clients = {},
    unreg_clients = [];


/*
 * 打印函数设置
 * 如果debug 有定义，则输出log,
 * 否则无log 输出
 *
 */

var debug = 1;
function log(msg){

    if (!debug) return;

    var date = new Date(); 
    console.info(date+" --> "+msg);

}

log('SocketIO 开始监听3000端口');

/*
 * Desc:
 * 这个逻辑块主要处理来自 APP 端的消息事件
 * 例如： 注册，消息成功接收等；
 *
 * nodejs 和 APP 直接的数据统一使用Json 格式;
 *
 */

ioServer.sockets.on('connection', function(socket) {
    log('有新的socket链接:(' + socket.id + ').');

    // 新的 socket 登入，检测是否是已经注册的，否则通知注册；
    if (!socket.uid) {

        log("用户未注册");
        // 将 socket 实例加入到未注册列表中;
        unreg_clients.push(socket);
        // 消息推送到客户端提醒注册；
        socket.emit('reg','{"msg":"unreg"}');

    }

    // APP 端用户socket 和 client ID 绑定流程；
    // 消息格式：{"app":"msd","id":"123"}
    socket.on('reg', function(message) {
        log("收到用户注册请求"+message);
        
        if(socket.uid) { 

            var app = socket.app;

            log("["+socket.app+"]用户("+socket.uid+")已经注册") 
            socket.emit('reg', '{"msg":"connected"}');

            return;

        }

        try {

            var client_message = JSON.parse(message);
            var user_id        = client_message.id,
                app            = client_message.app,
                role_type      = client_message.role;

            if (!user_id || !app) {

                log("JSON 格式不完整 2");
                return ;

            }

            socket.uid = user_id;
            socket.app = app;

            // 将用户ID 增加到在线列表中
            if (!clients[app]) clients[app]={};
            clients[app][user_id]=socket;

            // 从未注册列表中删除已注册的socket 实例
            var index = unreg_clients.indexOf(socket);
            if (index != -1) {

                unreg_clients.splice(index, 1);
                log("["+app+"]的用户(id="+socket.uid+")注册成功");

            }

            // 消息推送客户端注册成功；
            socket.emit('reg', '{"msg":"connected"}');

        } catch (error) {

            log(error);
            log("APP注册请求的JSON格式不正确");
            return;

        }

    });

    // APP 消息已送到  事件处理逻辑
    // 消息队列中移除已发送的消息
    // 缓存中标记 该消息已经送达客户端
    socket.on('rev', function(message){
        log(message)

        try {

            var client_message = JSON.parse(message);
            var mid      = client_message.mid,
                app      = client_message.app;

            if (!mid || !app) {

                log("JSON 格式不完整 3");
                return ;

            }


        } catch (error) {

            log(error);
            log("消息确认请求的JSON格式不正确");
            return;

        }

    });


    // 收到APP掉线事件，将 socket 实例列表删除已下线的socket.
    socket.on('disconnect', function() {
        try {
            // socket 未注册，直接退出逻辑
            if (!socket.uid || !socket.app) return;
            // 获取列表中socket
            var socket_in_list = clients[socket.app][socket.uid]

            // 如果 socket id 不相等，则是新的 socket 进来
            if (socket_in_list.id  && socket_in_list.id != socket.id) return;

            if (socket.uid) {

                delete clients[socket.app][socket.uid];
                log("["+socket.app+"]的用户(id="+socket.uid+")已经离线");

            }

        } catch (error) {

            log(error);
            return

        }
    });

});

/*
 * Desc:
 * 定时器：定时要处理的业务逻辑
 * 定时的时间间隔将作为配置项处理
 */

setInterval(function() { 
    // 通知未注册用户注册
    for(x in unreg_clients) unreg_clients[x].emit("reg",'{"msg":"unreg"}');
}, 2000);

