import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
            enum: {
                values: ['books', 'electronics', 'stationery', 'clothing', 'hostel', 'lab', 'other'],
                message: '{VALUE} is not a valid category',
            },
        },
        condition: {
            type: String,
            required: [true, 'Please select item condition'],
            enum: {
                values: ['new', 'like-new', 'good', 'fair'],
                message: '{VALUE} is not a valid condition',
            },
        },
        images: {
            type: [String],
            validate: {
                validator: function (v) {
                    return v.length <= 5;
                },
                message: 'Maximum 5 images allowed',
            },
            default: [],
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isNegotiable: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['active', 'sold', 'expired'],
            default: 'active',
        },
        views: {
            type: Number,
            default: 0,
        },
        college: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Index for search
listingSchema.index({ title: 'text', description: 'text' });
// Index for filtering
listingSchema.index({ category: 1, status: 1, createdAt: -1 });
listingSchema.index({ seller: 1 });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
