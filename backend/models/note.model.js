// import mongoose from 'mongoose';

// // const Schema = mongoose.Schema
// const noteSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     content: { type: String, required: true},
//     tags: { type: [String], default: [] },
//     isPinned: { type: Boolean, default: false },
//     userId: {type: String, required: true}

// });

// const Note = mongoose.model('Note', noteSchema);

// export default Note;

import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
