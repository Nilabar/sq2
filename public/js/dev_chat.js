/*
 *  © Shevcov Ilya, 2017-2018
 */
const CHAT = {
	VERSION: "0.2f.27.06.18",
        DEV:false,
        PATCH:"0"
};

//$("window").on('click',function(evt){console.log(evt)});

var auth = false;
var currentChannel;
var isReconnect = false;
var aboutQueue =[];
var emojy_standart,emojy_celebrate,emojy_pirates,emojy_planets,emojy_old,emojy_any;
var last_message = {
    date:0
};

$(window).on("load", () => {
    preloadChat();
    
    //
    $("#message-send-btn").on("click", () => {
		inputContorolAndCreate(); // отправить сообщение
    });
    $("#message-input-area").keydown(function (e) {
	if (e.keyCode === 13) {
		inputContorolAndCreate(); //тоже самое ->press Enter в поле ввода
	}
    });
    //
    $('.block-close-btn').on("click", (evt) => {
	hideBlock(evt.target);	
    });
    //
    $('button.chat-ui').on("click", (evt) => {
	var ui_b = $(evt.target).closest("button");
        uiControl(ui_b);
    });
    //
    $('#chl-tabs-close').on("click",()=>{
        channelsTabsToggle();
    });
    
    
    
    startChat();
});

var hideBlock =(btn)=>{
    var block = $(btn).closest("div.hc-block");
        block.addClass("d-none");
    var col = 0;
    
    if(block.hasClass("col-md-2")){
        col = 2;
        $("#ui-b-user").removeClass("d-none");
        sendMsg("/config show_online 0");
    }else{
        col = 3;
        $("#ui-b-info").removeClass("d-none");
        sendMsg("/config show_info 0");
    }
        
    if($("div#chat-block").hasClass("col-md-7")){
        $("div#chat-block").removeClass("col-md-7");
        $("div#chat-block").addClass("col-md-"+(7+col).toString());
    }else{
        $("div#chat-block").removeClass("col-md-9 col-md-10").addClass("col-md-12");
    }
    console.log(block.attr("id"));
};

var showBlock =(block)=>{
    var col = 0;
    if(block.hasClass("col-md-2")){
        col = 2;
        $("#ui-b-user").addClass("d-none");
        sendMsg("/config show_online 1");
    }else{
        col = 3;
        $("#ui-b-info").addClass("d-none");
        sendMsg("/config show_info 1");
    }
        
    if($("div#chat-block").hasClass("col-md-12")){
        $("div#chat-block").removeClass("col-md-12");
        $("div#chat-block").addClass("col-md-"+(12-col).toString());
    }else if($("div#chat-block").hasClass("col-md-9")){
        $("div#chat-block").removeClass("col-md-9");
        $("div#chat-block").addClass("col-md-"+(9-col).toString());
    }else if($("div#chat-block").hasClass("col-md-10")){
        $("div#chat-block").removeClass("col-md-10");
        $("div#chat-block").addClass("col-md-"+(10-col).toString());
    }
    block.removeClass("d-none");
};

var channelsTabsToggle =()=>{
    $("#ui-b-tabs").toggleClass("d-none");
    if($("#chl-tabs-area").toggleClass("d-none").hasClass("d-none")){
        //off tabs
        console.log(11);
    }else{
        //on tabs
        console.log(00);
    }
};

var sendMsg = (text, channel) => {
	let s_channel; 
	if (channel !== undefined) s_channel = channel;
        else s_channel = currentChannel.data("name");
	socket.send(JSON.stringify({
		meta: {
			key: me
		},
		text: text,
		channel: s_channel
	}));
        if(CHAT['DEV'])
	console.log("SENDMSG-->" + s_channel + " , " + channel + " text " + text);
};

var addMessageToChat =(msg)=>{
    if(Date.parse(msg.date) >= Date.parse(last_message.date) || ((msg.from =="terminal::") || (!!msg.isHistory)&&!isReconnect)){
    
    
    let msg_type = " text-info ";
    let msg_type_from = "";
    let is_info = false;
    var re = new RegExp(toHex(myNick), 'i');
    if (toHex(msg.text).match(re)) {
	msg_type = " text-warning ";
	msg_type_from = msg_type;
    }else if (msg.from == myNick) {
	msg_type = " text-success ";
	msg_type_from = msg_type;
    }
    if (msg.from.toLowerCase() === "system") {
	msg_type = " text-danger ";
    }
    if (msg.from.toLowerCase() === " ") {
	msg_type = " text-info ";
    }
    
    if (msg.from.split('::')[0] === "terminal") {
	msg_type = " text-terminal-success ";
        msg_type_from = " text-terminal-success ";
    }
    
    if (msg.from.toLowerCase() === "info") {
	is_info = true;
    }
    
    let date = '';
    
    if(msg.date !== undefined){
        if(auth && !isReconnect && !msg.isHistory){
           last_message = msg;
        }
        date = msg.date.split(',')[1];
    }
    
    
    
    
    
    let chat_item = $("<div>", {
	"class": "chat-message text-left"
        }).append($("<span>", {
            "class": "msg-time text-muted",
	    "text": date + " "
	})).append($("<span>", {
	    "class": msg_type_from + " msg-from",
	    "text": msg.from+":",
	    click: function () {
	        insertText(msg.from);
	    }
    })).append("&nbsp;");
        
    var str = msg.text;
    var find_codes = [];
    var last_index = 0;
    var msg_count = str.length; //остаток символов в сообшении после вставки смаила
    for (var i = 0; i < emojys.length; i++) {
        str.replace(emojys[i]['regExp'], function (str, offset, s) {
            if(str !== 'undefined'){    
                find_codes.push({offset:offset,emojy:emojys[i]});
            }
        });
    }
    find_codes.sort(function(a,b){
        if(a['offset'] < b['offset']) return -1;
        if(a['offset'] > b['offset']) return 1;
    });
         
    for(var i=0;i<find_codes.length;i++){
        var code = ':'+find_codes[i]['emojy']['filename'].split('.')[0]+':';
        var prev_text = str.substring(last_index,find_codes[i]['offset']);
        var em = $("<span>", {
            "class": msg_type,
	    "text": prev_text
	}).append($("<img>", {
	    "src": "http://nilabar.h1n.ru/sq2/img/emojy/"+find_codes[i]['emojy']['dir'] + find_codes[i]['emojy']['filename'],
            "class":"gif-smile-em"
	}));
	em.appendTo(chat_item);
        msg_count -= prev_text.length + str.length;
        last_index = find_codes[i]['offset']+code.length;
    }
    // если остаток символов больше нуля..
    if (msg_count !== 0) {
	var end_msg = $("<span>", {
            "class": msg_type,
	    "text": str.substr(last_index)
	});
	end_msg.appendTo(chat_item);
    }
    
// завершение формирования сообщения
    $("#" + toHex(msg.channel)+"-item-chl").append(chat_item);
    }
    
    
};

var addUserOnline =(name)=>{
    var prep_name = name;
    if(name.length >10){
        prep_name = name.substr(0,10)+"..";
    }
    
    var body_user = $("<div>",{
        "class":"user-online-item btn-group  d-inline-flex justify-content-end text-muted",
        "id":toHex(name)+"-usr-online"
    }).append($("<span>",{
        "class":"mr-auto online-privat-el",
        "text" :prep_name,
        click:()=>{
           sendMsg("/private "+ name); 
        }
    }))    
      .append($("<a>",{
        "class":"btn"
    }).append($("<i>",{"class":"fa fa-address-card"})))
      .append($("<a>",{
        "class":"btn",
        click:()=>{
            sendMsg("/invite "+name,currentChannel.data("name"));
        }
    }).append($("<i>",{"class":"fa fa-plus-square"})));
    
    body_user.data("name",name);
    
    $('#online-block div.card-body div.scrollbar').append(body_user);
    //сортировка по алфавиту
	sortAlphaID(body_user, ".user-online-item", $("#online-pointer"), function (index) {
		if (index === 0) {
			$("#online-pointer").prepend(body_user);
			return;
		}
		$("#online-pointer > div:nth-child(" + (index) + ")").after(body_user);
	});
    $("#online-user").empty().text($("#"+toHex("#global")+"-item-chl").data("members").length);
    onlinePlusHilightControl();
};
var sortAlphaID = (element, selector, parent, callback) => {
	var arr = [];
	var o_arr = parent.find(selector);
	arr.push(element.data("name"));
	for (var i = 0; i < o_arr.length; i++) {
		arr.push($(o_arr[i]).data("name"));
	}
	arr.sort();
	var index = arr.indexOf(element.data("name"));
	callback(index);
};

var removeUserOnline =(name)=>{
    $("#"+toHex(name)+"-usr-online").remove();
    $("#online-user").empty().text($("#"+toHex("#global")+"-item-chl").data("members").length);
};

var addChannel =(msg)=>{
    var body_chl = $('<div>',{
        "class":"scrollbar chat-history d-none",
        "id":toHex(msg.channel)+"-item-chl"
    });
    
    body_chl.data("channel_type",msg.data.channel_type);
    body_chl.data("members",msg.data.members);
    body_chl.data("name",msg.channel); 
        
    $('#chat-block div.card-body').append(body_chl);
    
    
    if(msg.channel == "#global"){
        for(var i=0;i<msg['data']['members'].length;i++){
            addUserOnline(msg['data']['members'][i]);
        }
    }else{
        addChanelsListItem(body_chl);
        aboutQueue.push(body_chl);
        setTimeout(function(){
            sendMsg("/about",body_chl.data("name"));
        },1500);
        
    }
    calcSizeChatBlock(30,58);
};

var removeChannel =(msg)=>{
    selectChannels("#global",$("#ui-b-globe"));
    var remchl = $("#"+toHex(msg.data)+"-item-chl");
    if(remchl.data("list-item").data("tab-el") !== undefined){
       remchl.data("list-item").data("tab-el").remove();
    }
    remchl.data("list-item").remove();
    //сообщение в события
    remchl.remove();        
};





var uiControl =(btn)=>{
    switch($(btn).attr("id")){
        case "ui-b-info":
            showBlock($("#info-block"));
        break;
        case "ui-b-user":
            showBlock($("#online-block"));
        break;
        case "ui-b-tabs":
            channelsTabsToggle();
        break;
        case "ui-b-globe":
            selectChannels("#global",$("#ui-b-globe"));
        break;
        case "ui-b-list":
            selectInfo($("#channels-list"),$("#ui-b-list"));
            $("#channels-list-search").removeClass("d-none");
        break;
        case "ui-b-settings":
            selectInfo($("#settings-list"),$("#ui-b-settings"));
        break;
    }
};

var selectInfo =(selector,btn)=>{
    $(".info-item").addClass("d-none");
    selector.removeClass("d-none");
    $(".chat-ui-info").removeClass("action");
    btn.addClass("action");
};

var selectChannels =(chl_name,btn)=>{
    $(".chl-tabs-item ,#ui-b-globe ,.chl-list-item").removeClass("action");
    btn.addClass("action");
    currentChannel.addClass("d-none");
    currentChannel = $("#"+toHex(chl_name)+"-item-chl");
    currentChannel.removeClass("d-none");
    
    if(btn.hasClass("chl-list-item")){
        $("#"+toHex(chl_name)+"-chl-tabs-el").addClass("action");
    }
    if(btn.hasClass("chl-tabs-item")){
        $("#"+toHex(chl_name)+"-chl-list-el").addClass("action");
    }
    onlinePlusHilightControl();
};

var onlinePlusHilightControl=()=>{
    if(auth){
    if(((currentChannel.data("name") == "#global")||(currentChannel.data("channel_type") == "private"))||currentChannel.data("owner")!= myNick){
        $("i.fa-plus-square").hide();
    }else{
        $("i.fa-plus-square").show();
    }
    }
};
/*
 *
 *
 */
function startChat() {
	var address = "wss://starquake2.ru/chat/";
	console.log("start chat-->" + address + "_U: " + me);
	socket = new WebSocket(address + "?key=" + me);
	socket.onopen = function () {
                console.log("chat--> Соединение установлено.");
		
	};
	socket.onclose = function (event) {
		//if (event.wasClean) {
			// Соединение закрыто чисто
			console.log("Соединение закрыто чисто.");
                //} else {
                        //
                        if(!isReconnect){
			    console.log('chat--> Обрыв соединения...');
                            $("#ui-b-globe").click();
                        }
                        addMessageToChat({
				text: "Обрыв соединения...",
				from: "terminal::",
				channel: "#global"
			});
			setTimeout('reconnect()', 5000);
		//}
	};
        
        socket.onmessage = function (event) {
		var msg = JSON.parse(event.data);
                if(CHAT['DEV'])console.log("ONMESSAGE:",msg);
		switch (msg.type) {
			// события
		case "JOINED_TO_CHANNEL":
                    if(isReconnect){
                        if(msg.channel ==="#global"){
                            $(".user-online-item").remove();
                            loadOnlineUsers(msg);
                        }else{
                            $("#"+toHex(msg.channel)+"-item-chl").data("users", msg.data['members']);
                        }
                    }
                    else addChannel(msg);                        
                break;
                
		case "LEFT_CHANNEL":
		    removeChannel(msg);	
		break;
                
		case "USER_JOINED":
	            $("#"+toHex(msg.channel)+"-item-chl").data("members").push(msg.data);
                   
                    if(msg.channel === "#global"){
                        addUserOnline(msg.data);
                    }
                    else{
                        $("#"+toHex(msg.channel)+"-item-chl").data("list-item")
                           .find(".badge").empty().text($("#"+toHex(msg.channel)+"-item-chl").data("members").length);  
                    };
                break;
                
		case "USER_LEFT":
		    var uindex = find($("#"+toHex(msg.channel)+"-item-chl").data("members"),msg.data);
                    $("#"+toHex(msg.channel)+"-item-chl").data("members").splice(uindex,1);
                   
                    if(msg.channel === "#global"){
                        removeUserOnline(msg.data);
                    }else{
                        $("#"+toHex(msg.channel)+"-item-chl").data("list-item")
                            .find(".badge").empty().text($("#"+toHex(msg.channel)+"-item-chl").data("members").length);  
                    }
                break;
		
                                
		case "AUTH":
                    if(isReconnect){
                        isReconnect = false;
                        addMessageToChat({
			text: '..соединение востановленно!',
			from: "terminal::",
			date: msg.date,
			channel: "#global"
		        });
                    }else{
			myNick = msg.data.userName;
                        currentChannel = $("#"+toHex("#global")+"-item-chl");
                        var col = 7;
			if (msg.data.settings.show_online) {
			   $('#online-block').removeClass('d-none');
                           
			}else {
                           col +=2;
                           $('#ui-b-user').removeClass('d-none');
                        }
			if (msg.data.settings.show_info) {
			   $('#info-block').removeClass('d-none');
                           
			}else{
                           col +=3;
                           $('#ui-b-info').removeClass('d-none');
                        }
                        $('#chat-block').removeClass('col-md-7');
                        $('#chat-block').addClass('col-md-'+col);
                        $('div.donut-spinner').remove();
                        $('#chat-block').removeClass('d-none');
                        auth = true;
                        
                        initChat();
                        addMessageToChat({
			text: '..успешное подключение в чат "Starquake 2".',
			from: "terminal::",
			date: msg.date,
			channel: "#global"
		        });
                    }
                        console.log("-->AUTH SUCCESS<--");
		break;
		
                	//сообщения
		case "MESSAGE":
		case "ERROR":
		    addMessageToChat(msg);
                    if(currentChannel.data("name") != msg.channel){
                        console.log("-!->",$("#" + toHex(msg.channel)+"-chl-list-el").find("i.fa-envelope-o"));
                        $("#" + toHex(msg.channel)+"-chl-list-el").find("i.fa-envelope-o").addClass("action"); 
                    }
		break;
                
                case "CHANNEL_INVITATION":
				
                break;
		
                case "ABOUT_CHANNEL":
		    aboutChannel(msg);
		break;
		
		case "BAN_LIST":
                
                break;
                case "CHANNEL_LIST":
		case "HELP":
		case "IGNORE_LIST":
                
                break;
		case "MY_OWN_CHANNELS":
                
		break;
		case "CHANNEL_HISTORY":
		    loadChannelHistory(msg);
		break;
		}
	};
	socket.onerror = function (error) {
		console.log("Ошибка " + error.message);
	};
}
var reconnect = () => {
	console.log("reconnect-->");
        $("#chatarea").prop('disabled',true);
	socket = null;
        isReconnect = true;
        startChat();
};
var socket;

var loadOnlineUsers =(msg)=>{
    $("#"+toHex("#global")+"-item-chl").data("members",msg.data['members']);
    for(var i=0;i<msg.data['members'].length;i++){
        addUserOnline(msg.data['members'][i]);
    }
    $("#online-user").empty().text($("#"+toHex("#global")+"-item-chl").data("members").length);
};

var aboutChannel =(msg)=>{
    if(aboutQueue.length === 0){
        var about_modal = createModalDialog();
        var type = "text-light";
        var owner = "text-warning";
        var owner_comment ="";
        var isMyChannel = false;
        var ui_about = $("<div>",{
                "class":"input-group input-group-sm"
        });
        
                
        about_modal.body.append(ui_about);
        
        if(msg.data.type !="private"){
           ui_about.append($("<input>",{
               "class":"form-control about-input",
               "type":"text",
               keydown:(evt)=>{
                   if(evt.keyCode === 13){
                       sendMsg("/invite "+$(evt.target).val(),msg.channel);
                       $(evt.target).val("");
                   };
               }
           })).append($("<div>",{
               "class":"input-group-btn"
           }).append($("<button>",{
               "class":"btn btn-dark chat",
               click:(evt)=>{
                    sendMsg("/invite "+ui_about.find("input.form-control").val(),msg.channel);
                    ui_about.find("input.form-control").val("");
               }
           }).append($("<i>",{"class":"fa fa-sign-in"})))); 
        }
        
        if(msg.data.owner == myNick){
            isMyChannel = true;
            owner="text-white";
            owner_comment= "(вы)";
            ui_about.append($("<button>",{
                "class":"btn btn-dark chat",
                click:()=>{
                    
                }
                }).append($("<i>",{"class":"fa fa-ban"}))
            ).append($("<button>",{
                "class":"btn btn-dark chat",
                click:()=>{
                    sendMsg("/destroy "+msg.channel);
                    about_modal.Dialog.modal("hide");
                }
                }).append($("<i>",{"class":"fa fa-trash-o"}))
            );
    }
    else if(msg.data.owner == "Администрация")owner="text-danger";
    
    if(msg.data.type == "open"){
        type="text-muted";
        msg.data.admitted = $("#"+toHex(msg.channel)+"-item-chl").data("members");
    }
    else if(msg.data.type == "closed")type="text-warning";
    
    about_modal.title.append($("<h6>",{
        "class":"text-center"
    })).append($("<span>",{
        "class":"text-light",
        "text":msg.text+" : "
    })).append($("<span>",{
        "class":type+" chat-strong",
        "text":msg.channel
    }));
    
    
    
    about_modal.body.append($("<ul>",{
        "class":""
    })).append($("<li>",{
        "class":"text-greenyellow",
        "text":"создан: "
    }).append($("<span>",{
        "class":"text-info",
        "text": msg.data.created
    })))     
       .append($("<li>",{
        "class":"text-greenyellow",
        "text":"admin: "
    }).append($("<span>",{
        "class":owner,
        "text": msg.data.owner+" "+owner_comment
    }))).append($("<li>",{
        "class":"text-greenyellow",
        "text":"тип: "
    }).append($("<span>",{
        "class":type,
        "text": msg.data.type
    }))).append($("<li>",{
        "class":"text-greenyellow",
        "text":"Участники:"
    }));
    
    var channel_list = $("<div>",{
        "class":"scrollbar about-admitted"
    });
    
    
        
    
    for(var i=0;i<msg.data['admitted'].length;i++){
        var online_type = "text-muted";
        if($("#"+toHex(msg.channel)+"-item-chl").data("members").indexOf(msg.data['admitted'][i]) !== -1 ){
            online_type ="text-light";
        }
        
        var about_usr =($("<div>",{
            "class":"about-admitted-item btn-group  d-inline-flex justify-content-end"
        })).append($("<span>",{
            "class":"mr-auto online-privat-el "+online_type,
            "text":msg.data['admitted'][i],
            click:(evt)=>{
                sendMsg("/private "+$(evt.target).closest("div").data("name"),msg.channel);
            }
        })).append($("<a>",{
            "class":"btn",
            click:()=>{
                
            }
        }).append($("<i>",{"class":"fa fa-address-card"})));
        
        about_usr.data("name",msg.data['admitted'][i]);
        
        var myNick_type = "";
        if (myNick == msg.data['admitted'][i])myNick_type="disabled";
        
        if(isMyChannel && (msg.data['type'] != "open")){
            about_usr.append($("<a>",{
                "class":"btn "+ myNick_type,
                click:(evt)=>{
                    sendMsg("/kick "+$(evt.target).closest("div").data("name"),msg.channel);
                    $(evt.target).closest("div").remove();
                }
            }).append($("<i>",{"class":"fa fa-sign-out"})));  
        }
        if(isMyChannel && (msg.data['type'] != "closed")){
            about_usr.append($("<a>",{
                "class":"btn "+ myNick_type,
                click:(evt)=>{
                    sendMsg("/ban "+$(evt.target).closest("div").data("name"),msg.channel); 
               }
            }).append($("<i>",{"class":"fa fa-ban"})));
        }
        
        channel_list.append(about_usr);
    }
    
    
    channel_list.appendTo(about_modal.body);
    about_modal.Dialog.modal("show");
    }else{
        var a_channel = aboutQueue.shift();
        if(a_channel.data("name") == msg.channel){
            a_channel.data("owner",msg.data['owner']);
            if(msg.data['owner'] == myNick){
                $("#"+toHex(a_channel.data("name"))+"-chl-list-el")
                        .find("span.text-danger")
                        .removeClass("text-danger")
                        .addClass("text-warning");
            }
        }
    }
};


var createModalDialog =()=>{
    var modal_header = $("<div>",{
        "class":"modal-header"
    });
    var modal_title = $("<div>",{
        "class":"modal-title"
    }).appendTo(modal_header);
    
    var modal_body = $("<div>",{
        "class":"modal-body"
    });
    
    var modal_footer= $("<div>",{
        "class":"modal-footer"
    }).append($("<button>",{
        "class":"btn btn-dark chat",
        "data-dismiss":"modal",
        "text":"закрыть"
    }));
    
    var chat_modal = $("<div>",{
       "class":"modal chat"
       
    }).append($("<div>",{
        "class":"modal-dialog"
    }).append($("<div>",{"class":"modal-content text-muted"})
            .append(modal_header)
            .append(modal_body)
            .append(modal_footer)
            ));
    chat_modal.on('hidden.bs.modal', function () {
        chat_modal.remove();
    });
    
    
    chat_modal.appendTo("#gamearea");
    //about_modal.modal("show");
    return {
        Dialog:chat_modal,
        header:modal_header,
        title:modal_title,
        body:modal_body,
        footer:modal_footer
    };
};

function toHex(str) {
	var hex = '';
	for(var i=0;i<str.length;i++) {
		hex += ''+str.charCodeAt(i).toString(16);
	}
	return hex;
}

var inputContorolAndCreate = () => {
    //console.log("inputContorolAndCreate-->");
       
    let msg = {
	channel: currentChannel.data("name"),
	text: $("#message-input-area").val(),
	meta: {
		key: me
	}
    };
    //если не пустая строка
    var str = msg.text.replace(/\s/g, '');
    if ((socket !== null) && (str !== '')) {
        socket.send(JSON.stringify(msg));
        $("#message-input-area").val("");
    }
    
};

var insertText = (text) => {
	//console.log("insertNickname-->");
	let old = $('#message-input-area').val();
	if (old == '') {
		$('#message-input-area').val(text + ' ');
	} else {
		$('#message-input-area').val(old + ' ' + text + ' ');
	}
	$('#message-input-area').focus();
};
//загрузка истории канала
var loadChannelHistory = (msg) => {
    var monts = {
        January:"Января",
        February:"Февраля",
        March: "Марта",
        April:"Апреля",
        May:"Мая",
        June:"Июня",
        Juli:"Июля",
        August:"Августа",
        September:"Сентября",
        October:"Октября",
        November:"Ноября",
        December:"Декабря"
    };
    if (msg.data.length !== 0) {
        var last_day = 0; 
	for (var i = 0; i < msg.data.length; i++) {
            if(!isReconnect){
                var day = Date.parse(msg.data[i].date.split(',')[0]);
                var day_str = (msg.data[i].date.split(',')[0]).split(' ');
                if(last_day < day){
                    last_day = day;
                    $("#"+toHex(msg.channel)+"-item-chl")
                        .append($("<div>",{
                            "class":"chat-message day-label text-center text-muted"    
                            }).append($("<span>",{
                                "text": day_str[0]+' '+monts[day_str[1]]
                            }))
                        );
                }
            }
            
	addMessageToChat({
	    from: msg.data[i].from,
	    date: msg.data[i].date,
	    text: msg.data[i].text,
	    channel: msg.channel,
            isHistory:true
	});
        }
    }
};

function find(array, value) {
  if (array.indexOf) { // если метод существует
    return array.indexOf(value);
  }

  for (var i = 0; i < array.length; i++) {
    if (array[i] === value) return i;
  }

  return -1;
}

var emojys = [];
var emojisLoad =()=> {
    $.getJSON( "http://nilabar.h1n.ru/sq2/img/emojy/", function( data ) {
    
    
    
    emojy_standart = $("<div>",{"class":"scrollbar chat"});
    emojy_celebrate = $("<div>",{"class":"scrollbar chat"});
    emojy_pirates = $("<div>",{"class":"scrollbar chat"});
    emojy_planets = $("<div>",{"class":"scrollbar chat"});
    emojy_old = $("<div>",{"class":"scrollbar chat"});
    emojy_any = $("<div>",{"class":"scrollbar chat"});
    var emojy_tabs = [emojy_standart,emojy_celebrate,emojy_pirates,emojy_planets,emojy_old,emojy_any];
       
    for(var i=0;i < emojy_tabs.length;i++){
        for(var e=0;e< data['tabs'][i]['list'].length;e++){
            
            var _dir = data['tabs'][i]['dir']+"/";
            var _file_name = data['tabs'][i]['list'][e];
            var _code = _file_name.split(".")[0];
            
            emojys.push({
                regExp : new RegExp(":" + _code + ":", "g"),
                dir: _dir,
                filename: _file_name
            });
            
            var emojy = $("<span>", {
		"class": "emj"
		}).append($("<img>", {
		    "src": "http://nilabar.h1n.ru/sq2/img/emojy/" + _dir + _file_name,
		    "alt": ":" + _code + ":",
		    "title": ":" + _code + ":",
		    "data-toggle": "tooltip",
		    click:(evt)=>{
                        insertText(evt.target.alt);}
	    }));
            emojy_tabs[i].append(emojy);
	}
    }
    });
};

var prepareChlName =(item_chl)=>{
    let format_name = item_chl.data("name").substring(1);
    //var i_str = item_chl.data("name").search(new RegExp(myNick, "i"));
    var i_str = format_name.indexOf(myNick);
    if (~i_str && (item_chl.data("channel_type") == "private")) {
	format_name = format_name.replace(myNick, "");
        
    }
    //ограничиваем по длинне имя канала чтоб помешалось в ширину списка    
    if (format_name.length > 10) format_name = format_name.substr(0, 10) + "..";
    
    return format_name;
};

var addChannelTabItem =(item_chl)=>{
        
    var tab_item = $("<div>",{
        "class":"chl-tabs-item d-inline bg-dark text-muted",
        "id":toHex(item_chl.data("name"))+"-chl-tabs-el"
    }).append($("<a>",{
        "class":"btn btn-chl",
        "data-toggle":"tooltip",
        "title":item_chl.data("name"),
        click:(evt)=>{
            selectChannels(item_chl.data("name"),$(evt.target).closest("div"));
        }
    }).append($("<strong>",{"text":" "+prepareChlName(item_chl)})))
    .append($("<a>",{
        "class":"btn btn-close",
        click:(evt)=>{
            if(currentChannel.data("name") == item_chl.data("name")){
                selectChannels("#global",$("#ui-b-globe"));
            }
            $(evt.target).closest("div").remove();
        }
    }).append($("<i>",{"class":"fa fa-times-circle"})));
    tab_item.appendTo("#chl-tabs-area");
    
    return tab_item;
};

var addChanelsListItem =(item_chl)=>{
    var chl_type = "open";
    switch(item_chl.data("channel_type")){
        case"open":
            chl_type = "text-muted";
            break;
        case"private":
            chl_type = "text-light";
            break;
        case"closed":
            chl_type = "text-danger";
            break;
    }
    
    let format_name = prepareChlName(item_chl);
    
    var list_item = $("<div>",{
        "class":"chl-list-item btn-group  d-inline-flex justify-content-end text-muted",
        "id":toHex(item_chl.data("name"))+"-chl-list-el"
    }).append($("<span>",{
        "class":"mr-auto "+chl_type,
        "text":format_name,
        "data-toggle":"tooltip",
        "title":item_chl.data("name")
    }))
    
    .append($("<a>",{
        "class":"btn btn-dark disabled list-item-info-el"
    }).append($("<span>",{
        "class":"badge badge-dark",
        "text":item_chl.data("members").length+" "
        })).append($("<i>",{"class":"fa fa-user"}))
                .append($("<i>",{"class":"fa fa-envelope-o"})))
    
    .append($("<a>",{
        "class":"btn",
        click:()=>{
//информация о канале и управление
            sendMsg("/about ",item_chl.data("name"));  
        }
    }).append($("<i>",{"class":"fa fa-info"})))
    .append($("<a>",{
        "class":"btn",
//работать с каналом и создать закладку
        click:(evt)=>{
            var res = $("#chl-tabs-area").find("div#"+toHex(item_chl.data("name"))+"-chl-tabs-el");
            if(!res.length){
                $(evt.target).closest("div").data("tab-el",addChannelTabItem(item_chl));
            }
            selectChannels(item_chl.data("name"),list_item);
            item_chl.data("list-item").find("i.fa-envelope-o").removeClass("action");
                        
        }
    }).append($("<i>",{"class":"fa fa-sign-in"})))
    .append($("<a>",{
        "class":"btn",
//покинуть канал        
        click:(evt)=>{
            sendMsg("/leave "+item_chl.data("name"),"#global");
        }
    }).append($("<i>",{"class":"fa fa-sign-out"})));
    list_item.data("channel_name",item_chl.data("name"));
    list_item.appendTo($("#channels-list"));
    item_chl.data("list-item",list_item);
};

var searhChannel =()=>{
    $("#channels-list").addClass("d-none");
    $("#channels-list-buff").removeClass("d-none");
    setTimeout(function(){
        $("#channels-list-buff").empty();
        $("#channels-list-buff").append($("<div>",{
            "text":"результат поиска:"
        }));
        var list_items = $("#channels-list").find(".chl-list-item");
        for(var i=0;i<list_items.length;i++){
            if(~$(list_items[i]).data("channel_name").indexOf($("#chl-search-input").val())){
                $(list_items[i]).clone(true,true).appendTo($("#channels-list-buff"));
            }
        }
    },1000);
};

var calcSizeChatBlock =(as,prc)=>{
    var sw = window.screen.availWidth;
    var sh = window.screen.availHeight;
    console.log("screen: ",sw,sh);
    if(sw > sh){
        var hprc = (((sh/100)*as)/100)*prc;
      $(".scrollbar").css("min-height",hprc+"px");
      $(".scrollbar").css("max-height",hprc+"px");
    }else{
        
    }
};


var preloadChat =()=>{
      
    //
    emojisLoad();
    //
    var list = $("<div>",{
       "class":"scrollbar info-item d-none",
       "id":"channels-list"
    });    
    list.appendTo("#info-point");
    
    var list_buff = $("<div>",{
       "class":"scrollbar info-item d-none",
       "id":"channels-list-buff"
    });    
    list_buff.appendTo("#info-point");
    
    var list_search = $("<div>",{
        "class":"card-footer info-item",
        "id":"channels-list-search"
    }).append($("<div>",{
        "class":"input-group input-group-sm"
    }).append($("<input>",{
        "class":"form-control",
        "id":"chl-search-input",
        "type":"text",
            keydown:(evt)=>{
                if($("#chl-search-input").val() != ""){
                    searhChannel();   
                }else{
                    $("#ui-b-list").click();
                }
            }
    })).append($("<div>",{
        "class":"input-group-btn"
    }).append($("<button>",{
        "class":"btn btn-dark chat",
        click:()=>{
            searhChannel();
        }
    }).append($("<i>",{"class":"fa fa-search"})))
      .append($("<button>",{
        "class":"btn btn-dark chat",
        click:()=>{
            $("#chl-search-input").val("");
            $("#ui-b-list").click();
        }
    }).append($("<i>",{"class":"fa fa-trash"})))      
    ));
    list_search.appendTo($("#info-block > div.card"));
    
    
};

var initChat =()=>{
    
    $('[data-toggle="tooltip"]').tooltip();
    
    $("#ui-b-globe").click();
    $("#ui-b-list").click();
};