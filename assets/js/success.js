
function getParameter(p){
    var result = {};
    var temp = [];
    location.search
        .substr (1)
        .split ("&")
        .forEach (function(item){
            temp = item.split("=");
            result[temp[0]] = decodeURIComponent(temp[1]);
        });

    return result[p];
}

window.onload = function(){
    // Initialize your Vue App
    app = new Vue({
        el: '#success-content',
        data: {
            orderID: "-",
            title: "Loading",
            message: "",
            status: 0,
            order: {},
            view_link: ""
        }
    });

    app.orderID = getParameter("order_id");
    if(app.orderID==null || app.orderID.trim()==""){
        app.title = "Missing Order ID";
        app.message = "No Order ID was specified in the URL.";
        app.status = -1;
        app.orderID = "?";
    }else{
        fetch("http://pizza.sparkdevs.net:5560/get_order?order_id="+encodeURIComponent(app.orderID))
        .then(res=>res.json())
        .then(jsonData=>{
            if(!jsonData.success){
                app.message = jsonData.message;
                app.title = "Error";
            }else{
                app.title = "Your pizza is on it's way!";
                app.message = `The link to your order has been sent to ${jsonData.order.email}`;
                app.status = 1;
                app.order = jsonData.order;
                app.view_link = "view_order.html?order_id="+encodeURIComponent(app.orderID);
            }
        })
    }
}