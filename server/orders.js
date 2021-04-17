require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");

let Orders = {};
Orders.list = [];
Orders.idMap = [];

let transporter = nodemailer.createTransport({
    host: 'smtp.googlemail.com', // Gmail Host
    port: 465, // Port
    secure: true, // this is true as port is 465
    auth: {
        user: process.env.GMAIL_USER, // generated ethereal user
        pass: process.env.GMAIL_PASSWORD, // generated ethereal password
    },
});

Orders.sendMail = function(order){
    transporter.sendMail({
        from: `"Alpop's Pizza" <${process.env.GMAIL_USER}>`,
        to: order.email,
        subject: "Your order at Alpop's Pizza",
        html:
        `
        Hey ${order.name},<br>
        Your recent order at Alpop's Pizza is available 
        <a href="${process.env.SITE_HOST}/view_order.html?order_id=${order.order_id}">here</a>!<br>
        Enjoy the meal! :D
        `,
    });
}

Orders.placeOrder = (data)=>{
    let mOrder = {
        name: data.name.trim(),
        email: data.email.trim(),
        cart: data.cart,
        order_id: uuidv4()
    };
    Orders.list.push(mOrder);
    Orders.idMap[mOrder.order_id] = mOrder;
    Orders.sendMail(mOrder);
    return mOrder;
}

Orders.get = (id)=>{
    return Orders.idMap[id];
}

module.exports = Orders;