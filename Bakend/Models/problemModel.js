import mongoose from "mongoose";
import { Schema } from "mongoose";

const problemSchema = new Schema({
    title: {
        type: String,
        required: true,

    },
    description: {
        type: String,
        required: true,

    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],

    },
    tags: [{
        type: String,
        enum: ['array', 'linkedlist', 'stack', 'queue', 'graphs', 'trees']
    }],
    visibleTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true,
            },
            explanation: {
                type: String,
                required: true,
            }
        }
    ],

    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            }
        }
    ],
    startCode: [
        {
            languages: {
                type: String,
                required: true,
            },
            initialCode: {
                type: String,
                required: true
            }
        }
    ],
    refrenceSolution:[
      {
            languages: {
                type: String,
                required: true,
            },
            completeCode: {
                type: String,
                required: true
            }
        }


    ],
    problemCreater: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});
const Problem = mongoose.model('problem', problemSchema);
export default Problem;