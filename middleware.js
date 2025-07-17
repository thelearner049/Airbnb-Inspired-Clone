const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, resp, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Please login in to create listing!");
    return resp.redirect("/login");
  }

  next();
};

module.exports.saveRedirectUrl = (req, resp, next) => {
  if (req.session.redirectUrl) {
    resp.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, resp, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    // extra

    req.flash("error", "Listing not found");
    return resp.redirect("/listings");
  }

  if (!listing.owner.equals(resp.locals.crntUser._id)) {
    req.flash("error", "You don't have permission to edit");
    return resp.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, resp, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(resp.locals.crntUser._id)) {
    req.flash("error", "You are not the author of this review");
    return resp.redirect(`/listings/${id}`);
  }
};

//Server side validation Handling (through Middleware)
module.exports.validateListing = (req, resp, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Server side validation Handling (through Middleware)
module.exports.validateReview = (req, resp, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
