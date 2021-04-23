const hash = require("./hash.js");
const nanoId = require("nanoid");
const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://" +
  process.env.mongoUser +
  ":" +
  process.env.mongoKey +
  process.env.mongoCluster +
  process.env.mongoDB +
  "?retryWrites=true&writeConcern=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function findUserWithId(userId) {
  console.log("*****Find with userId******");
  try {
    console.log("Connecting to " + process.env.mongoDB);
    let db = client.db(process.env.mongoDB);
    console.log("Find userId Accessing " + process.env.mongoUserCol + " collection");
    let users = db.collection(process.env.mongoUserCol);

    console.log("Find userId Trying to find user with id: " + userId);

    return await users
      .findOne({
        _id: userId,
      })
      .then((entry) => {
        console.log("Found: ");
        console.log(entry);
        return entry;
      });
  } catch (err) {
    console.log(err);
    await client.close();
    console.log("Connection CLOSED");
  }
}

async function findUser(email) {
  console.log("*****Find user******");
  try {
    console.log("Connecting to " + process.env.mongoDB);
    let db = client.db(process.env.mongoDB);
    console.log("Find user Accessing " + process.env.mongoUserCol + " collection");
    let users = db.collection(process.env.mongoUserCol);

    console.log("Find user  Trying to find user with email: " + email);

    return await users
      .findOne({
        email: email,
      })
      .then((entry) => {
        console.log("Found: ");
        console.log(entry);
        return entry;
      });
  } catch (err) {
    console.log(err);
    await client.close();
    console.log("Connection CLOSED");
  }
}

async function addUser(email, pwd) {
  console.log("*****Add user*****");
  try {
    console.log("Connecting to " + process.env.mongoDB);

    let db = client.db(process.env.mongoDB);

    console.log("Add user Accessing " + process.env.mongoUserCol + " collection");
    let users = db.collection(process.env.mongoUserCol);

    console.log("Add user Trying to add user with email: " + email);
    let id = nanoId.nanoid();
    return await hash.encode(id, pwd).then(async (hashedPwd) => {
      return await users
        .insertOne({
          _id: id,
          email: email,
          pwd: hashedPwd,
        })
        .then((result) => {
          console.log(
            `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`
          );
          return result;
        });
    });
  } catch (err) {
    console.log(err);
    await client.close();
    console.log("Connection CLOSED");
  }
}

async function addUserAddr(email, addr) {
  console.log("*****Add Address*****");
  try {
    console.log("Connecting to " + process.env.mongoDB);

    let db = client.db(process.env.mongoDB);

    console.log("Add addr Accessing " + process.env.mongoUserCol + " collection");
    let users = db.collection(process.env.mongoUserCol);

    console.log("Add addr Trying to add addr for user: " + email);
    return await users
      .updateOne(
        {
          email: email,
        },
        {
          $set: {
            addr: addr,
          },
        }
      )
      .then((result) => {
        console.log(
          `${result.modifiedCount} documents were modified.`
        );
        return result;
      });
  } catch (err) {
    console.log(err);
    await client.close();
    console.log("Connection CLOSED");
  }
}

async function persistSession(userId, persistenceData) {
  console.log("*****Persist Session*****");
  try {
    console.log("Connecting to " + process.env.mongoDB);

    let db = client.db(process.env.mongoDB);

    console.log("Persist Session Accessing " + process.env.mongoSessionCol + " collection");
    let sessions = db.collection(process.env.mongoSessionCol);

    console.log("Persist Session Trying to add session for user id: " + userId);
    return await sessions
      .updateOne(
        {lookUp: persistenceData.lookUp},
        {
          $set: {
            key: persistenceData.hashedKey,
            userId: userId,
            timeStamp: Date.now(),
          },
        },
        {
          upsert: true,
        }
      )
      .then((result) => {
        if(result.modifiedCount !== 0)
        console.log(
          `${result.modifiedCount} documents were modified for user _id: ${userId}`
        );
        if(result.upsertedCount !== 0)
        console.log(
          `${result.upsertedCount} documents were upserted with the _id: ${result.upsertedId._id}`
        );
        return result;
      });
  } catch (err) {
    console.log(err);
    await client.close();
    console.log("Connection CLOSED");
  }
}

async function findSession(lookUp) {
  console.log("*****Find Session*****");
  try {
    console.log("Connecting to " + process.env.mongoDB);

    let db = client.db(process.env.mongoDB);

    console.log("Find Session Accessing " + process.env.mongoSessionCol + " collection");
    let sessions = db.collection(process.env.mongoSessionCol);

    console.log("Find Session Trying to find session with lookUp: " + lookUp);
    return await sessions
      .findOne({
        lookUp: lookUp,
      })
      .then((entry) => {
        console.log("Found: ");
        console.log(entry);
        return entry;
      });
  } catch (err) {
    console.log(err);
    await client.close();
    console.log("Connection CLOSED");
  }
}

async function deleteSession(lookUp) {
  console.log("*****Delete Session*****");
  try {
    console.log("Connecting to " + process.env.mongoDB);

    let db = client.db(process.env.mongoDB);

    console.log("Delete Session Accessing " + process.env.mongoSessionCol + " collection");
    let sessions = db.collection(process.env.mongoSessionCol);

    console.log("Delete Session Trying to delete sessions with look up: " + lookUp);
        return await sessions
          .deleteOne({
            lookUp: lookUp,
          })
          .then((result) => {
            console.log(
              `${result.deletedCount} documents were deleted with look up: ${lookUp}`
            );
            return result;
          });
  } catch (err) {
    console.log(err);
    await client.close();
    console.log("Connection CLOSED");
  }
}

exports.findUser = async function (email) {
  return await findUser(email)
    .then((user) => {
      //not required just for understanding async functions
      return user;
    })
    .catch((obj) => {
      console.dir(obj);
      return -1;
    });
};

exports.addUser = async function (email, pwd) {
  return await findUser(email)
    .then(async function (user) {
      if (!user) {
        return await addUser(email, pwd).catch((obj) => {
          console.dir(obj);
          return -1;
        });
      } else {
        return null;
      }
    })
    .then((result) => {
      return result;
    })
    .catch((obj) => {
      console.dir(obj);
      return -1;
    });
};

exports.addUserAddr = async function (email, addr) {
  return await findUser(email)
    .then(async function (user) {
      if (user) {
        return await addUserAddr(email, addr).catch((obj) => {
          console.dir(obj);
          return -1;
        });
      } else {
        return null;
      }
    })
    .then((result) => {
      return result;
    })
    .catch((obj) => {
      console.dir(obj);
      return -1;
    });
};

exports.persistSession = async function (userId, persistenceData) {
  return await persistSession(userId, persistenceData).catch((obj) => {
    console.dir(obj);
    return -1;
  });
};

exports.sessionLookUp = async function (lookUp) {
  return await findSession(lookUp)
    .then(async function (persistenceData) {
      if (
        persistenceData &&
        persistenceData.timeStamp + 30 * 24 * 60 * 60 * 1000 > Date.now()
      ) {
        return await findUserWithId(persistenceData.userId)
          .then((user) => {
            return {
              user: user,
              lookUp: persistenceData.lookUp,
              key: persistenceData.key
            };
          })
          .catch((obj) => {
            console.dir(obj);
            return -1;
          });
      } else return null;
    })
    .catch((obj) => {
      console.dir(obj);
      return -1;
    });
};

exports.deleteSession = async function (lookUp) {
  return await deleteSession(lookUp).catch((obj)=>{
    console.log(obj);
    return -1;
  });
};

exports.connect = async function () {
  try {
    if (!client.isConnected()) {
      console.log("Connecting to mongoAtlas");
      await client.connect();
    }
  } catch (err) {
    console.log(err);
    await client.close();
    console.log("Connection CLOSED");
  }
};

exports.close = async function () {
  await client.close();
  console.log("Connection CLOSED");
};
