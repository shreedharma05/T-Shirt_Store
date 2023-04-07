// this is how we find from the DB
// User.find({ email: "gin@lco.dev"})
// User.find({ rating: { $gte: 4 }})

// this is how the query goes in the url
// /api/v1/product?search=coder&page=2&category=shortsleeves&rating[gte]=4&price[gte]=199
// &price[lte]=999

// the query comes as an object to us
// {
//     rating: { gte : '4'}
// }


// const p = "gte gte lte mygte"

// const regex = '/\b(gte|lte)\b/g'
// console.log(replace(regex, m => '$${m}'))

