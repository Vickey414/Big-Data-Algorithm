// 1. provide a short description of the dataset: the most common structure of the documents
db.getCollection("tourPedia_paris").find()


/* 2. Give  the operation that retrieves one element of the collection and provide a short 
description of the element:  the attributes, and the types that are present.
*/
db.getCollection("tourPedia_paris").find("services":{$type:string})

/*
3. Retrieve the name and the contact phone of any location for which the phone number is provided
   Here the contact phone is randomly chosen
*/
db.getCollection("tourPedia_paris").find({"contact.phone":"+33 1 42 36 23 33" }, { 'name': 1, 'contact.phone': 1,'location':1 })

// 4. Show the list of structures that appear to be McDonald’s
db.getCollection("tourPedia_paris").find({"name":"McDonald's" })

// 5. Show the number of structures that are returned by the previous query
db.getCollection("tourPedia_paris").find({"name":"McDonald's" }).count()
// The result shows that there are totally 62 items where name appears to be McDonald’s

// 6. Provide the names of the structures that offer the chauffage among their services
db.getCollection("tourPedia_paris").find({'services':{$elemMatch:{$regex: 'chauffage'}}})

// 7. Give the list of structures that provide less than 3 services
// db.tourPedia_paris.aggregate([{$match:{cast:{$type: "array"}}},{$project:{count:{$size: "$services" }}}])
// First Way
db.getCollection("tourPedia_paris").find({'services':{$exists: true,"$ne":null},$where:"this.services.length <3"})
db.getCollection("tourPedia_paris").find({'services.4':{$exists: false}})

// 8. Give the list of structures that provide more than 15 services
db.getCollection("tourPedia_paris").find({'services':{$exists: true,"$ne":null},$where:"this.services.length >15"})
db.getCollection("tourPedia_paris").find({'services.16':{$exists: true}})

// 9. Show the structure (or the list of structures if many) with the greatest number of services
db.tourPedia_paris.aggregate(
       {$match:{'services':{$exists: true,"$ne":null}}},
       {$project:{contact:"$contact", name:"$name", location:"$location", category:"$category", services_size:{$size:"$services"}}},
       {$sort: {services_size:-1} },
       {$limit: 1 }
)

// 10. Provide the query that gives the list of structures that do not provide services.
db.getCollection("tourPedia_paris").find({'services': null})

/* 11. Comment about how these last structures are represented in the database: is 
the fact that a structure does not provide services matching the best practices of Mon- 
goDB data modeling? Why?
*/


/* 12. Write  the  query  that  shows  the  list  of  the  names  of  the  structures  having  an 
average rate greater than 4
*/
db.tourPedia_paris.aggregate([
  {$unwind : "$reviews"},
  {$group: {
    _id: { user:"$_id" },
    avg_rate: {$avg: "$reviews.rating" }
  }},
  {$match: {avg_rate: {$gt:4}}}
]);

/* 13. Give the query that returns the number of locations having accomodation as 
category and that provide among their services bar
*/
db.tourPedia_paris.aggregate([
  {$match :{"category":"accommodation"}},
  {$group: {
    _id: { location:"$location.city" },
    tol_nb: {$sum: 1 }
  }}
]);

// 14. Give the query that returns the number of reviews by category and language.
db.tourPedia_paris.aggregate([
  {$unwind : "$reviews"},
  {$group: {
    _id: { category:"$category",language:"$reviews.language" },
    sum_nb: {$sum: "$nbReviews" }
  }
  }
]);

// 15. Show  the  date  (if  any)  in  which  the  system  received  the  most  number  of  reviews.
db.tourPedia_paris.aggregate(
       {$unwind : "$reviews"},
       {$group:{
       _id:{date:"$reviews.time"},
       nb_reviews: {$sum: 1 }
       }},
       {$sort: {nb_reviews:-1} },
       {$limit: 1 }
)

