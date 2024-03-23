import mongoose from "mongoose";

const Asset = {
  public_id: String,
  url: String,
}

const postSchema = mongoose.Schema({
  title: String,
  message: String,
  name: String,
  creator: String,
  tags: [String],
  // selectedFile: String,
  assets: {
    images: { type: [Asset], default: [] },
    videos: { type: [Asset], default: [] }
  },
  likes: { type: [String], default: [] },
  created_at: { type: Date, default: new Date() }
});

const postMessage = mongoose.model("postMessage", postSchema);

export default postMessage;
