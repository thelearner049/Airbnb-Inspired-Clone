const User = require("../models/user");

module.exports.renderSignupForm = (req, resp) => {
  resp.render("users/signup.ejs");
};

module.exports.signup = async (req, resp) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const regUser = await User.register(newUser, password);
    console.log(regUser);
    req.login(regUser, (err) => {
      if (err) {
        next(err);
      }
      req.flash("success", "Welcome to Airbnb");
      resp.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    resp.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, resp) => {
  resp.render("users/login.ejs");
};

module.exports.login = async (req, resp) => {
  req.flash("success", "Welcome back to Airbnb!");
  const redirectUrl = resp.locals.redirectUrl || "/listings";
  resp.redirect(redirectUrl);
};

module.exports.logout = (req, resp) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out.");
    resp.redirect("/listings");
  });
};
