
import PizzaRenderer from './pizza-renderer.js'

// A Utility function to get the value of a GET parameter from the page URL.
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

let app;
window.onload = function(){
    // Initialize your Vue App
    app = new Vue({
        el: '#view-content',
        data: {
            orderID: "-",
            title: "Loading",
            message: "",
            status: 0,
            order: {},
            view_link: ""
        },
        methods: {
            renderPizzas(){
                for(var i=0;i<this.order.cart.length;i++){
                    let pr = new PizzaRenderer(document.getElementById(this.order.cart[i].cart_id));
                    pr.toppingList = this.order.cart[i].toppings.map(it=>it.id).filter(it=>it!="cheese");
                    pr.changePizzaBase(this.order.cart[i].base_id);
                }
                
            }
        }
    });

    app.orderID = getParameter("order_id");
    if(app.orderID==null || app.orderID.trim()==""){
        app.title = "Missing Order ID";
        app.message = "No Order ID was specified in the URL.";
        app.status = -1;
        app.orderID = "?";
    }else{
        // Fetch the details of the order
        fetch("http://pizza.sparkdevs.net:5560/get_order?order_id="+encodeURIComponent(app.orderID))
        .then(res=>res.json())
        .then(jsonData=>{
            if(!jsonData.success){
                app.message = jsonData.message;
                app.title = "Error";
            }else{
                app.title = "Your pizza is here!";
                app.order = jsonData.order;
                app.status = 1;
            }
            window.setTimeout(app.renderPizzas,500)
        })
    }
}