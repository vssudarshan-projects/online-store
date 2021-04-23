/*Native Node modules*/
const fs = require("fs");

/*Express modules*/
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

/*Ejs module*/
const ejs = require("ejs");

/*Environment variables*/
const PATH = __dirname;
const PUBLIC_PATH = PATH + "/public";
const PUBLIC_PAGES = PUBLIC_PATH + "/html";
const PORT = process.env.PORT || 3000;

/*Custom modules and settings*/
if (!process.env.Production) {
  try {
    let env = JSON.parse(fs.readFileSync(PATH + "/env.json"));
    process.env.mongoUser = env.mongoUser;
    process.env.mongoKey = env.mongoKey;
    process.env.mongoDB = env.mongoDB;
    process.env.mongoCluster = env.mongoCluster;
    process.env.mongoUserCol = env.mongoUserCol;
    process.env.mongoSessionCol = env.mongoSessionCol;
  } catch (err) {
    console.log("FILE: env.json");
    console.log(err);
  }
}
const db = require("./db.js");
const session = require("./session.js");


/*Express middleware settings*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(PUBLIC_PATH));

/*Application Constants*/
const products = [];
const states = new Map();

app.get("/", (req, res) => {
  if (req.headers.cookie && session.isSession(req.headers.cookie.split(";"))) {
    res.render("products", {
      title: "products",
      products: products,
    });
    return;
  } else if (req.headers.cookie) {
    session.authCookie(req.headers.cookie.split(";")).then((data) => {
      if (data) {
        session.createToken(data.user, data.lookUp).then((persistenceData) => {
          db.persistSession(data.user._id, persistenceData)
            .then((result) => {
              if (result !== -1) {
                res.cookie(persistenceData.lookUp, persistenceData.key, {
                  httpOnly: true,
                  secure: true,
                  maxAge: 30 * 24 * 60 * 60 * 1000,
                });
              }
            })
            .then(() => {
              let id = session.createId();
              res.clearCookie("login");
              session.addSession(id, {
                id: id,
                user: data.user,
                timeStamp: Date.now(),
              });
              res.cookie("session", id, { httpOnly: true, secure: true });
              res.redirect("/");
            });
        });
      } else {
        console.log("clear cookies");
        getCookieNames(req.headers.cookie.split(";")).forEach((cookie) => {
          res.clearCookie(cookie);
        });
        res.sendFile(PUBLIC_PAGES + "/login.html");
      }
    });
  } else {
    console.log("Need Authentication");
    res.sendFile(PUBLIC_PAGES + "/login.html");
  }
});

app.get("/signup", (req, res) => {
  if (req.headers.cookie && session.isSession(req.headers.cookie.split(";"))) {
    res.redirect("/");
    return;
  }
  res.sendFile(PUBLIC_PAGES + "/signup.html");
});

app.post("/signup", (req, res) => {
  if (!req.body.email || !req.body.ipwd) {
    res.sendFile(PUBLIC_PAGES + "/failure.html");
    return;
  }
  if (req.headers.cookie && session.isSession(req.headers.cookie.split(";"))) {
    res.redirect("/");
    return;
  }

  db.connect().then(() => {
    db.addUser(req.body.email, req.body.ipwd).then((result) => {
      if (!result) {
        res.cookie("signup", false, { secure: true, maxAge: 60000 });
        res.redirect("/signup");
      } else if (result === -1) res.sendFile(PUBLIC_PAGES + "/failure.html");
      else {
        res.clearCookie("signup");
        res.sendFile(PUBLIC_PAGES + "/success.html");
      }
    });
  });
});

app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.pwd) {
    res.sendFile(PUBLIC_PAGES + "/failure.html");
    return;
  }

  if (req.headers.cookie && session.isSession(req.headers.cookie.split(";"))) {
    res.redirect("/");
    return;
  }

  db.connect().then(() => {
    db.findUser(req.body.email).then((user) => {
      session.authPwd(user, req.body.pwd).then((auth) => {
        if (!user || !auth) {
          res.cookie("login", false, { secure: true, maxAge: 60000 });
          res.redirect("/");
        } else {
          console.log("Creating session ID for: " + user.email);
          let id = session.createId();
          res.clearCookie("login");
          res.cookie("session", id, { httpOnly: true, secure: true });
          session.addSession(id, {
            id: id,
            user: user,
            timeStamp: Date.now(),
          });
          if (req.body.save) {
            session.createToken(user).then((persistenceData) => {
              db.persistSession(user._id, persistenceData)
                .then((result) => {
                  if (result) {
                    res.cookie(persistenceData.lookUp, persistenceData.key, {
                      httpOnly: true,
                      secure: true,
                      maxAge: 30 * 24 * 60 * 60 * 1000,
                    });
                  }
                })
                .then(() => {
                  res.redirect("/");
                });
            });
          } else res.redirect("/");
        }
      });
    });
  });
});

app.get("/account", (req, res) => {
  let sessionData = req.headers.cookie
    ? session.isSession(req.headers.cookie.split(";"))
    : null;

  if (!sessionData) {
    res.redirect("/");
    return;
  }

  if (states.size === 0)
    try {
      JSON.parse(fs.readFileSync(PATH + "/states.json")).forEach((state) => {
        states.set(state.code, state);
      });
    } catch (err) {
      console.log(err);
    }

  res.render("account", {
    title: "account",
    states: states,
    addr: {
      addr1: sessionData.user.addr ? sessionData.user.addr.addr1 : null,
      addr2: sessionData.user.addr ? sessionData.user.addr.addr2 : null,
      city: sessionData.user.addr ? sessionData.user.addr.city : null,
      state: sessionData.user.addr ? sessionData.user.addr.state : null,
      pin: sessionData.user.addr ? sessionData.user.addr.pin : null,
    },
    addrs: null,
  });
});

app.post("/states", (req, res) => {
  let state = states.get(req.body.code);
  if (state) res.send({ sPin: state.sPin, ePin: state.ePin });
  else res.send("404");
});

app.post("/addr-update", (req, res) => {
  let sessionData = req.headers.cookie
    ? session.isSession(req.headers.cookie.split(";"))
    : null;

  if (!sessionData) {
    res.redirect("/");
    return;
  }

  sessionData.user.addr = {
    addr1: req.body.addr1,
    addr2: req.body.addr2,
    city: req.body.city,
    state: req.body.state,
    pin: req.body.pin,
  };

  db.connect().then(() => {
    db.addUserAddr(sessionData.user.email, sessionData.user.addr).then(
      (result) => {
        if (!result || result === -1)
          res.sendFile(PUBLIC_PAGES + "/failure.html");
        else {
          res.cookie("addr", true, { secure: true, maxAge: 60000 });
          res.redirect("/account");
        }
      }
    );
  });
});

app.post("/logout", (req, res) => {
  if (req.headers.cookie && session.isSession(req.headers.cookie.split(";"))) {
    session.deleteSession(req.headers.cookie.split(";")).then(() => {
      getCookieNames(req.headers.cookie.split(";")).forEach((cookie) => {
        res.clearCookie(cookie);
      });
      res.send("200");
    });
  } else res.send("200");
});

app.post("/ping", (req, res) => {
  let sessionData = req.headers.cookie
    ? session.isSession(req.headers.cookie.split(";"))
    : null;

  if (sessionData) {
    console.log("Ping " + sessionData.user.email);
    sessionData.timeStamp = Date.now();
    res.send("200");
  } else {
    res.send("406");
  }
});

app.listen(PORT, () => {
  console.log("listening at port: " + PORT);
  try {
    JSON.parse(fs.readFileSync(PATH + "/products.json")).forEach((product) => {
      products.push(product);
    });
  } catch (err) {
    console.log("FILE: products.json");
    console.log(err);
  }
});

/*delete inactive sessions from  in-memory session store every 2 hour*/
setInterval(() => {
  session.removeInactive();
}, 2 * 60 * 60 * 1000);

/*return cookie names as array*/
function getCookieNames(cookies) {
  let names = [];
  for (cookie of cookies) {
    let cookiePair = cookie.split("=");
    names.push(cookiePair[0].trim());
  }
  return names;
}
