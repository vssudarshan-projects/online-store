const hash = require("./hash.js");
const id = require("nanoid");
const db = require("./db.js");
const heap = require("./heap.js");
const session = new Map();
const sessionHeap = new heap.MinHeap();

exports.removeInactive = function () {
  console.log(
    "Start cleaning session store.\n Total sessions before cleaning: " +
      session.size +
      "\nHeap size: " +
      sessionHeap.size()
  );
  while (
    sessionHeap.getMin().sessionData.timeStamp + 60 * 60 * 1000 <
    Date.now()
  ) {
    session.delete(sessionHeap.pop().sessionData.id);
  }
  console.log(
    "Total sessions after cleaning: " +
      session.size +
      "\nHeap size: " +
      sessionHeap.size()
  );
};

exports.addSession = function (id, sessionData) {
  delete sessionData.user.pwd;
  sessionHeap.push(sessionData);
  session.set(id, sessionData);
  console.log(
    "Start session: " +
      sessionData.user.email +
      "\nTotal Sessions: " +
      session.size +
      "\nHeap size: " +
      sessionHeap.size()
  );
};

exports.isSession = function (cookies) {
  for (cookie of cookies) {
    let cookiePair = cookie.split("=");
    if (cookiePair[0].trim() === "session") {
      return session.get(cookiePair[1].trim());
    }
  }
  return null;
};

exports.deleteSession = async function (cookies) {
  for (cookie of cookies) {
    let cookiePair = cookie.split("=");
    if (cookiePair[0].trim() === "session") {
      let sessionData = session.get(cookiePair[1].trim());
      let email = sessionData.user.email;
      let sessionIndex = sessionData.index;
      console.log(
        "End Session: " +
          email +
          " Status: " +
          session.delete(cookiePair[1].trim()) +
          " " +
          sessionHeap.remove(sessionIndex) +
          "\nTotal Sessions: " +
          session.size +
          "\nHeap size: " +
          sessionHeap.size()
      );
    } else if (cookiePair[0].trim().length === 21)
      await db.deleteSession(cookiePair[0].trim());
  }
};

exports.authCookie = async function (cookies) {
  let data;
  let cookiePair;
  await db.connect();

  for (cookie of cookies) {
    cookiePair = cookie.split("=");
    //nanoid key length
    if (cookiePair[0].trim().length === 21) {
      return await db.sessionLookUp(cookiePair[0].trim()).then(async (data) => {
        if (data && data !== -1) {
          return await hash
            .encode(data.user._id, cookiePair[1].trim())
            .then((hashedKey) => {
              if (Buffer.compare(hashedKey, data.key.buffer) === 0) {
                console.log("Authenticated user: " + data.user.email);
                return { user: data.user, lookUp: data.lookUp };
              } else return false;
            });
        } else return null;
      });
    }
  }
};

exports.authPwd = async function (user, pwd) {
  return await hash.encode(user._id, pwd).then((hashedKey) => {
    if (Buffer.compare(hashedKey, user.pwd.buffer) === 0) return true;
    else return false;
  });
};

exports.createId = () => {
  return id.nanoid();
};

exports.createToken = async function (user, oldLookUp) {
  let lookUp;
  if (oldLookUp) lookUp = oldLookUp;
  else lookUp = id.nanoid();
  let key = id.nanoid();
  return await hash.encode(user._id, key).then((hashedKey) => {
    return { lookUp: lookUp, key: key, hashedKey: hashedKey };
  });
};
