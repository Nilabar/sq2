function getStatus(){
  if (gettingStatus == true) {

  } else {
    $.ajax({
      type: "GET",
      url: "/game/ajax/whatsup",
      success: function(msg){
        var c_status = JSON.parse(msg);
        updateStatus(c_status);
        gettingStatus = false;
      },
      error: function(){
        gettingStatus = false;
      }
    });
    gettingStatus = true;
  }
};


/*
neighbors
 ship_name
 pilot
 ship_uid
 ship_type (int)
 docking (boolean)
*/
function updateStatus(s) {
  if(s['neighbors']){
    
    
    var last_scan = $("#neighbors").find(".radar-item");
    //console.log(last_scan);
    for(i = 0; i < last_scan.length; i++){
      var isFind = -1;
      for(u = 0; u < s['neighbors'].length;u++){
        if($(last_scan[i]).attr("data-ship-uid") == s['neighbors'][u]["ship_uid"]){
          //сравниваем изменения
          
          isFind = u;
          break;
        }
      }  
      if(~isFind){
        s['neighbors'].splice(u,1);
      }else{
        //объекта нет - удаляем запись..
        $(last_scan[i]).remove();
      }
      
    }
    
    var item_count = $("#neighbors").find(".radar-item").length;
    for(n = 0;n < s['neighbors'].length;n++){
            
      var item_container = 
      $("<div>",{
        "class":"radar-item btn-group d-inline-flex justify-content-end",
        "data-ship-uid":s['neighbors'][n]["ship_uid"]
      })
      
      var shp_name = s['neighbors'][n]["ship_name"];
      if(shp_name.length > 14)shp_name = shp_name.substr(0,14)+'..';
      
      var plt_name = s['neighbors'][n]["pilot"];
      if(plt_name.length > 14)plt_name = plt_name.substr(0,14)+'..';
      
      var el_info = 
      $("<div>",{
        "class":"mr-auto d-flex flex-column lp-1" 
        }).append($("<div>",{
          "text":shp_name
        })).append($("<div>",{
            "class":"lp-1"
          }).append($("<small>",{
              "text":plt_name
      })));
      
      var el_online =
      $("<a>",{
         "class":"btn btn-lg disabled"
      }).append($("<i>",{"class":"fa fa-power-off"}));
      // написать функцию
      //if(isOnline)
      
      var el_ship_img =
      $("<span>",{
        "class":"btn",
        click:()=>{
          
        }
      }).append($("<img>",{"src":"/img/assets/sheep-"+s['neighbors'][n]["ship_type"]+".png"}));
      
      
      var el_docking =
      $("<a>",{
         "class":"btn btn-lg disabled op-0"          
      }).append($("<i>",{"class":"fa fa-sign-in"}));
      //
      if(s['neighbors'][n]['docking']){
        el_docking.removeClass("disabled op-0");
        el_docking.on("click",()=>{
          console.log("в док!");
        });
      }
      
      var el_attack =
      $("<a>",{
         "class":"btn btn-lg"
      }).append($("<i>",{"class":"fa"}));
      //
      el_attack_i = el_attack.find("i");
      if(s['neighbors'][n]['attack']){
        el_attack_i.addClass("fa-crosshairs")
        el_attack.on("click",()=>{
          console.log("в бой!");
        });
      }else{
        if(s['neighbors'][n]['ship_type'] != 1){
          el_attack.addClass("disabled")
          el_attack_i.addClass("fa-wrench")
        }else{
          el_attack.addClass("disabled")
          el_attack_i.addClass("fa-home text-terminal-success")
        }
      }
      
      
      item_container.append(el_info);      
      item_container.append(el_online);
      item_container.append(el_ship_img);
      item_container.append(el_docking);
      item_container.append(el_attack);
       
      $("#neighbors").prepend(item_container);
    }
    
    $("#radar-user.badge").empty();
    $("#radar-user.badge").text($("#neighbors").find(".radar-item").length);
    
    
  }
};