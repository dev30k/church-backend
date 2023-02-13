const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const Mpesa = require("mpesa-api").Mpesa;

dotenv.config();

const credentials = {
    clientKey: process.env.SECRET_KEY,
    clientSecret: process.env.CLIENT_SECRET,
    securityCredential: process.env.SEC_CRED,
    certificatePath: null
};
const environment = "sandbox";
const mpesa = new Mpesa(credentials,environment);



const router = express.Router();


var imgconfig = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,"/home/lemurian/public_html/src/images/");
    },
    
    filename:(req,file,callback)=>{
        callback(null,`image-${Date.now()}.${file.originalname}`)
    }
});


// img filter
const isImage = (req,file,callback)=>{
    if(file.mimetype.startsWith("image")){
        callback(null,true)
    }else{
        callback(null,Error("only image is allowed"))
    }
}

var upload = multer({
    storage:imgconfig,
    fileFilter:isImage
})
const TABLE_SERMONS = 'sermons';
const TABLE_EVENTS = 'events';
const TABLE_ADMINS = 'ADMINS';
const TABLE_LIVE = "livestreams";
const TABLE_DONATIONS = "donations";

const connection = mysql.createConnection({
    host: "localhost",
    user: "lemurian_hearts_admin",
    password: "svvJHUjH2Z289xN",
    database:"lemurian_hearts_church_sys",

});

// Connecting to the database

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected to DATABASE ');
});

router.post('/mpesa', async (req, res) => {
     const {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata
        }   = req.body.Body.stkCallback
        
     const meta = Object.values(await CallbackMetadata.Item)
        const PhoneNumber = meta.find(o => o.Name === 'PhoneNumber').Value.toString()
        const Amount = meta.find(o => o.Name === 'Amount').Value.toString()
        const MpesaReceiptNumber = meta.find(o => o.Name === 'MpesaReceiptNumber').Value.toString()
        const TransactionDate = meta.find(o => o.Name === 'TransactionDate').Value.toString()
    res.send(meta);


  

  // insert data into the database
  const sql = `INSERT INTO mpesa_transactions (transaction_id, amount, status)
               VALUES (?, ?, ?)`;

//   await connection.query(sql, [phoneNumber, Amount,MpesaReceiptNumber], (err, rows) => {
//     if(err){
//       console.log(err);
//       res.send(err);
//     } else {
//       res.send(rows);
//     }
//   });
});

router.post('/sermon/add',upload.single("sermonImage"),async (req,res)=>{
    const {filename} = req.file;


    const sql = 'insert into '+ TABLE_SERMONS+ '(title, speaker,sermon_link,sermon_date,sermon_time,sermonImage) values(?,?,?,?,?,?)';
    await connection.query(sql,[req.body.title,req.body.speaker,req.body.sermon_link,req.body.sermon_date,req.body.sermon_time,filename],(err,rows) =>{
        if(err){
            console.log(err);
            res.send(err);
            
        }else{
           
            res.send(rows)
        }

    })

});
router.post('/events/add/',upload.single("eventImage"),async (req,res)=>{
    const {filename} = req.file;

    const sql = 'insert into '+ TABLE_EVENTS+ '(eventTitle,location,start_time,event_date,registration,eventImage) values(?,?,?,?,?,?)';
    await connection.query(sql,[req.body.eventTitle,req.body.location,req.body.start_time,req.body.event_date,req.body.registration,filename],(err,rows) =>{
        if(err){
            console.log(err);
            res.send(err);
        }else{
            res.json(rows);
        }

    })

});
router.post('/login',async(req,res) =>{
    const sql  = 'select * from '+ TABLE_ADMINS+' WHERE username=? ';
    await connection.query(sql,[req.body.username,req.body.password],(err,rows)=>{
        if(err){
            res.json(err);
        }else{
            console.log(rows);
            if(rows.length > 0){
                bcrypt.compare(req.body.password, rows[0].password, (error, response)=>{
                    let tokens = rows[0].username
                    let key = 1
                    if(error){
                        res.send(error)
                    }
                    if(response){  
                           const token = jwt.sign(
                            {  user_id:key,tokens },
                            "1212WEWWE32321212+{}{@!@!21323POEOR//|d[]}",
                            {
                              expiresIn: "2h",
                            }
                          );
                    
                          // save user token
                          rows.token = token;
                       
                        res.json(token)
                        
                    }else{
                        res.send({message:"Wrong credentials combination "})
                    }
                })
            }else{
                res.send({message:"Incorrect Username/Password"})
            };
        }



    })
});

router.post('/live/add',async (req,res)=>{


    const sql = 'insert into '+ TABLE_LIVE + '(live_link,live_duration) values(?,?)';
    await connection.query(sql,[req.body.live_link,req.body.live_duration],(err,rows) =>{
        if(err){
            console.log(err);
            res.send(err);
            
        }else{
           
            res.send(rows)
        }

    })

});
router.post('/mpesa/donations',async (req,res)=>{
    console.log(req.body);


    const sql = 'insert into '+ TABLE_DONATIONS + '(live_link,live_duration) values(?,?)';
   

});

router.post('/mpesa/donate',async(req,res)=>{
    let accountNo = "333570#"
   mpesa
  .lipaNaMpesaOnline({
    BusinessShortCode: 174379, // Lipa Na Mpesa Online Shortcode on test credentials page
    Amount: req.body.amount /* 1000 is an example amount */,
    PartyA:  req.body.phoneNumber, // use your real phone number
    PartyB: 174379, // LiAccount Referencepa Na Mpesa Online Shortcode on test credentials page
    PhoneNumber:  req.body.phoneNumber, // use your real phone number
    CallBackURL:
      "https://churchbackend.lemurianfunk.buzz/church_sys/api/v1/mpesa", // this is where the api sends a callback. It must a hosted endpoint with public access.
    AccountReference: accountNo.concat(req.body.name) , // This is what the customer would have put as account number if they used normal mpesa
    passKey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919', // Lipa na mpesa passkey in test credentials page
    TransactionType: "CustomerPayBillOnline" /* OPTIONAL */,
    TransactionDesc: "Sending Money" /* OPTIONAL */,
  })
  .then((response) => {
    // res.send(response);
    
  })
  .catch((error) => {
  
    res.send(error)
  });
  

});

router.put("/sermons/edit/:id",upload.single("sermonImage"),async (req,res) =>{
    const {filename} = req.file;

    const sql = 'update ' +TABLE_SERMONS+ ' set ? where ID = ?';
    await connection.query(sql,[{title:req.body.title,speaker:req.body.speaker,sermon_link:req.body.sermon_link,sermon_date:req.body.sermon_date,sermonImage:filename},req.params.id],(err,rows) =>{
        if(err){
            console.log(err);
            res.send(err);
        }else{
            res.send(rows);  
        }

    })



});
router.put("/events/edit/:id",upload.single("eventImage"),async (req,res) =>{
    
    const {filename} = req.file;

    const sql = 'update ' +TABLE_EVENTS+ ' set ? where ID = ?';
    await connection.query(sql,[{location:req.body.location,start_time:req.body.start_time,event_date:req.body.event_date,registration:req.body.registration,eventTitle:req.body.eventTitle,eventImage:filename},req.params.id],(err,rows) =>{
        if(err){
            res.send(err);
        }else{
            res.send(rows);
        }

    })



});



router.get('/sermons/:id',async (req,res)=>{

    const sql = 'select * from '+ TABLE_SERMONS+' where ID = '+req.params.id;
    await connection.query(sql,(err,rows) =>{
        if(err){
            console.log(err);
            res.send(err);
        }else{
            res.send(rows);
        }

    })

});

router.get('/events/:id',async (req,res)=>{

    const sql = 'select * from '+ TABLE_EVENTS+' where ID = '+req.params.id;
    await connection.query(sql,(err,rows) =>{
        if(err){
            console.log(err);
            res.send(err);
        }else{
            res.send(rows);
        }

    })

});

router.get('/sermons',async (req,res)=>{

    const sql = 'select * from '+ TABLE_SERMONS;
    await connection.query(sql,(err,rows) =>{
        if(err){
            console.log(err);
            res.send(err);
        }else{
            res.send(rows);
        }

    })

});
router.get('/mpesaresponse', (req, res) => {
    console.log(req.body);
    res.send(req);
    console.log('Request received.');
    res.send('Request received.');
});

router.get('/livestreams',async (req,res)=>{

    const sql = 'select * from '+ TABLE_LIVE;
    await connection.query(sql,(err,rows) =>{
        if(err){
            console.log(err);
            res.send(err);
        }else{
            res.send(rows);
        }

    })

});
router.get('/events',async (req,res)=>{

    const sql = 'select * from '+ TABLE_EVENTS;
    await connection.query(sql,(err,rows) =>{
        if(err){
            console.log(err);
            res.json(err);
        }else{
            res.json(rows);
        }

    })

});


router.delete('/sermons/:id',async (req,res)=>{
    const sql = 'delete from '+TABLE_SERMONS+' where ID = '+req.params.id;
    console.log(sql)
    await connection.query(sql, (err, rows) => {
        console.log('Connection result error: ' + err);
        console.log('no of records is ' + rows.length);
        res.send("Record deleted");
    });
    }
)
router.delete('/events/:id',async (req,res)=>{
    const sql = 'delete from '+TABLE_EVENTS+' where ID = '+req.params.id;
    console.log(sql)
    await connection.query(sql, (err, rows) => {
        console.log('Connection result error: ' + err);
        console.log('no of records is ' + rows.length);
        res.send("Record deleted");
    });
    }
)
exports.router = router;
