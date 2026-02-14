import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reviewee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

// One review per reviewer per reviewee per listing
reviewSchema.index({ reviewer: 1, reviewee: 1, listing: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
