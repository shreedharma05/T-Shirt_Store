// base - Product.find()
// bigQ - // /api/v1/product?search=coder&page=2&category=shortsleeves&rating[gte]=4&price[gte]=199&price[lte]=999

class WhereClause {
    constructor(base, bigQ){
        this.base = base
        this.bigQ = bigQ
    }

    search(){
        const searchWord = this.bigQ.search? {
            name: {
                $regex: this.bigQ.search,
                $options: 'i'
            }
        } : {}

        this.base = this.base.find(searchWord)
        return this
    }

    filter(){

        let copyQ = {...this.bigQ}

        // console.log(copyQ);

        delete copyQ['search']
        delete copyQ['page']
        delete copyQ['limit']

        // console.log(copyQ);

        let strCopyQ = JSON.stringify(copyQ)

        // console.log(strCopyQ);

        strCopyQ = strCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`)

        // console.log(strCopyQ);

        const jsonCopyQ = JSON.parse(strCopyQ)

        // console.log(jsonCopyQ);

        this.base = this.base.find(jsonCopyQ)
        return this
    }

    pager(resultPerPage){
        let currentPage = 1

        if(this.bigQ.page){
            currentPage = this.bigQ.page
        }

        const skipVal = resultPerPage * (currentPage - 1)

        this.base = this.base.limit(resultPerPage).skip(skipVal)
        return this
    }
}

module.exports = WhereClause

