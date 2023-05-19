const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FilmSchema = new Schema({
    director: String,
    music: String,
    starring: String,
}, {
    toJSON: {virtuals: true}
})

FilmSchema.virtual("_links").get(
    function (){
        return {
            self: {
                href: `${process.env.BASE_URI}films/${this._id}`
            },
            collection: {
                href: `${process.env.BASE_URI}films/`
            }
        }
    }
)

module.exports = mongoose.model("Film", FilmSchema)