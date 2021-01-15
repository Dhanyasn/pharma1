// require modules
const express =require("express")
const app=express()
const bodyParser=require("body-parser")
const database=require("./scripts/database")
const mysql = require('mysql');
const fs =require("fs");
const nodemailer = require('nodemailer');
const session = require('express-session');


const md5 = require('md5');


//declasring app.

app.set("view engine","ejs")
app.use(express.static("public"))
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(express.json({extended: false}));
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json());

//body
var db = mysql.createConnection(database.connect);
db.connect(function(err) {
  if (err) {return console.error('error: ' + err.message);}
  console.log('Connected to the MySQL server.');
});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dhanyanarayanaswamy@gmail.com',
    pass: 'dkcknsani'
  }
});


// login
// app.route("/").get(function(req,res){
//   res.render("login")
// }).post(function(req,res){
//    db.query("select * from password where user_id='"+req.body.admin_id+"'",function(err,rs){
//     if(err){console.log(err.message)}
//       rs.forEach(function(item){

//         if(md5(req.body.admin_pass) == item.user_pass){
        
//         req.session.loggedin = true;
//         req.session.username = item.user_id;
//         res.render("home")}
//       })
        
//    })
   
// })

// app.route("/staff_det/:id").get(function(req,res){
//   if(id=="Admin"){
//     res.render("staff_login")
//   }
// }).post(function(req,res){

// })
// route
app.route("/").get(function(req,res){
  res.render("home");
})


app.route("/products").get(function(req,res){
  if(req.session.loggedin=true){
  db.query('select * from products order by products_id desc',function(err,rs){
    if(err){console.log(err.message)}
    else
      res.render("products",{products:rs})
  })
}

}).post(function(req,res){
  db.query("INSERT INTO todoapp.products VALUES ('"+req.body.products_id+"','"+
    req.body.products_name+"',"+ req.body.products_no+","+ req.body.products_price+",'"+req.body.products_type+"','"+req.body.products_state+"','"+
    req.body.products_size+"','"+req.body.products_weight+"','"+req.body.products_use+"','"+req.body.products_composition+"','"+req.body.products_ayur+"','"+req.body.company_id+"')",
    function(err, results, fields) {
    if (err) {console.log(err.message);}})
   res.redirect("/products")
})



app.route("/company").get(function(req,res){
  db.query('select * from company order by company_id desc',function(err,rs){
    if(err){console.log(err.message)}
    else
     res.render("company",{company:rs})
  })
}).post(function(req,res){
  db.query("INSERT INTO todoapp.company  VALUES ('"+ req.body.company_id+"','"+ req.body.company_name+"','"+ req.body.company_address
    +"','"+ req.body.company_email+"')",
    function(err, results, fields) {
    if (err) {console.log(err.message);}})
   res.redirect("/company")
})




app.route("/customer").get(function(req,res){
  db.query('select * from customer order by customer_phone desc',function(err,rs){
    if(err){console.log(err.message)}
    else
     res.render("customer",{customer:rs})
    
  })
}).post(function(req,res){
   db.query("INSERT INTO todoapp.customer VALUES ('"+ req.body.customer_name+"','"+ req.body.customer_address+"','"+
     req.body.customer_phone+"','"+ req.body.customer_membership+"')",
    function(err, results, fields) {
    if (err) {console.log(err.message);}})
    res.redirect("/customer")
})




app.route("/staff").get(function(req,res){
  db.query('select * from staff order by staff_id desc',function(err,rs){
    if(err){console.log(err.message)}
    else
     res.render("staff",{staff:rs})
    
  })
}).post(function(req,res){
  db.query("INSERT INTO todoapp.staff VALUES ('"+ req.body.staff_id+"','"+ req.body.staff_name+"','"+ req.body.staff_address+"','"+ req.body.staff_phone+"')",
    function(err, results, fields) {
    if (err) {console.log(err.message);}})
   res.redirect("/staff")
})




app.route("/bill").get(function(req,res){
  db.query('select * from bill order by bill_id desc',function(err,rs){
    if(err){console.log(err.message)}
    else
     res.render("bill",{bill:rs})
    })
}).post(function(req,res){
  global.bill_id=req.body.bill_id
 
 db.query("insert into bill values('"+req.body.bill_id+"','"+req.body.staff_id+"','"+req.body.customer_phone+"',CURDATE())",
  function(err,results,fields){
    if (err) {console.log(err.message)}
  })
 db.query("INSERT INTO customer (customer_phone) SELECT * FROM (SELECT "+req.body.customer_phone+
  ") as tmp WHERE NOT EXISTS (SELECT customer_phone FROM customer WHERE customer_phone ="+
  req.body.customer_phone+") LIMIT 1",
  function(err,results,fields){
    if (err) {console.log(err.message)}
  })
  res.redirect("/billing")
})




app.route("/billing").get(function(req,res){
  db.query('select * from invoice where(`bill_id`="'+bill_id+'")',function(err,rs){
    if(err){console.log(err.message)}
    else
     res.render("billing",{invoice:rs})
 })
}).post(function(req,res){
  db.query("INSERT INTO `todoapp`.`invoice`(bill_id,products_id,unit_price,quantity,discount,total_price,invoice_date) VALUES ('"+bill_id+"','"+req.body.products_id
    +"',(select products_price from products  where products_id='"+
    req.body.products_id+"'),"+req.body.quantity+",(select dicount_amount from discount where products_id='"+req.body.products_id+
    "' and curdate() between discount_from and discount_to) ,(select products_price from products  where products_id='"+
    req.body.products_id+"')*"+req.body.quantity+",CURDATE());",
    function(err, results, fields) {
    if (err) {console.log(err.message);}})
   res.redirect("/billing")
})




app.route("/order").get(function(req,res){
  db.query('select * from orders order by order_id desc',function(err,rs){
    if(err){console.log(err.message)}
    else
     res.render("order",{order:rs})
    })
}).post(function(req,res){
  db.query("INSERT INTO `todoapp`.`orders` VALUES ('"+req.body.order_id+"','"+req.body.products_id+"',"+req.body.products_no
    +",(select products.company_id from products  where (products_id='"+
    req.body.products_id+"')),CURDATE())",
    function(err, results, fields) {
    if (err) {console.log(err.message);}})
   res.redirect("/order")
})



app.route("/deliver").get(function(req,res){
  db.query('select * from deliver order by order_id desc',function(err,rs){
    if(err){console.log(err.message)}
    else
     res.render("deliver",{deliver:rs})
  })
}).post(function(req,res){
  db.query("INSERT INTO `todoapp`.`deliver` VALUES ('"+req.body.deliver_id+"','"+req.body.order_id+"',"+req.body.total_price
    +",CURDATE())",
    function(err, results, fields) {
    if (err) {console.log(err.message);}})
   res.redirect("/deliver")
})



app.route("/discount").get(function(req,res){
  db.query('select * from discount ',function(err,rs){
    if(err){console.log(err.message)}
    else
     res.render("discount",{discount:rs})
  })
}).post(function(req,res){
  db.query("INSERT INTO `todoapp`.`discount` VALUES ('"+req.body.discount_id+"','"+req.body.products_id+"',"+req.body.dicount_amount+",'"+req.body.discount_from+"','"+req.body.discount_to+"')"
   ,
    function(err, results, fields) {
    if (err) {console.log(err.message);}})
   res.redirect("/discount")
})




app.route("/place").get(function(req,res){
   res.render("place",{info:"get"})  

}).post(function(req,res){
   db.query("select * from products where products_no < "+req.body.range_from+" order by products_no asc",function(err,rs){
    if (err) {console.log(err.message)}
      res.render("place_order",{place:rs,info:"below"})
    
   })
})
app.post("/placing_order",function(req,res){
   db.query("select c.company_email,p.products_name,p.products_no from products as p join company as c on p.company_id=c.company_id where p.products_id='"+req.body.products_id+"'",function(err,rs){
    if (err) {console.log(err.message)}
     rs.forEach(function(item){
    var company_email=item.company_email
    var products_name=item.products_name
       var today=new Date()
    var mailOptions = {
      from: 'dhanyanarayanaswamy@gmail.com',
      to:company_email ,
       subject: "Order for "+products_name,
      text: "Placing order from ByPharm pharmacy.We expect the fast deliver if possible.Date:"+today+"\nOrder id= "+req.body.order_id +"\n Pharmacy id=BY1254154 \n Products_id= "+req.body.products_id+" \n products_name= "+products_name+" \n products_no= "+item.products_no 
    };

    transporter.sendMail(mailOptions, function(error, info){
     if (error) {
      console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  })

   db.query('insert into orders values("'+req.body.order_id+'","'+req.body.products_id+'",'+req.body.quantity+',(select company_id from products where products_id="'+req.body.products_id+'"),curdate())',function(err,ret){
    if(err){console.log(err.message)}})
  
  })
   

   res.redirect("/order")
})


app.route("/return").get(function(req,res){
  db.query('select * from returns ',function(err,ret){
    if(err){console.log(err.message)}
    else
     res.render("return",{ret:ret})
 })
}).post(function(req,res){
  db.query("select date_add(invoice_date,interval 15 day) as invoice_date,bill_id,products_id,quantity from invoice where( bill_id='"+req.body.bill_id+"' and products_id='"+req.body.products_id+"')",function(err, invoice) {
    if (err) {console.log(err.message);}
   invoice.forEach(function(item){
    var invoice_date=new Date(item.invoice_date)
    var date=new Date(req.body.date)
   
    if ( date < invoice_date ){
      db.query("insert into todoapp.returns values('"+req.body.bill_id+"','"+req.body.products_id+"',"+req.body.quantity+",'"+req.body.date+"')",function(err,ret){if(err){console.log(err.message)}
        db.query("update invoice set quantity=(quantity-"+req.body.quantity+") where bill_id='"+req.body.bill_id+"' and products_id='"+req.body.products_id+"'",function(req,res){if(err){console.log(err.message)}
         
        })
      })
    }

   })
  })
   res.redirect("/return")
})


app.get("/place/:id",function(req,res){
   db.query('select * from orders order by order_id desc',function(err,rs){
  res.render("place_order",{info:"email",id:req.params.id,order:rs})
  })

})


app.get("/invoice/:id",function(req,res){
   db.query('select * from invoice where (bill_id="'+req.params.id +'")',function(err,rs){
    if(err){console.log(err.message)}
    res.render("invoice",{invoice:rs})
  })

})


//ONLY GETS 

app.get("/slip",function(req,res){
  db.query("select a.customer_membership,b.bill_id from bill as b join customer as a on b.customer_phone=a.customer_phone where bill_id='"+global.bill_id+"'",function(err,rs){
  if(err){console.log(err.message)}
   db.query("update products join invoice as i on products.products_id=i.products_id set products.products_no=products.products_no-i.quantity where i.bill_id='"+global.bill_id+"'",function(err,update){
    db.query(" select coalesce(c.dicount_amount,0) as dicount_amount,products.products_name,invoice.unit_price,invoice.quantity,invoice.total_price "+
       "from invoice  join products on invoice.products_id=products.products_id "+
      "left join (select * from discount where curdate()  between discount_from and discount_to)as c on products.products_id=c.products_id "+
    " where invoice.bill_id='"+global.bill_id+"'"
      ,function(err,invoice){
    if(err){console.log(err.message)}
       
          res.render("slip",{slip:invoice,member:rs})
      })
    })
  })
  
})




app.get("/statastics/products",function(req,res){
  res.render("statastics",{info:"products"})
})

app.get("/statastics/staff",function(req,res){
  res.render("statastics",{info:"staff"})
})

app.get("/statastics/customer",function(req,res){
  res.render("statastics",{info:"customer"})
})

app.get("/company/:id",function(req,res,next){
	 db.query("DELETE FROM `todoapp`.`company` WHERE (`company_id`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
    res.redirect("/company")
})



app.get("/customer/:id",function(req,res,next){
  db.query("DELETE FROM `todoapp`.`customer` WHERE (`customer_phone`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
  
    res.redirect("/customer")
})



app.get("/staff/:id",function(req,res,next){
  db.query("DELETE FROM `todoapp`.`staff` WHERE (`staff_id`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
  
    res.redirect("/staf")
})

app.get("/products/:id",function(req,res,next){
  db.query("DELETE FROM `todoapp`.`products` WHERE (`products_id`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
  
    res.redirect("/products")
})


app.get("/billing/:id",function(req,res,next){
   db.query("DELETE FROM `todoapp`.`invoice` WHERE (`bill_id`=`"+bill_id+"` and products_id`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
  
    res.redirect("/")
})

app.get("/order/:id",function(req,res,next){
   db.query("DELETE FROM `todoapp`.`orders` WHERE (`order_id`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
    res.redirect("/order")
})

app.get("/deliver/:id",function(req,res,next){
   db.query("DELETE FROM `todoapp`.`deliver` WHERE (`deliver_id`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
    res.redirect("/deliver")
})

app.get("/bill/:id",function(req,res,next){
   db.query("DELETE FROM `todoapp`.`bill` WHERE (`bill_id`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
    res.redirect("/bill")
})

app.get("/discount/:id",function(req,res,next){
   db.query("DELETE FROM `todoapp`.`discount` WHERE (`discount_id`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
    res.redirect("/discount")
})

app.get("/billing/cancel/:id",function(req,res,next){
  db.query("DELETE FROM `todoapp`.`invoice` WHERE (`bill_id`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
  db.query("DELETE FROM `todoapp`.`bill` WHERE (`bill_id`=?)",req.params.id,function(err,rs){
    if(err){console.log(err.message)}
    })
  
  
    res.redirect("/bill")
})


app.get("/chart",function(req,res,next){
  db.query('select sum(total_price) as a,(sum(total_price)-(sum(total_price)*sum(discount))) as b from invoice ',function(err,sales){
    if(err){console.log(err.message)}
   db.query("select count(i.products_id) as c,b.products_name from invoice as i join products as b on b.products_id=i.products_id group by i.products_id",function(err,rs){
    if(err){console.log(err.message)}
       db.query('select count(products_id)/(select count(i.products_id)  from invoice as i join products as p on p.products_id=i.products_id where p.products_type like "%medicine%") as med from products where products_type like "%medicine%"',function(err,med){
       if(err){console.log(err.message)}
         db.query('select count(products_id)/(select count(i.products_id)  from invoice as i join products as p on p.products_id=i.products_id where p.products_type like "%cosmetics%") as cos from products where products_type like "%cosmetics%"',function(err,cos){
         if(err){console.log(err.message)}
           db.query('select count(products_id)/(select count(i.products_id) from invoice as i join products as p on p.products_id=i.products_id where p.products_type like "%healthcare%") as hel from products where products_type like "%healthcare%"',function(err,hel){
           if(err){console.log(err.message)}
            db.query("select sum(total_price) as a,monthname(invoice_date) as b,year(invoice_date) as c from invoice group by DATE_FORMAT(invoice_date, '%Y%m')",function(err,dat){
              if(err){console.log(err.message)}
              res.render("chart",{chart:rs,sales:sales,med:med,cos:cos,hel:hel,dat,dat})
            })
            })
          })
        })
      })
   })
})

//only gets of company edits


app.route("/companyEdit/:id").get(function(req,res){
  const sql="select * from company where company_id='"+req.params.id+"'"
  db.query(sql,function(err,rs){
  
      res.render("edit",{info:"company",rs:rs})
  })
}).post(function(req,res){
  db.query("update company set company_id='"+req.body.company_id+"',company_name='"+
    req.body.company_name+"',company_email='"+req.body.company_email+"',company_address='"+
    req.body.company_address+"' where company_id='"+req.body.company_id+"'"
    ,function(err,rs){if(err){console.log(err.message)}})
   res.redirect("/company")
})


app.route("/productsEdit/:id").get(function(req,res){
  const sql="select * from products where products_id='"+req.params.id+"'"
  db.query(sql,function(err,rs){
  
      res.render("edit",{info:"products",rs:rs})
  })
}).post(function(req,res){
  db.query("update products set products_id='"+req.body.products_id+"',products_name='"+
    req.body.products_name+"',company_id='"+req.body.company_id+"',products_no="+
    req.body.products_no+",products_price="+req.body.products_price+",products_use='"+
    req.body.products_use+"',products_weight='"+req.body.products_weight+"',products_composition='"+
    req.body.products_composition+"',products_type='"+req.body.products_type+"',products_ayur='"+
    req.body.products_ayur+"',products_size='"+req.body.products_size+"',products_state='"+
    req.body.products_state+
    "' where products_id='"+req.body.products_id+"'"
    ,function(err,rs){if(err){console.log(err.message)}})
   res.redirect("/products")
})


app.route("/customerEdit/:id").get(function(req,res){
  const sql="select * from customer where customer_phone='"+req.params.id+"'"
  db.query(sql,function(err,rs){
  
      res.render("edit",{info:"customer",rs:rs})
  })
}).post(function(req,res){
  db.query("update customer set customer_phone='"+req.body.customer_phone+"',customer_name='"+
    req.body.customer_name+"',customer_membership='"+req.body.customer_membership+"',customer_address='"+
    req.body.customer_address+"' where customer_phone='"+req.body.customer_phone+"'"
    ,function(err,rs){if(err){console.log(err.message)}})
   res.redirect("/customer")
})


app.route("/staffEdit/:id").get(function(req,res){
  const sql="select * from staff where staff_id='"+req.params.id+"'"
  db.query(sql,function(err,rs){
  
      res.render("edit",{info:"staff",rs:rs})
  })
}).post(function(req,res){
  db.query("update staff set staff_id='"+req.body.staff_id+"',staff_name='"+
    req.body.staff_name+"',staff_phone='"+req.body.staff_phone+"',staff_address='"+
    req.body.staff_address+"' where staff_id='"+req.body.staff_id+"'"
    ,function(err,rs){if(err){console.log(err.message)}})
   res.redirect("/staff")
})


app.route("/orderEdit/:id").get(function(req,res){
  const sql="select * from orders where order_id='"+req.params.id+"'"
  db.query(sql,function(err,rs){
  
      res.render("edit",{info:"order",rs:rs})
  })
}).post(function(req,res){
  db.query("update orders set order_id='"+req.body.order_id+"',products_id='"+
    req.body.products_id+"',products_no="+req.body.products_no+" where order_id='"+req.body.order_id+"'"
    ,function(err,rs){if(err){console.log(err.message)}})
   res.redirect("/order")
})


app.route("/deliverEdit/:id").get(function(req,res){
  const sql="select * from deliver where deliver_id='"+req.params.id+"'"
  db.query(sql,function(err,rs){
  
      res.render("edit",{info:"deliver",rs:rs})
  })
}).post(function(req,res){
  db.query("update deliver set deliver_id='"+req.body.deliver_id+"',order_id='"+
    req.body.order_id+"',total_price="+req.body.total_price+" where deliver_id='"+req.body.deliver_id+"'"
    ,function(err,rs){if(err){console.log(err.message)}})
   res.redirect("/deliver")
})

app.route("/discountEdit/:id").get(function(req,res){
  const sql="select * from discount where discount_id='"+req.params.id+"'"
  db.query(sql,function(err,rs){
  
      res.render("edit",{info:"discount",rs:rs})
  })
}).post(function(req,res){
  db.query("update discount set discount_id='"+req.body.discount_id+"',products_id='"+
    req.body.products_id+"',dicount_amount="+req.body.dicount_amount+",discount_from='"+
    req.body.discount_from+"',discount_to='"+req.body.discount_to+"' where discount_id='"+req.body.discount_id+"'"
    ,function(err,rs){if(err){console.log(err.message)}})
   res.redirect("/discount")
})

//STATASTICS POST

app.post("/staff_sat",function(req,res){
  const sql="select s.staff_name, count(a.staff_id) from bill as a join staff as s on a.staff_id=s.staff_id where a.bill_date between '"+
  req.body.invoice_date+"' and '"+req.body.invoice_dates+"'group by a.staff_id having count(a.staff_id) order by count(a.staff_id) desc limit 1"
  db.query(sql,
    function(err, results, fields) {
   
  res.render("statastics_res",{content:results,info:"staff"})
  })
})
app.post("/statastics/customer",function(req,res){
  const sql="select  count(customer_phone) as count from bill  where bill_date between '"+
  req.body.bill_date+"' and '"+req.body.bill_dates+"'"
  db.query(sql,
    function(err, results, fields) {
   
  res.render("statastics_res",{content:results,info:"customer"})
  })
})

app.post("/statastics/customer",function(req,res){
  const sql="select  count(customer_phone) as count from bill  where bill_date between '"+
  req.body.bill_date+"' and '"+req.body.bill_dates+"'"
  db.query(sql,
    function(err, results, fields) {
   
  res.render("statastics_res",{content:results,info:"customer"})
  })
})


app.post("/statastics/products",function(req,res){
  
  const sql="select b.products_name,a.products_id,c.company_name,sum(a.quantity) as q from invoice as a join products as b on a.products_id=b.products_id join company as c on c.company_id=b.company_id where (a.invoice_date between '"+req.body.invoice_date+"' and '"+req.body.invoice_dates +"'" 
   if (req.body.products_type!=undefined) {
     if (req.body.company_name!=undefined) {
       db.query(sql+" and b.products_type='"+req.body.products_type+"' and c.company_name like '%"+req.body.company_name+"%') group by a.products_id order by q desc limit 1",
         function(err, results, fields) {
           if (err) {console.log(err.message);}
          
          res.render("statastics_res",{content:results,info:"products"})})
      }
      else {
        db.query(sql+" and b.products_type='"+req.body.products_type+"') group by a.products_id order by q desc limit 1",
         function(err, results, fields) {
           if (err) {console.log(err.message);}
          
          res.render("statastics_res",{content:results,info:"products"})})
      }
    }
    else if (req.body.company_name!=undefined) {
         db.query(sql+" and c.company_name like '%"+req.body.company_name+"%') group by a.products_id order by q desc limit 1",
         function(err, results, fields) {
           if (err) {console.log(err.message);}
          
          res.render("statastics_res",{content:results,info:"products"})})
      }
    else {
      db.query(sql+")",
        function(err, results, fields) {
        if (err) {console.log(err.message);}
         res.render("search_products",{content:results,info:"products"})})
    }
  
})




//SEARCH POST

app.route("/search/byNameComposition").get(function(req,res){
 
  res.render("search",{info:"byNameComposition"})
}).post(function(req,res){
  
    if (req.body.products_name!=undefined) {
      if (req.body.products_composition!=undefined) {
        db.query("select * from products where(products_name like '%"+req.body.products_name+"%' and products_composition like '%"+req.body.products_composition+"%')",
        function(err, results, fields) {
        if (err) {console.log(err.message);}
         res.render("search_products",{products:results})})
      }
      
    }
})


app.route("/search/byNameUse").get(function(req,res){

  res.render("search",{info:"byNameUse"})
}).post(function(req,res){
  
    if (req.body.products_name!=undefined) {
      if (req.body.products_use!=undefined) {
        db.query("select * from products where(products_name like '%"+req.body.products_name+"%' and products_use like '%"+req.body.products_use+"%')",
        function(err, results, fields) {
        if (err) {console.log(err.message);}
         res.render("search_products",{products:results})})
      }
      
    }
})


app.route("/search/byNameWeight").get(function(req,res){
   
  res.render("search",{info:"byNameWeight"})
}).post(function(req,res){
  
    if (req.body.products_name!=undefined) {
      if (req.body.products_weight!=undefined) {
        db.query("select * from products where(products_name like '%"+req.body.products_name+"%' and products_weight like '%"+req.body.products_weight+"%')",
        function(err, results, fields) {
        if (err) {console.log(err.message);}
         res.render("search_products",{products:results})})
      }
      
    }
})


app.route("/search/byAyurName").get(function(req,res){
 
  res.render("search",{info:"byAyurName"})
}).post(function(req,res){
      if (req.body.products_name!=undefined) {
        db.query("select * from products where(products_ayur='yes' and products_name like '%"+req.body.products_name+"%')",
        function(err, results, fields) {
        if (err) {console.log(err.message);}
         res.render("search_products",{products:results})})
      }
})

app.route("/search/byAyurUse").get(function(req,res){
  res.render("search",{info:"byAyurUse"})
  
}).post(function(req,res){
      if (req.body.products_use!=undefined) {
        db.query("select * from products where(products_ayur='yes' and products_use like '%"+req.body.products_use+"%')",
        function(err, results, fields) {
        if (err) {console.log(err.message);}
         res.render("search_products",{products:results})})
      }
})


app.route("/search/byAyurComposition").get(function(req,res){
   
  res.render("search",{info:"byAyurComposition"})
}).post(function(req,res){
      if (req.body.products_composition!=undefined) {
        db.query("select * from products where(products_ayur='yes' and products_composition like '%"+req.body.products_composition+"%')",
        function(err, results, fields) {
        if (err) {console.log(err.message);}
         res.render("search_products",{products:results})})
      }
})


app.route("/search/byUseState").get(function(req,res){

  res.render("search",{info:"byUseState"})
}).post(function(req,res){
      if (req.body.products_state!=undefined && req.body.products_use!=undefined) {
        db.query("select * from products where(products_use like '%"+req.body.products_use+"%' and products_state='"+req.body.products_state+"')",
        function(err, results, fields) {
        if (err) {console.log(err.message);}
         res.render("search_products",{products:results})})
      }
})



//GET STOCKS

app.get("/stocks_medicine",function(req,res){
  db.query('select products_id,products_name,products_use from products where(products_type="medicine" and products_use like "%fever%")',function(err,rs){
  if(err){console.log(err.message)}
    db.query('select products_id,products_name,products_use from products where(products_type="medicine" and products_use like "%cold%")',function(err,cough){
    if(err){console.log(err.message)}
      db.query('select products_id,products_name,products_use from products where(products_type="medicine" and products_use like "%syringe%")',function(err,syringe){
      if(err){console.log(err.message)}
        db.query('select products_id,products_name,products_use from products where(products_type="medicine" and products_use like "%injection%")',function(err,injections){
        if(err){console.log(err.message)}
          db.query('select products_id,products_name,products_use from products where(products_type="medicine" and products_use like "%first aid%")',function(err,first_aid){
          if(err){console.log(err.message)}
            db.query('select products_id,products_name,products_use from products where(products_type="medicine" and products_use like "%pain relief%")',function(err,pain_relief){
            if(err){console.log(err.message)}
              
    
             res.render("stocks_medicine",{stocks:rs,cough:cough,syringe:syringe,injections:injections,first_aid:first_aid,pain_relief:pain_relief})
            })
          })
        })
     })
    })
    
  })
  
})

app.get("/stocks_cosmetics",function(req,res){
  db.query('select products_id,products_name,products_use from products where(products_type="cosmetics" and products_use like "%face wash%")',function(err,faceWash){
  if(err){console.log(err.message)}
    db.query('select products_id,products_name,products_use from products where(products_type="cosmetics" and products_use like "%face cream%")',function(err,faceCream){
    if(err){console.log(err.message)}
      db.query('select products_id,products_name,products_use from products where(products_type="cosmetics" and products_use like "%body wash%")',function(err,bodyWash){
      if(err){console.log(err.message)}
        db.query('select products_id,products_name,products_use from products where(products_type="cosmetics" and products_use like "%lotion%")',function(err,lotion){
        if(err){console.log(err.message)}
          db.query('select products_id,products_name,products_use from products where(products_type="cosmetics" and products_use like "%oil%")',function(err,oil){
          if(err){console.log(err.message)}
            db.query('select products_id,products_name,products_use from products where(products_type="cosmetics" and products_use like "%soap%")',function(err,soap){
            if(err){console.log(err.message)}
              db.query('select products_id,products_name,products_use from products where(products_type="cosmetics" and products_use like "%sampoo%")',function(err,shampoo){
              if(err){console.log(err.message)}
    
                res.render("stocks_cosmetics",{faceWash:faceWash,faceCream:faceCream,bodyWash:bodyWash,lotion:lotion,oil:oil,soap:soap,shampoo:shampoo})
              })
            })
          })
        })
     })
    })
    
  })
  
})


app.get("/stocks_healthcare",function(req,res){
  db.query('select products_id,products_name,products_use from products where(products_type="healthcare" )',function(err,healthcare){
  if(err){console.log(err.message)}
    db.query('select products_id,products_name,products_use from products where( products_use like "%baby%")',function(err,babyCare){
    if(err){console.log(err.message)}
      res.render("stocks_healthcare",{babyCare:babyCare,healthcare:healthcare})
            
    })
    
  })
  
})


app.listen(3000,function(req,res){
	console.log("running")
})
