import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";
import cloudinary from "../config/cloudinary.js";

export const getPosts = async (req, res) => {
  try {
    const postMessages = await PostMessage.find().sort({_id: -1}).limit(5);
    res.status(200).json(postMessages);
  } catch (error) {
    res.status(404).json({ message: "no messages found" });
  }
};

export const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await PostMessage.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createPost = async (req, res) => {
  const post = req.body;
  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    created_at: new Date().toISOString(),
  });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body; 

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post exist with this id");

  const oldPostData = await PostMessage.findById(_id);

  // if the user uploads new images and videos, delete the old ones
  if (post.assets && post.assets.images && post.assets.images.length > 0) {
    // loop for each image and delete it
    for (let i = 0; i < oldPostData.assets.images.length; i++) {
      const publicId = oldPostData.assets.images[i].public_id;
      try {
        const res = await cloudinary.uploader.destroy(publicId);
        console.log(res);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to delete image" });
        return;
      }
    }
  }

  const updatedPost = await PostMessage.findByIdAndUpdate(
    _id,
    { ...post, _id },
    { new: true }
  );
  res.json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("Sorry! please select a valid post");

  const oldPostData = await PostMessage.findById(id);
  // Delete assets from cloudinary
  if (oldPostData.assets && oldPostData.assets.images && oldPostData.assets.images.length > 0) {
    // Loop for each image and delete it
    for (let i = 0; i < oldPostData.assets.images.length; i++) {
      const publicId = oldPostData.assets.images[i].public_id;
      try {
        const res = await cloudinary.uploader.destroy(publicId);
        console.log(res);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to delete image" });
        return;
      }
    }
  }

  await PostMessage.findByIdAndRemove(id);
  res.json("Post has been deleted Successfuly");
};

export const likePost = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.userId) {
      throw new Error("You've not authenticated for this action.");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Sorry! Now you cannot like this post.");
    }

    const post = await PostMessage.findById(id);

    if(!post){
      return res.status(404).json({message: "Post not found"});
    }

    const index = post.likes.findIndex((id) => id === String(req.userId));

    if (index === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(
      id,
      { likes: post.likes },
      {
        new: true,
      }
    );

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
