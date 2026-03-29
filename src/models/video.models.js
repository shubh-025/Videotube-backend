import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String,  // Secure URL provided by Cloudinary after upload
        required: true
    },
    thumbnail: {
        type: String,  // Image URL provided by Cloudinary
        required: true
    },
    title: {
        type: String,  
        required: true
    },
    description: {
        type: String,  
        required: true
    },
    duration: {
        type: Number,  // Automatically extracted from Cloudinary metadata
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,  // Toggle to make video public or private
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User" // Establishes a relationship with the User who uploaded it
    }
}, { timestamps: true }); // Tracks 'createdAt' (Upload Date) and 'updatedAt'

/**
 * PLUGIN INTEGRATION:
 * Enables advanced pagination for aggregation pipelines.
 * Essential for loading videos in "pages" (e.g., 10 at a time) rather than all at once.
 */
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);