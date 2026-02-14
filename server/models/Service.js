import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
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
        subject: {
            type: String,
            trim: true,
            default: '',
        },
        semester: {
            type: Number,
            min: 1,
            max: 10,
        },
        type: {
            type: String,
            required: [true, 'Please select service type'],
            enum: {
                values: ['request', 'offer'],
                message: '{VALUE} is not a valid type',
            },
        },
        serviceCategory: {
            type: String,
            required: [true, 'Please select a service category'],
            enum: {
                values: ['assignment', 'project', 'notes', 'tutoring', 'lab-work', 'other'],
                message: '{VALUE} is not a valid category',
            },
        },
        price: {
            type: Number,
            min: [0, 'Price cannot be negative'],
            default: 0,
        },
        poster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'completed', 'cancelled'],
            default: 'open',
        },
        deadline: {
            type: Date,
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

serviceSchema.index({ title: 'text', description: 'text', subject: 'text' });
serviceSchema.index({ type: 1, serviceCategory: 1, status: 1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
