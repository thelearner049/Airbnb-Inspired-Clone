const Listing = require("../models/listing");
const fetch = require("node-fetch");

module.exports.index = async (req, resp) => {
  allListings = await Listing.find({});
  resp.render("listings/index.ejs", { allListings });
};

module.exports.newListingForm = (req, resp) => {
  resp.render("listings/new.ejs");
};

module.exports.showListing = async (req, resp) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", " This Listing doesn't Exsist!");
    resp.redirect("/listings");
  }
  // console.log(listing);
  resp.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, resp, next) => {
  const location = req.body.listing.location; // e.g., "New Delhi, India"
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    location
  )}`;

  const response = await fetch(nominatimUrl, {
    headers: {
      "User-Agent": "YourAppName/1.0 (your@email.com)", // Nominatim requires a User-Agent
    },
  });
  const data = await response.json();

  // Get the first result's coordinates
  const lat = parseFloat(data[0]?.lat);
  const lon = parseFloat(data[0]?.lon);

  // console.log({ lat, lon });

  let url = req.file.path;
  let filename = req.file.filename;
  const { category } = req.body.listing;
  let newListing = new Listing(req.body.listing);
  const validCategories = [
    "Houses",
    "Iconic cities",
    "Beach",
    "Mountain",
    "Castles",
    "Pools",
    "Camping",
    "Arctic",
    "Farms",
    "Boats",
    "Pet Rentals",
  ];
  if (!validCategories.includes(category)) {
    throw new ExpressError("Invalid category", 400);
  }
  // console.log(req.user);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.category = category;
  // Store location as GeoJSON
  newListing.geometry = {
    type: "Point",
    coordinates: [lon, lat], // [longitude, latitude]
  };

  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created!");
  resp.redirect("/listings");
};
// module.exports.edit = async (req, resp) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);
//   if (!listing) {
//     req.flash("error", " This Listing doesn't Exsist!");
//     return resp.redirect("/listings");
//   }

//   let originalImage = listing.image.url;
//   let originalImageUrl = originalImage.replace("/upload", "/upload/w_250");
//   resp.render("listings/edit.ejs", { listing, originalImageUrl });
// };

module.exports.edit = async (req, resp) => {
  let { id } = req.params;
  console.log("Editing listing with ID:", id);

  const listing = await Listing.findById(id);
  console.log("Found listing:", listing);

  if (!listing) {
    console.log("Listing not found, redirecting");
    req.flash("error", "This Listing doesn't Exist!");
    return resp.redirect("/listings");
  }

  let originalImage = listing.image.url;
  let originalImageUrl = originalImage.replace("/upload", "/upload/w_250");
  console.log("Rendering edit form");
  resp.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, resp) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //updating other details

  const { category } = req.body.listing;
  listing = new Listing(req.body.listing);
  const validCategories = [
    "Houses",
    "Iconic cities",
    "Beach",
    "Mountain",
    "Castles",
    "Pools",
    "Camping",
    "Arctic",
    "Farms",
    "Boats",
    "Pet Rentals",
  ];
  if (!validCategories.includes(category)) {
    throw new ExpressError("Invalid category", 400);
  }
  listing.category = category;
  if (typeof req.file !== "undefined") {
    let url = req.file.path; //updating image here
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  resp.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, resp) => {
  let { id } = req.params;
  let deleted = await Listing.findByIdAndDelete(id);
  console.log(deleted);
  req.flash("success", "Listing Deleted!");
  resp.redirect("/listings");
};
