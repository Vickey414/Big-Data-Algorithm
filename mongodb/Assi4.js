/*Retrieve one element of the collection and provide a short description of the element. 
List if you see nested documents, lists, or any other attribute you consider worth to be commented.*/

db.getCollection("recipes_2022").find({})
// The collection have nested document field including incredients,directions


/*2. Retrieve  the  name  of  the  recipes  (Name ﬁeld)  and  the  total  time  of  preparation (Total Time)*/
db.getCollection("recipes_2022").find({},{ Name: 1, "Total Time": 1 })


/*3. Show  the  list  of  recipes  (just  their  name)  that  contain  the  word  “Lemon”  in  the name*/
db.getCollection("recipes_2022").find({"Name":{$regex:"Lemon"}})

/*4. Show the number of recipes that are returned by the previous query.*/
db.getCollection("recipes_2022").find({"Name":{$regex:"Lemon"}}).count()

/*5. Provide the name of the recipes that have Preparation Time greater than 40 minutes. 
Comment if you see something in the data representation that makes this operation not easy to be run*/
// Because the type of Prep Time field is string, it is difficult to make the number comparision without type transformation
// First we check if there are hours in the Prep Field
// Another tricky problem here is that after we split the field the type is string, so we need to use the $convert to 
// transform it into int type and get the result. We have No recipes preparation time greater than 40 minutes while here I change
// it to 20 we got the results, prove the code is right
db.getCollection("recipes_2022").find({"Prep Time":{$regex:"h"}})
// No Results
db.getCollection("recipes_2022").aggregate(
[
    {$project:
        {'_id':"$Name", 
         'Time':{"$split": ["$Prep Time"," "]}
        }
     },
      {
        $project: {
            "_id":1,
            "Time": 1,
            // We use the $arrayElemAt to get the first element of Time and call it "Time Num"
            "Time Num": {
                $convert:{
                 input:{"$arrayElemAt": [ "$Time",0]},
                 to:"int"
                }
            }
        }
      },
      {$match: {"Time Num": {$gte:20}}}
]
)



/*6. Show the recipes with the lowest number of “servings”.*/
db.getCollection("recipes_2022").aggregate([
       {$match:{'Name':{$exists: true,"$ne":null}}},
       {$group:{'_id': '$Name', 'servings_num': {'$sum': '$Servings'}}},
       {$sort:{'servings_num':1}},
       {$limit:1}
       ]
)

/*7. Look at data and provide an explication for the  existence of both the  attributes “Yield” and “Servings”.*/
// Give the recipes where the obtain yield(Not null) and provide more than 5 service
db.getCollection("recipes_2022").find(
          {
             $and:
              [
              {Yield:{$exists: true,"$ne":null}},
              {Servings: {"$gte":5}}
              ]
          }
)

/*8.Give the recipes (if any) that do not have ingredients listed.*/
// We have no recipes that do not have ingrediens listed
db.getCollection("recipes_2022").find(
    {$or: [
          {Ingredients: {$exists: false}},
          {Ingredients: null},
          {Ingredients: {$size:0}},
          ]
    }
)

/*9. Give the list of recipes that have at list 5 distinct ingredients listed.  Comment the criteria that 
you used for this distinct operation.*/
// If the size of ingredients is larger than 5, we will include it in our searching
// Because in each document of ingrefients, there is one specific and unique ingredient.
db.getCollection("recipes_2022").find(
     {'Ingredients': {'$exists':true}, '$where':'this.Ingredients.length>=5'},
)

/*10. Show the complete set of ingredients that appear in the database:  show just 
the list of names.*/
db.getCollection("recipes_2022").find(
    {},{"Ingredients.name":1}
)

/*11. Comment  on  how  the  ingredients  are  represented  in  the  database  and  on 
how it is possible to query this ﬁeld*/
db.getCollection("recipes_2022").distinct("Ingredients.name")

/*12. Find and show for each recipe 
1) the number of steps (each step is an element of the Direction ﬁeld) its preparation requires 
(the output must show the name of the recipe and the number of steps) 
2) the name of the recipe.*/
db.getCollection("recipes_2022").aggregate(
    {
        $project:
         {'Name':"$Name", 
         'Steps':{"$size":"$Directions"}
        }      }
)

/*13. Give the number of recipes by ingredient.*/
db.getCollection("recipes_2022").aggregate([
    { "$unwind": "$Ingredients" },
    {$group:
        {'_id': '$Ingredients.name',
         'RecipeCount':{ "$sum": 1 }
        }
    }
    ])
