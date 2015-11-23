var socket     = '';
var manager    = '';

function log (msg) {
    console.log(msg);
}

socket_config = {
    'server'    : 'http://127.0.0.1:3000',
    'paltform'  : 'web',
}

var reg_info = {
    'user_id'   : 1,
    'app'  : 'impress',
    'key' : 123123,
    'role' : 'controller',
};

function ctl_cmd(cmd) {}

// socket 初始化
function init_socket() {
    manager = io.Manager(socket_config.server, {
            reconnection         : true,
            timeout              : 1000, 
            reconnectionAttempts : 5000, 
            reconnectionDelay    : 10, 
            //reconnectionDelayMax : 1,
        }
    );
    socket = manager.socket('/');

    // 响应注册流程
    socket.on('reg', function(data) {
        try {
            var msg = JSON.parse(data);
            log(data)
            switch (msg.msg) {
            case 'unreg'     : unreg(); break;
            case 'connected' : log('connected'); break;
            default : log(data); break;
            }

        } catch (error) {
            log(error+"APP注册请求的JSON格式不正确");
            return
        }

    });

    // 响应断线逻辑 && 重连逻辑
    socket.on('disconnect',        function() { log('服务器断开连接');});
    socket.on('connect_error',     function() { log(' 连接错误!');});
    socket.on('reconnect_attempt', function() { log(' 开始重连');});
    socket.on('reconnect_failed',  function() {
        socket.close();
        manager.close();
        log(' 重连失败');
    });
    socket.on('control', function(data) { ctl_cmd(data);});
}

function unreg() {
    socket.emit('reg', JSON.stringify(reg_info));
}


function send_cmd(cmd) {
    socket.emit('control', JSON.stringify(cmd));
}

function control_prev() {
    var cmd = {
        'cmd' : 'prev',
        'data' : '1',
    }
    send_cmd(cmd);
}

function control_next() {
    var cmd = {
        'cmd' : 'next',
        'data' : '1',
    }
    send_cmd(cmd);
}

function control_goto(page) {
    var cmd = {
        'cmd' : 'next',
        'data' : page,
    }
    send_cmd(cmd);
}
