let http = require("http");
let fs = require("fs");
let qs = require("querystring");
let server = http.createServer(handleRequest);
let url = require("url");

function handleRequest(req, res) {
  let store = "";
  let parsedUrl = url.parse(req.url, true);
  req.on("data", chunk => {
    store += chunk;
  });

  req.on("end", () => {
    if (req.method === "GET" && req.url === "/") {
      fs.createReadStream("./index.html").pipe(res);
    } else if (req.method === "GET" && req.url === "/about") {
      fs.createReadStream("./about.html").pipe(res);
    } else if (req.method === 'GET' && req.url.split('.').pop() === 'css'){
      res.setHeader('Content-Type', 'text/css');
      fs.createReadStream(__dirname + '/assets/stylesheets/styles.css').pipe(res);
    } else if (req.method === 'GET' && req.url.split('/').pop() === '1.jpg'){
      res.setHeader('Content-Type', 'image/jpg');
      fs.createReadStream(__dirname + '/assets/images/1.jpg').pipe(res);
    } else if (req.method === 'GET' && req.url.split('/').pop() === '2.jpg'){
      res.setHeader('Content-Type', 'image/jpg');
      fs.createReadStream(__dirname + '/assets/images/2.jpg').pipe(res);
    }  else if (req.method === "GET" && req.url === "/contact") {
      fs.createReadStream("./contact.html").pipe(res);
    } else if (req.method === "POST" && req.url === "/form") {
      let parsedData = qs.parse(store);
      let username = parsedData.username;
      fs.open(
        __dirname + `/contacts/${username}` + ".json",
        "wx",
        (err, fd) => {
          if (err) {
            return res.end("username is taken try another username");
          }
          fs.writeFile(fd, JSON.stringify(parsedData), err => {
            return res.end("error writing into file");
          });
          fs.close(fd, () => {
            return res.end("contacts saved successfully");
          });
        }
      );
    } else if (req.method === "GET" && req.url === "/users") {
      let allUsersData = '';
      fs.readdir("./contacts", (err, files) => {
        if (err) {
          return console.log(err);
        }
        console.log(files.length);
        files.forEach((file, index) => {
          fs.open(`./contacts/${file}`, 'r', (err, fd) => {
            if(err){
              console.log(err);
            }
            fs.readFile(fd, (err, content) => {
              if(err){
                return console.log(err);
              }
              allUsersData += content.toString() + '<br>';
              if(index === files.length - 1){
                res.setHeader('Content-Type', 'text/html');
                res.end(allUsersData);
              }
              fs.close(fd, (err) => {
                console.log(err);
              })
            });
          })
        })
      });
    } 
    else if (req.method === "GET" && parsedUrl.pathname === "/users") {
      let username = parsedUrl.query.username;
      fs.readFile(
        __dirname + `/contacts/${username}` + ".json",
        (err, content) => {
          if (err) {
            return console.log(err);
          }
          let data = JSON.parse(content);
          res.setHeader("Content-Type", "text/html");
          res.write(`<h2>Name : ${data.name}</h2>`);
          res.write(`<h2>username : ${data.username}</h2>`);
          res.write(`<h2>email : ${data.email}</h2>`);
          res.write(`<h2>age : ${data.age}</h2>`);
          res.write(`<h2>bio : ${data.bio}</h2>`);
          res.end();
        }
      );
    }
  });
}

server.listen(5000, () => {
  console.log("server is listening on port:5000");
});