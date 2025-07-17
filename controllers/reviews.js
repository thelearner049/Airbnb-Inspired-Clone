const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.postReview = async (req, resp) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  // console.log(newReview);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash("success", "Review Posted!");
  resp.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, resp) => {
  console.log("Delete review called", req.params);
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");
  resp.redirect(`/listings/${id}`);
};
