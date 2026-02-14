import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
        },
        lastMessage: {
            text: String,
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: Date,
        },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

// ------- Message Schema -------

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: [true, 'Message cannot be empty'],
            maxlength: [2000, 'Message too long'],
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

export { Conversation, Message };
