require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser'); 
const cors = require('cors'); 
const Orders = require('./orders')

app.use(cors());
app.use(bodyParser.json());

app.post('/place_order',(req,res)=>{
    if(req.body.name==null) return res.send({success: false, message: "Missing parameter: name"})
    if(req.body.email==null) return res.send({success: false, message: "Missing parameter: email"})
    if(req.body.cart==null) return res.send({success: false, message: "Missing parameter: cart"})
    if(req.body.name.trim()=="") return res.send({success: false, message: "Empty parameter: name"})
    if(req.body.email.trim()=="") return res.send({success: false, message: "Empty parameter: email"})
    if(req.body.cart.length==0) return res.send({success: false, message: "The cart is empty"})

    let mOrder = Orders.placeOrder(req.body);
    mOrder.success = true;
    res.send(mOrder)
})

app.get('/get_order',(req,res)=>{
    if(req.query.order_id==null) return res.send({success: false, message: "Missing parameter: order_id"})
    let mOrder = Orders.get(req.query.order_id);
    if(mOrder)
        res.send({
            success: true,
            order: mOrder
        })
    else
        res.send({
            success: false,
            message: "That order ID does not exist or has expired."
        })
})

app.listen(process.env.PORT,_=>{
    console.log(`Alpop's Server running on port ${process.env.PORT}`);
})