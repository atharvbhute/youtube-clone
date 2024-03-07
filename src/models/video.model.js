import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String,
        required: [true, "video must be uploaded"],
    },

    thumbnail: {
        type: String,
        required: [true, "Thumbnail must be there"]
    },

    title: {
        type: String,
        index: true,
        required: true
    },

    description: {
        type: String,
        default: ""
    },
    duration: {
        type: Number,
        required: true,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},{timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);