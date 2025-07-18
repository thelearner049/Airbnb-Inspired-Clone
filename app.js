if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
console.log(process.env);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

// Authentication Setup
const passport = require("passport"); //[pbkfd2 hashing algo]
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");
// const Listing = require("./models/listing.js");

//routes
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then(() => {
    console.log("connnectted to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl); //"mongodb://127.0.0.1:27017/Airbnb"
}

app.listen(8080, () => {
  console.log("Servver is live");
});

// Setting up session store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // after how much time session should update
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

// 1. Setting up Session middleware
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // to prevent from cross scripting attack
  },
};

app.use(session(sessionOptions));

// 2. Flash middleware
app.use(flash());

// Passport config. stategy  1. require , 2.intialize, 3.passport.session()

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //Generates a function that is used in Passport's LocalStrategy
// for passport session support
passport.serializeUser(User.serializeUser()); //to serialize users into the session
passport.deserializeUser(User.deserializeUser()); //to deserialize users from the session

// 3. putting flash in res.locals that will transfer/render message to ejs (view)
app.use((req, resp, next) => {
  resp.locals.success = req.flash("success");
  resp.locals.error = req.flash("error");
  resp.locals.crntUser = req.user; // stores the info. of user with active session
  next();
});

// app.get("/", (req, resp) => {
//   resp.send("Root is working");
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.use((err, req, resp, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  resp.status(status).send(message);
});
