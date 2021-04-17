import PizzaRenderer from './pizza-renderer.js'

// A utility function to generate item and cart IDs
function uuid() {
    return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16).toUpperCase();
    });
  }

var app;
var mPizzaRenderer;

function initThree(){
    const threeHolder = document.getElementById("three-holder");
    mPizzaRenderer = new PizzaRenderer(threeHolder);
}

// Base Cart Item. These properties will get copied over to any new item added to the cart
const cartItemBase = {
    cart_id: "",
    base_name: "",
    base_id: "",
    price: 0,
    toppings: [
        {
            name: "Cheese",
            id: "cheese",
            price: 0
        }
    ]
}

/*
    Pizza Size properties
*/

const smallProps = {
    base_name: "Small Pizza",
    base_id: "small",
    price: 150
}

const mediumProps = {
    base_name: "Medium Pizza",
    base_id: "medium",
    price: 220
}

const largeProps = {
    base_name: "Large Pizza",
    base_id: "large",
    price: 350
}

/*
    Topping property definitions. See pizza-renderer.js for model definitions
*/

const toppings = [
    {
        name: "Pepperoni",
        id: "pepperoni",
        price: 60
    },
    {
        name: "Paneer Tikka",
        id: "paneer",
        price: 40
    },
    {
        name: "Corn",
        id: "corn",
        price: 20
    },
    {
        name: "Capsicum",
        id: "capsicum",
        price: 30
    },
    {
        name: "Chicken Sausages",
        id: "sausages",
        price: 80
    },
]

// The page will start with one plain small pizza already in the cart.

let firstItem = {}
Object.assign(firstItem,cartItemBase);
Object.assign(firstItem,smallProps);
firstItem.cart_id = uuid();

window.onload = function(){
    // Initialize your Vue App
    app = new Vue({
        el: '#customize-content',
        data: {
            selectedItem: firstItem.cart_id,
            cart: [
                firstItem
            ],
            toppings: toppings,
            cartCount: 1,
            mode: 0
        },
        methods: {
            // Utility methods to be called in the UI
            getCartPrice(){
                let c = 0;
                for(let i=0;i<this.cart.length;i++){
                    c+=this.getItemPrice(this.cart[i])
                }
                return c;
            },
            selectCartItem(id){
                this.selectedItem = id;
                mPizzaRenderer.changePizzaBase(this.gsi().base_id)
                this.refreshToppings()
            },
            getSelectedItem(){
                for(let i=0;i<this.cart.length;i++){
                    if(this.cart[i].cart_id==this.selectedItem){
                        return this.cart[i]
                    }
                }
            },
            gsi(){
                return this.getSelectedItem()
            },
            newCartItem(){
                let item = {}
                Object.assign(item,cartItemBase);
                Object.assign(item,smallProps);
                item.toppings = [{
                    name: "Cheese",
                    id: "cheese",
                    price: 0
                }]
                item.cart_id = uuid();
                this.cart.push(item)
                this.cartCount++;
                if(this.cartCount==1){
                    this.selectCartItem(item.cart_id)

                    setTimeout(initThree,500)
                }
            },
            selectPizzaSize(size){
                let sizes = {
                    small: smallProps,
                    medium: mediumProps,
                    large: largeProps
                }
                Object.assign(this.gsi(),sizes[size])
                this.refreshToppings()
                
            },
            isToppingSelected(t){
                let it = this.gsi();
                for(var i=0;i<it.toppings.length;i++){
                    if(it.toppings[i].id==t.id){
                        return true
                    }
                }
                return false
            },
            toggleTopping(t){
                let it = this.gsi();
                for(var i=0;i<it.toppings.length;i++){
                    if(it.toppings[i].id==t.id){
                        it.toppings.splice(i,1)
                        this.refreshToppings()
                        return true
                    }
                }
                
                it.toppings.push(t)
                this.refreshToppings()

            },
            refreshToppings(){
                // Resyncs the list of topics with the renderer and re-renders the pizza
                mPizzaRenderer.toppingList = []
                let tl = this.gsi().toppings;
                for(let i=0;i<tl.length;i++){
                    if(tl[i].id!="cheese")
                    mPizzaRenderer.toppingList.push(tl[i].id)
                }
                mPizzaRenderer.changePizzaBase(this.gsi().base_id)
            },
            getItemPrice(item){
                let price = item.price;
                for(var i=0;i<item.toppings.length;i++){
                    price+=item.toppings[i].price
                }
                return price
            },
            removeCartItem(itemId,event){
                if(event)
                    event.preventDefault();
                
                for(let i=0;i<this.cart.length;i++){
                    if(this.cart[i].cart_id==itemId){
                        this.cart.splice(i,1)
                    }
                }
                if(this.selectedItem==itemId && this.cart.length>0){
                    this.selectCartItem(this.cart[0].cart_id)
                }
                this.cartCount--;
            },
            checkInputs(){
                let nameInput = document.getElementById("input_name")
                let emailInput = document.getElementById("input_email")
                let ret = true;

                // Check if the inputted email is valid
                if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailInput.value)){
                    emailInput.setAttribute("correct","yes")
                } else if(emailInput.value==""){
                    emailInput.setAttribute("correct","none");
                    ret = false;
                }else{
                    emailInput.setAttribute("correct","no")
                    ret = false;
                }
                
                // Check if the name is too long
                if(nameInput.value.trim().length>=30){
                    nameInput.setAttribute("correct","no");
                    ret = false;
                }else if(nameInput.value.trim()==0){
                    nameInput.setAttribute("correct","none");
                    ret = false;
                }else{
                    nameInput.setAttribute("correct","yes");
                }

                document.getElementById("order_btn").setAttribute("menabled",ret);
                return ret;
            },
            checkoutBackClick(){
                this.mode = 0;
                setTimeout(_=>{
                    initThree()
                    this.refreshToppings()
                },500)
            },
            placeOrder(){
                if(!this.checkInputs()) return;
                let name = document.getElementById("input_name").value.trim();
                let email = document.getElementById("input_email").value.trim();
                fetch("http://pizza.sparkdevs.net:5560/place_order",{
                    method: "POST",
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cart: this.cart,
                        name: name,
                        email: email
                    })
                })
                .then(res=>res.json())
                .then(jsonData=>{
                    if(!jsonData.success)
                        return alert(jsonData.message);
                    window.location = "success.html?order_id="+jsonData.order_id;

                })
            }
        }
    });
    window.app = app;
    initThree()
}

