const http = require("http");
const fs = require("fs");
const port = 8880;
const url = require("url");
const db = require("./db.json");
console.log(db)
const server = http.createServer((req, res) => {
	if(req.method === 'GET' && req.url === '/api/users'){
		fs.readFile('db.json',(err, db) => {
			if(err){
				throw err;
			}
			const data = JSON.parse(db);
			res.writeHead(200, {"Content-Type":"application/json"});
			res.write(JSON.stringify(data.users));
			res.end();
			console.log(data.users);
			
		})
	}else if(req.method === 'GET' && req.url === '/api/books'){
		fs.readFile('db.json',(err, db) => {
			if(err){
				throw err;
			}
			const data = JSON.parse(db);
			res.writeHead(200, {"Content-Type":"application/json"});
			res.write(JSON.stringify(data.books));
			res.end();
			console.log(data.users);
			
		})
	}else if(req.method === "DELETE" && req.url.startsWith("/api/books")){
		const parsedUrl = url.parse(req.url, true);
		const bookID = Number(parsedUrl.query.id);
		const newBooks = db.books.filter(book => book.id !== bookID);
		const newDB = {...db, books: newBooks};
		if(newBooks.length === db.books.length){
			res.writeHead(401, {"Content-Type":"application/json"});
			
			res.write(JSON.stringify({"message":"book not found!"}));
			res.end();
		}else{
			
		fs.writeFile('db.json', JSON.stringify(newDB, null, 2), (err) =>{
			if(err){
				throw err;
			}
			
			res.writeHead(200, {"Content-Type":"application/json"});
			
			res.write(JSON.stringify({"message":"book deleted success!"}));
			res.end(JSON.stringify(newDB));
			
		});
			
		}
	}else if(req.method === "POST" && req.url === "/api/books"){
		let book = "";
		
		req.on("data" , (data)=>{
			book =book +  data.toString(); 
		})
		
		req.on('end', () => {
			console.log(JSON.parse(book));
			const newBook = {id : crypto.randomUUID(), ...JSON.parse(book), free: 1}
			db.books.push(newBook);
			fs.writeFile("db.json", JSON.stringify(db, null, 2), (err)=>{
				if(err){
					
				}
			});
			console.log(newBook);
			res.end("New Book Added");
		});
	}else if(req.method === "PUT" && req.url.startsWith("/api/books")){
		const parsedUrl = url.parse(req.url, true);
		const bookID = parsedUrl.query.id;
		let bookNewInfo = "";
		req.on("data", (data) =>{
			bookNewInfo = bookNewInfo + data.toString();
		})
		
		req.on("end" , ()=>{
			const reqBody = JSON.parse(bookNewInfo);
			
			db.books.forEach((book) => {
				if(book.id === Number(bookID)){
					book.title = reqBody.title
					book.author = reqBody.author
					book.price = reqBody.price
				}
			});
			fs.writeFile("db.json", JSON.stringify(db, null, 2) , (err) =>{
				if(err){
					throw err;
				}
				
				res.writeHead(200, {'Content-Type':'application/json'});
				res.write(JSON.stringify({"message": "book info change!"}));
				res.end();
			})
		})
		
	}else if(req.method === "POST" && req.url === "/api/users"){
		let user = "";
		req.on("data", (data)=>{
			user += data.toString();
		})
		
		req.on("end", ()=>{
			const {name, username, email} =JSON.parse(user);
			
			
			if(name ==="" || username===""||email===""){
				res.writeHead(200,{"Content-Type":"application/json"})
				res.write(JSON.stringify({message:"User data is not ok"}))
				res.end()
			}else{
				const newUser = {
				id: crypto.randomUUID(),
				name,
				username,
				email,
				crime: 0
				};
				db.users.push(newUser);
				fs.writeFile('./db.json', JSON.stringify(db, null ,2), (err) =>{
					if(err){
						throw err;
					}
					
					res.writeHead(200,{"Content-Type":"application/json"})
					res.write(JSON.stringify({messae:"Book Updated Successfuly"}));
					res.end();
				})
			}
			
		})
		
	}else if(req.method === "PUT" && req.url.startsWith("/api/users")){
		const parsedUrl = url.parse(req.url, true);
		const userID = parsedUrl.query.id;
		let reqBody= "";
		req.on("data" , (data)=>{
			reqBody += data.toString();
		})
		
		req.on("end",() =>{
			const {crime}=JSON.parse(reqBody);
			
			db.users.forEach((user)=>{
				if(user.id === Number(userID)){
					user.crime = crime;
				}
			});
			fs.writeFile("db.json", JSON.stringify(db,null,2), (err)=>{
				if(err){
					throw err;
				}
				
				res.writeHead(200, {"Content-Type":"application/json"});
				res.write("Done!");
				
				res.end();
				
			})
		});
		
	}
});

server.listen(port , () => {
	console.log(`Server Running On Port: ${port}`)
})

//fetch('http://localhost:8880/api/users').then(res => res.json()).then(data => console.log(data)).catch(err => console.error(err))
