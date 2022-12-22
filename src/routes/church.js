import express from 'express';
import mysql from 'mysql'
import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config()


const router = express.Router();


var imgconfig = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,"./uploads");
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
        callback(null,Error("only image is allowd"))
    }
}

var upload = multer({
    storage:imgconfig,
    fileFilter:isImage
})
const TABLE_SERMONS = 'sermons';
const TABLE_EVENTS = 'events';
const TABLE_ADMINS = 'ADMINS';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lemuria123',
    database: 'church_sys',
    port: "3306"

});

// Connecting to the database

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected to DATABASE ');
});

router.post('/sermon/add',upload.single("sermonImage"),async (req,res)=>{
    const {filename} = req.file;


    const sql = 'insert into '+ TABLE_SERMONS+ '(title, speaker,sermon_link,sermon_date,sermon_time,sermonImage) values(?,?,?,?,?,?)';
    await connection.query(sql,[req.body.title,req.body.speaker,req.body.sermon_link,req.body.sermon_date,req.body.sermon_time,filename],(err,rows) =>{
        if(err){
            console.log(err);
            res.json(err);
            
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
            res.json(err);
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
                            process.env.TOKEN_KEY,
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
                res.send({message:"Incorrect Username"})
            };
        }



    })
})

router.put("/sermons/edit/:id",async (req,res) =>{
    const sql = 'update ' +TABLE_SERMONS+ ' set ? where ID = ?';
    await connection.query(sql,[{title:req.body.title,speaker:req.body.speaker,sermon_link:req.body.sermon_link,sermon_date:req.body.sermon_date},req.params.id],(err,rows) =>{
        if(err){
            console.log(err);
            res.send(err);
        }else{
            res.send(rows);  
        }

    })



});
router.put("/events/edit/:id",async (req,res) =>{
    const sql = 'update ' +TABLE_EVENTS+ ' set ? where ID = ?';
    await connection.query(sql,[{location:req.body.location,start_time:req.body.start_time,event_date:req.body.event_date,registration:req.body.registration,eventTitle:req.body.eventTitle},req.params.id],(err,rows) =>{
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
export default  router;